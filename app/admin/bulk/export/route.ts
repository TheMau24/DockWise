import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEntityKey, type EntityKey } from "../entities";

function toCsv(headers: string[], rows: (string | null)[][]): string {
  const escape = (v: string | null) => {
    const s = v ?? "";
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(row.map(escape).join(","));
  return lines.join("\n") + "\n";
}

async function buildExport(
  entity: EntityKey
): Promise<{ headers: string[]; rows: (string | null)[][] }> {
  switch (entity) {
    case "mandantes": {
      const data = await prisma.mandante.findMany({ orderBy: { name: "asc" } });
      return {
        headers: ["id", "name", "rut", "active"],
        rows: data.map((d) => [d.id, d.name, d.rut, String(d.active)]),
      };
    }
    case "companies": {
      const data = await prisma.transportCompany.findMany({
        orderBy: { name: "asc" },
      });
      return {
        headers: ["id", "name", "rut", "active"],
        rows: data.map((d) => [d.id, d.name, d.rut, String(d.active)]),
      };
    }
    case "trucks": {
      const data = await prisma.truck.findMany({
        orderBy: { plate: "asc" },
        include: { transportCompany: true },
      });
      return {
        headers: ["id", "plate", "type", "status", "company", "qrCode", "active"],
        rows: data.map((d) => [
          d.id,
          d.plate,
          d.type,
          d.status,
          d.transportCompany.name,
          d.qrCode,
          String(d.active),
        ]),
      };
    }
    case "docks": {
      const data = await prisma.dock.findMany({ orderBy: { code: "asc" } });
      return {
        headers: [
          "id",
          "code",
          "side",
          "yardStatus",
          "operationalStatus",
          "active",
        ],
        rows: data.map((d) => [
          d.id,
          d.code,
          d.side,
          d.yardStatus,
          d.operationalStatus,
          String(d.active),
        ]),
      };
    }
    case "containers": {
      const data = await prisma.container.findMany({ orderBy: { code: "asc" } });
      return {
        headers: ["id", "code", "active"],
        rows: data.map((d) => [d.id, d.code, String(d.active)]),
      };
    }
    case "origins": {
      const data = await prisma.origin.findMany({ orderBy: { name: "asc" } });
      return {
        headers: ["id", "name", "active"],
        rows: data.map((d) => [d.id, d.name, String(d.active)]),
      };
    }
    case "destinations": {
      const data = await prisma.destination.findMany({
        orderBy: { name: "asc" },
      });
      return {
        headers: ["id", "name", "active"],
        rows: data.map((d) => [d.id, d.name, String(d.active)]),
      };
    }
    case "drivers": {
      const data = await prisma.driver.findMany({
        orderBy: { name: "asc" },
        include: { transportCompany: true },
      });
      return {
        headers: ["id", "name", "rut", "phone", "company", "active"],
        rows: data.map((d) => [
          d.id,
          d.name,
          d.rut,
          d.phone,
          d.transportCompany.name,
          String(d.active),
        ]),
      };
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity") || "";

  if (!isEntityKey(entity)) {
    return NextResponse.json({ error: "Entidad inválida" }, { status: 400 });
  }

  const { headers, rows } = await buildExport(entity);
  const csv = toCsv(headers, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="datos-${entity}.csv"`,
    },
  });
}
