"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import DockCard from "@/components/DockCard";
import { supabase } from "@/lib/supabase";

type DockRow = {
  id: string;
  name?: string | null;
  code?: string | null;
  status?: string | null;
  location?: string | null;
  location_id?: string | null;
  created_at?: string | null;
};

export default function DocksPage() {
  const [docks, setDocks] = useState<DockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocks() {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("docks")
        .select("*");

      if (error) {
        setErrorMessage(error.message);
        setDocks([]);
      } else {
        setDocks(data || []);
      }

      setLoading(false);
    }

    fetchDocks();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Estado de andenes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Vista inicial para revisar los andenes disponibles en la operación.
            </p>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
            Total andenes: <span className="font-semibold">{docks.length}</span>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
            Cargando andenes...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Error al cargar andenes: {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && docks.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
            No hay andenes cargados todavía en Supabase.
          </div>
        )}

        {!loading && !errorMessage && docks.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {docks.map((dock) => (
              <DockCard
                key={dock.id}
                name={dock.name || dock.code || "Andén sin nombre"}
                status={dock.status || "Disponible"}
                location={dock.location || dock.location_id || null}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}