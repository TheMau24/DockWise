"use server";

import { revalidatePath } from "next/cache";
import {
  DockOperationalStatus,
  DockYardStatus,
  TruckStatus,
  VehicleType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isEntityKey, emptyResult, type ImportResult } from "./entities";

/** Parser CSV con soporte de comillas dobles y saltos de línea dentro de campos. */
function parseCsv(input: string): string[][] {
  const text = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  row.push(field);
  rows.push(row);

  // Descartar filas totalmente vacías.
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/** Convierte filas CSV en objetos usando la primera fila como cabecera. */
function toRecords(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}

async function companyNameToId(): Promise<Map<string, string>> {
  const companies = await prisma.transportCompany.findMany({
    select: { id: true, name: true },
  });
  const map = new Map<string, string>();
  for (const c of companies) map.set(c.name.trim().toLowerCase(), c.id);
  return map;
}

export async function importRows(
  _prev: ImportResult,
  formData: FormData
): Promise<ImportResult> {
  const entity = String(formData.get("entity") || "");
  const file = formData.get("file");

  if (!isEntityKey(entity)) {
    return { ...emptyResult, message: "Entidad inválida." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ...emptyResult, entity, message: "Selecciona un archivo CSV." };
  }

  const text = await file.text();
  const records = toRecords(parseCsv(text));

  if (records.length === 0) {
    return { ...emptyResult, entity, message: "El archivo no tiene filas de datos." };
  }
  if (records.length > 5000) {
    return {
      ...emptyResult,
      entity,
      message: "Máximo 5000 filas por archivo.",
    };
  }

  const errors: string[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const parseActive = (v: string | undefined): boolean => {
    const s = (v ?? "").trim().toLowerCase();
    if (s === "") return true;
    return !["false", "0", "no", "inactivo", "inactiva"].includes(s);
  };

  const companies =
    entity === "trucks" || entity === "drivers"
      ? await companyNameToId()
      : null;

  for (let idx = 0; idx < records.length; idx++) {
    const row = records[idx];
    const line = idx + 2; // +1 cabecera, +1 base 1
    try {
      const editId = (row.id || "").trim();

      if (entity === "mandantes") {
        const name = row.name;
        if (!name) {
          errors.push(`Fila ${line}: falta name.`);
          continue;
        }
        const data = { name, rut: row.rut || null, active: parseActive(row.active) };
        if (editId) {
          await prisma.mandante.update({ where: { id: editId }, data });
          updated++;
        } else {
          const exists = await prisma.mandante.findFirst({ where: { name } });
          if (exists) {
            skipped++;
            continue;
          }
          await prisma.mandante.create({ data });
          created++;
        }
      } else if (entity === "companies") {
        const name = row.name;
        if (!name) {
          errors.push(`Fila ${line}: falta name.`);
          continue;
        }
        const data = { name, rut: row.rut || null, active: parseActive(row.active) };
        if (editId) {
          await prisma.transportCompany.update({ where: { id: editId }, data });
          updated++;
        } else {
          const exists = await prisma.transportCompany.findFirst({
            where: { name },
          });
          if (exists) {
            skipped++;
            continue;
          }
          await prisma.transportCompany.create({ data });
          created++;
        }
      } else if (entity === "trucks") {
        const plate = row.plate?.toUpperCase();
        if (!plate) {
          errors.push(`Fila ${line}: falta plate.`);
          continue;
        }
        const type = row.type as VehicleType;
        if (!Object.values(VehicleType).includes(type)) {
          errors.push(`Fila ${line}: type inválido (${row.type}).`);
          continue;
        }
        const status = (row.status || "DISPONIBLE") as TruckStatus;
        if (!Object.values(TruckStatus).includes(status)) {
          errors.push(`Fila ${line}: status inválido (${row.status}).`);
          continue;
        }
        const companyId = companies?.get((row.company || "").toLowerCase());
        if (!companyId) {
          errors.push(`Fila ${line}: empresa no encontrada (${row.company}).`);
          continue;
        }
        if (editId) {
          await prisma.truck.update({
            where: { id: editId },
            data: {
              plate,
              type,
              status,
              active: parseActive(row.active),
              transportCompanyId: companyId,
              ...(row.qrcode ? { qrCode: row.qrcode } : {}),
            },
          });
          updated++;
        } else {
          const qrCode = row.qrcode || `QR-TRUCK-${plate.replaceAll(" ", "-")}`;
          const exists = await prisma.truck.findFirst({
            where: { OR: [{ plate }, { qrCode }] },
          });
          if (exists) {
            skipped++;
            continue;
          }
          await prisma.truck.create({
            data: {
              plate,
              type,
              status,
              qrCode,
              active: parseActive(row.active),
              transportCompanyId: companyId,
            },
          });
          created++;
        }
      } else if (entity === "docks") {
        const code = row.code?.toUpperCase();
        if (!code) {
          errors.push(`Fila ${line}: falta code.`);
          continue;
        }
        const yardStatus = (row.yardstatus || "VACIO") as DockYardStatus;
        if (!Object.values(DockYardStatus).includes(yardStatus)) {
          errors.push(`Fila ${line}: yardStatus inválido (${row.yardstatus}).`);
          continue;
        }
        const operationalStatus = (row.operationalstatus ||
          "HABILITADO") as DockOperationalStatus;
        if (!Object.values(DockOperationalStatus).includes(operationalStatus)) {
          errors.push(
            `Fila ${line}: operationalStatus inválido (${row.operationalstatus}).`
          );
          continue;
        }
        const data = {
          code,
          side: row.side || null,
          yardStatus,
          operationalStatus,
          active: parseActive(row.active),
        };
        if (editId) {
          await prisma.dock.update({ where: { id: editId }, data });
          updated++;
        } else {
          const exists = await prisma.dock.findUnique({ where: { code } });
          if (exists) {
            skipped++;
            continue;
          }
          await prisma.dock.create({ data });
          created++;
        }
      } else if (entity === "containers") {
        const code = row.code?.toUpperCase();
        if (!code) {
          errors.push(`Fila ${line}: falta code.`);
          continue;
        }
        if (editId) {
          await prisma.container.update({
            where: { id: editId },
            data: { code, active: parseActive(row.active) },
          });
          updated++;
        } else {
          const exists = await prisma.container.findUnique({ where: { code } });
          if (exists) {
            skipped++;
            continue;
          }
          await prisma.container.create({
            data: { code, active: parseActive(row.active) },
          });
          created++;
        }
      } else if (entity === "origins" || entity === "destinations") {
        const name = row.name;
        if (!name) {
          errors.push(`Fila ${line}: falta name.`);
          continue;
        }
        const data = { name, active: parseActive(row.active) };
        if (entity === "origins") {
          if (editId) {
            await prisma.origin.update({ where: { id: editId }, data });
            updated++;
          } else {
            const exists = await prisma.origin.findFirst({ where: { name } });
            if (exists) {
              skipped++;
              continue;
            }
            await prisma.origin.create({ data });
            created++;
          }
        } else {
          if (editId) {
            await prisma.destination.update({ where: { id: editId }, data });
            updated++;
          } else {
            const exists = await prisma.destination.findFirst({
              where: { name },
            });
            if (exists) {
              skipped++;
              continue;
            }
            await prisma.destination.create({ data });
            created++;
          }
        }
      } else if (entity === "drivers") {
        const name = row.name;
        const rut = row.rut;
        if (!name || !rut) {
          errors.push(`Fila ${line}: faltan name o rut.`);
          continue;
        }
        const companyId = companies?.get((row.company || "").toLowerCase());
        if (!companyId) {
          errors.push(`Fila ${line}: empresa no encontrada (${row.company}).`);
          continue;
        }
        const data = {
          name,
          rut,
          phone: row.phone || null,
          active: parseActive(row.active),
          transportCompanyId: companyId,
        };
        if (editId) {
          await prisma.driver.update({ where: { id: editId }, data });
          updated++;
        } else {
          const exists = await prisma.driver.findUnique({ where: { rut } });
          if (exists) {
            skipped++;
            continue;
          }
          await prisma.driver.create({ data });
          created++;
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error desconocido";
      errors.push(`Fila ${line}: ${msg}`);
    }
  }

  revalidatePath("/admin/masters");
  revalidatePath("/admin/masters/operations");
  revalidatePath("/admin/mandantes");

  return {
    ok: true,
    entity,
    created,
    updated,
    skipped,
    errors: errors.slice(0, 50),
    message: `Importación finalizada: ${created} creados, ${updated} actualizados, ${skipped} omitidos, ${errors.length} con error.`,
  };
}
