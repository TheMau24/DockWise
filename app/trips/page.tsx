"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import TripTable from "@/components/TripTable";
import { supabase } from "@/lib/supabase";

type TripRow = {
  id: string;
  status?: string | null;
  vehicle_id?: string | null;
  driver_id?: string | null;
  container_id?: string | null;
  origin_dock_id?: string | null;
  destination_dock_id?: string | null;
  created_at?: string | null;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setTrips([]);
      } else {
        setTrips(data || []);
      }

      setLoading(false);
    }

    fetchTrips();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Viajes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Listado de movimientos creados en Dockwise.
            </p>
          </div>

          <Link
            href="/trips/new"
            className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Crear nuevo viaje
          </Link>
        </div>

        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
            Cargando viajes...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Error al cargar viajes: {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && (
          <TripTable trips={trips} />
        )}
      </section>
    </main>
  );
}