"use client";

import { useActionState } from "react";
import { importRows } from "./actions";
import { emptyResult, type EntityKey } from "./entities";

export default function BulkImporter({
  entityKey,
  label,
  description,
  headers,
  count,
}: {
  entityKey: EntityKey;
  label: string;
  description: string;
  headers: string[];
  count: number;
}) {
  const [state, formAction, pending] = useActionState(importRows, emptyResult);
  const showResult = state.entity === entityKey && state.message;

  return (
    <article className="rounded-2xl bg-white p-5 shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {label}{" "}
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
              {count} cargados
            </span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <a
            href={`/admin/bulk/template?entity=${entityKey}`}
            className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-700"
          >
            Plantilla vacía
          </a>
          <a
            href={`/admin/bulk/export?entity=${entityKey}`}
            className="rounded-lg bg-slate-800 px-3 py-2 text-center text-xs font-medium text-white"
          >
            Exportar datos
          </a>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Columnas: {headers.join(", ")}. Para editar: usa "Exportar datos" (trae
        la columna id), modifica y vuelve a subir — las filas con id se
        actualizan.
      </p>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="entity" value={entityKey} />
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {pending ? "Importando..." : "Importar CSV"}
        </button>
      </form>

      {showResult && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
          <p className="font-medium text-slate-800">{state.message}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
              {state.created} creados
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
              {state.updated} actualizados
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700">
              {state.skipped} omitidos
            </span>
            <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">
              {state.errors.length} errores
            </span>
          </div>
          {state.errors.length > 0 && (
            <ul className="mt-2 max-h-40 list-disc overflow-y-auto pl-5 text-xs text-red-700">
              {state.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
