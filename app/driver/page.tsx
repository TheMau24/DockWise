"use client";

import { useState } from "react";
import Link from "next/link";
import { docks, trips, trucks } from "@/lib/mock-data";
import type { Dock, Trip, Truck } from "@/types/database";
import { LogoutButton } from "@/components/logout-button";

export default function DriverPage() {
  const [scannedTruck, setScannedTruck] = useState<Truck | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedDock, setSelectedDock] = useState<Dock | null>(null);

  const availableTrips = scannedTruck
    ? trips.filter(
        (trip) =>
          trip.companyId === scannedTruck.companyId &&
          trip.vehicleTypeRequired === scannedTruck.type &&
          ["Disponible", "Asignado", "Creado"].includes(trip.status)
      )
    : [];

  const availableDocks = docks.filter(
    (dock) =>
      dock.yardStatus === "Vacío" &&
      dock.operationalStatus === "Habilitado"
  );

  function simulateQrScan(truckId: string) {
    const truck = trucks.find((item) => item.id === truckId) ?? null;
    setScannedTruck(truck);
    setSelectedTrip(null);
    setSelectedDock(null);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <section className="mx-auto max-w-xl space-y-4">
        <Link href="/" className="text-sm font-medium text-slate-600">
          ← Volver al dashboard
        </Link>

        <header className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-5 text-white shadow">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-300">Vista mobile</p>
              <h1 className="text-2xl font-bold">Chofer</h1>
            </div>
            <LogoutButton />
          </div>
          <p className="text-sm text-slate-300">
            Escanea el camión, toma un viaje y selecciona andén al llegar.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-semibold">1. Simular escaneo QR camión</h2>
          <p className="mt-1 text-sm text-slate-500">
            Por ahora simulamos el QR con botones. Luego conectamos cámara real.
          </p>

          <div className="mt-4 grid gap-3">
            {trucks.map((truck) => (
              <button
                key={truck.id}
                onClick={() => simulateQrScan(truck.id)}
                className="rounded-xl border p-4 text-left transition hover:bg-slate-50"
              >
                <p className="font-semibold">{truck.plate}</p>
                <p className="text-sm text-slate-500">
                  {truck.type} · {truck.status}
                </p>
              </button>
            ))}
          </div>
        </section>

        {scannedTruck && (
          <section className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-lg font-semibold">2. Camión escaneado</h2>
            <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm">
              <p>
                <strong>Patente:</strong> {scannedTruck.plate}
              </p>
              <p>
                <strong>Tipo:</strong> {scannedTruck.type}
              </p>
              <p>
                <strong>Estado:</strong> {scannedTruck.status}
              </p>
              <p>
                <strong>QR:</strong> {scannedTruck.qrCode}
              </p>
            </div>
          </section>
        )}

        {scannedTruck && (
          <section className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-lg font-semibold">3. Viajes disponibles</h2>

            {availableTrips.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No hay viajes disponibles para este tipo de vehículo.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {availableTrips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className="rounded-xl border p-4 text-left transition hover:bg-slate-50"
                  >
                    <p className="font-semibold">{trip.code}</p>
                    <p className="text-sm text-slate-500">
                      {trip.origin} → {trip.destination}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Estado: {trip.status}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {selectedTrip && (
          <section className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-lg font-semibold">4. Detalle del viaje</h2>

            <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm">
              <p>
                <strong>Viaje:</strong> {selectedTrip.code}
              </p>
              <p>
                <strong>Origen:</strong> {selectedTrip.origin}
              </p>
              <p>
                <strong>Destino:</strong> {selectedTrip.destination}
              </p>
              <p>
                <strong>Operación:</strong> {selectedTrip.operationType}
              </p>
              <p>
                <strong>Estado actual:</strong> {selectedTrip.status}
              </p>
            </div>
          </section>
        )}

        {selectedTrip && (
          <section className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-lg font-semibold">5. Seleccionar andén</h2>

            {availableDocks.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No hay andenes disponibles en este momento.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {availableDocks.map((dock) => (
                  <button
                    key={dock.id}
                    onClick={() => setSelectedDock(dock)}
                    className="rounded-xl border p-4 text-left transition hover:bg-slate-50"
                  >
                    <p className="font-semibold">{dock.code}</p>
                    <p className="text-sm text-slate-500">
                      Patio: {dock.yardStatus} · Operación:{" "}
                      {dock.operationalStatus}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {selectedTrip && selectedDock && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow">
            <h2 className="text-lg font-semibold text-emerald-900">
              Posicionamiento confirmado
            </h2>
            <p className="mt-2 text-sm text-emerald-800">
              El viaje {selectedTrip.code} queda simulado como posicionado en{" "}
              {selectedDock.code}. En el siguiente módulo esto actualizará la
              base de datos real.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}