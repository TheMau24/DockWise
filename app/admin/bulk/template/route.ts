import { NextResponse } from "next/server";
import { buildTemplateCsv, isEntityKey } from "../entities";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity") || "";

  if (!isEntityKey(entity)) {
    return NextResponse.json({ error: "Entidad inválida" }, { status: 400 });
  }

  const csv = buildTemplateCsv(entity);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="plantilla-${entity}.csv"`,
    },
  });
}
