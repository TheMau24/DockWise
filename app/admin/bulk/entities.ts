// Configuración de las entidades que se pueden cargar masivamente.
// Sin dependencias de Prisma para poder usarse tanto en la página como en el
// route handler de descarga de plantillas.

export type EntityKey =
  | "mandantes"
  | "companies"
  | "trucks"
  | "docks"
  | "containers"
  | "origins"
  | "destinations"
  | "drivers";

export type EntityConfig = {
  label: string;
  description: string;
  headers: string[];
  example: string[][];
};

export const ENTITIES: Record<EntityKey, EntityConfig> = {
  mandantes: {
    label: "Mandantes",
    description:
      "Clientes que subcontratan transportistas (ej: Falabella, IKEA). Columnas: name (obligatorio), rut (opcional). Luego vincula sus empresas en Mandantes.",
    headers: ["name", "rut"],
    example: [
      ["Falabella", "90.000.000-1"],
      ["IKEA", ""],
    ],
  },
  companies: {
    label: "Empresas de transporte",
    description: "Columnas: name (obligatorio), rut (opcional).",
    headers: ["name", "rut"],
    example: [
      ["Transportes IKEA", "76.123.456-7"],
      ["Logística Sur", ""],
    ],
  },
  trucks: {
    label: "Camiones",
    description:
      "type: TRACTO/RIGIDO/CAMION_5T/FURGON. status: DISPONIBLE/EN_VIAJE/EN_PATIO/BLOQUEADO/MANTENCION. company = nombre exacto de una empresa existente. qrCode opcional (se autogenera).",
    headers: ["plate", "type", "status", "company", "qrCode"],
    example: [
      ["ABCD-12", "TRACTO", "DISPONIBLE", "Transportes IKEA", ""],
      ["WXYZ-34", "FURGON", "DISPONIBLE", "Logística Sur", "QR-WXYZ-34"],
    ],
  },
  docks: {
    label: "Andenes",
    description:
      "yardStatus: VACIO/OCUPADO/RECURSO_POSICIONADO/EN_ESPERA/BLOQUEADO. operationalStatus: HABILITADO/DESHABILITADO/EN_CARGA/EN_DESCARGA/DISPONIBLE_PARA_RETIRO/EN_MANTENIMIENTO/CERRADO_TEMPORALMENTE. side opcional.",
    headers: ["code", "side", "yardStatus", "operationalStatus"],
    example: [
      ["ANDEN-01", "Norte", "VACIO", "HABILITADO"],
      ["ANDEN-02", "Sur", "VACIO", "HABILITADO"],
    ],
  },
  containers: {
    label: "Contenedores",
    description: "Columna: code (obligatorio, único).",
    headers: ["code"],
    example: [["CONT-0001"], ["CONT-0002"]],
  },
  origins: {
    label: "Orígenes",
    description: "Columna: name (obligatorio).",
    headers: ["name"],
    example: [["Bodega Central"], ["Puerto San Antonio"]],
  },
  destinations: {
    label: "Destinos",
    description: "Columna: name (obligatorio).",
    headers: ["name"],
    example: [["Tienda IKEA Norte"], ["Centro de Distribución"]],
  },
  drivers: {
    label: "Choferes",
    description:
      "name y rut obligatorios (rut único). phone opcional. company = nombre exacto de una empresa existente.",
    headers: ["name", "rut", "phone", "company"],
    example: [
      ["Juan Pérez", "11.111.111-1", "+56911111111", "Transportes IKEA"],
      ["Ana Soto", "22.222.222-2", "", "Logística Sur"],
    ],
  },
};

export type ImportResult = {
  ok: boolean;
  entity: EntityKey | null;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  message: string;
};

export const emptyResult: ImportResult = {
  ok: false,
  entity: null,
  created: 0,
  updated: 0,
  skipped: 0,
  errors: [],
  message: "",
};

export const ENTITY_KEYS = Object.keys(ENTITIES) as EntityKey[];

export function isEntityKey(value: string): value is EntityKey {
  return value in ENTITIES;
}

/** Genera el contenido CSV de la plantilla (cabeceras + filas de ejemplo). */
export function buildTemplateCsv(key: EntityKey): string {
  const { headers, example } = ENTITIES[key];
  const escape = (v: string) =>
    /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  const lines = [headers.join(",")];
  for (const row of example) {
    lines.push(row.map(escape).join(","));
  }
  return lines.join("\n") + "\n";
}
