"use client";

import { useActionState, useEffect, useState } from "react";
import { confirmPositioning, type PositioningState } from "./actions";

type Truck = {
  id: string;
  plate: string;
  type: string;
  status: string;
  transportCompanyId: string;
  companyName: string;
  qrCode: string;
};

type Trip = {
  id: string;
  code: string;
  status: string;
  operationType: string;
  transportCompanyId: string;
  companyName: string;
  origin: string;
  destination: string;
  containerCode: string | null;
};

type Dock = {
  id: string;
  code: string;
  side: string | null;
  yardStatus: string;
  operationalStatus: string;
};

const initialState: PositioningState = { ok: false, message: "" };

export default function DriverFlow({
  trucks,
  trips,
  docks,
  driverId,
}: {
  trucks: Truck[];
  trips: Trip[];
  docks: Dock[];
  driverId: string | null;
}) {
  const [scannedTruckId, setScannedTruckId] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedDockId, setSelectedDockId] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    confirmPositioning,
    initialState
  );

  // Al confirmar con éxito, reinicia el flujo (los datos ya se revalidaron).
  useEffect(() => {
    if (state.ok) {
      setSelectedTripId(null);
      setSelectedDockId(null);
    }
  }, [state.ok]);

  const scannedTruck = trucks.find((t) => t.id === scannedTruckId) ?? null;
  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? null;
  const selectedDock = docks.find((d) => d.id === selectedDockId) ?? null;

  const availableTrips = scannedTruck
    ? trips.filter((t) => t.transportCompanyId === scannedTruck.transportCompanyId)
    : [];

  function scanTruck(truckId: string) {
    setScannedTruckId(truckId);
    setSelectedTripId(null);
    setSelectedDockId(null);
  }

  return (
    <div className="space-y-4">
      {state.message && (
        <p
          className={
            "rounded-2xl px-4 py-3 text-sm " +
            (state.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700")
          }
        >
          {state.message}
        </p>
      )}

      {/* 1. Escaneo de camión */}
      <section className="rounded-2xl bg-white p-5 shadow">
        <h2 className="text-lg font-semibold">1. Escanear camión (QR)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Selecciona el camión para simular el escaneo del QR.
        </p>

        {trucks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No hay camiones activos registrados.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {trucks.map((truck) => (
              <button
                key={truck.id}
                onClick={() => scanTruck(truck.id)}
                className={
                  "rounded-xl border p-4 text-left transition hover:bg-slate-50 " +
                  (scannedTruckId === truck.id
                    ? "border-slate-900 bg-slate-50"
                    : "")
                }
              >
                <p className="font-semibold">{truck.plate}</p>
                <p className="text-sm text-slate-500">
                  {truck.type} · {truck.status} · {truck.companyName}
                </p>
              </button>
            ))}
          </div>
        )}
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
              <strong>Empresa:</strong> {scannedTruck.companyName}
            </p>
            <p>
              <strong>QR:</strong> {scannedTruck.qrCode}
            </p>
          </div>
        </section>
      )}

      {/* 3. Viajes disponibles */}
      {scannedTruck && (
        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-semibold">3. Viajes disponibles</h2>

          {availableTrips.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No hay viajes disponibles para la empresa de este camión.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {availableTrips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTripId(trip.id)}
                  className={
                    "rounded-xl border p-4 text-left transition hover:bg-slate-50 " +
                    (selectedTripId === trip.id
                      ? "border-slate-900 bg-slate-50"
                      : "")
                  }
                >
                  <p className="font-semibold">{trip.code}</p>
                  <p className="text-sm text-slate-500">
                    {trip.origin} → {trip.destination}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {trip.operationType} · Estado: {trip.status}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. Seleccionar andén */}
      {selectedTrip && (
        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-semibold">4. Seleccionar andén</h2>

          {docks.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No hay andenes disponibles (vacíos y habilitados) en este momento.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {docks.map((dock) => (
                <button
                  key={dock.id}
                  onClick={() => setSelectedDockId(dock.id)}
                  className={
                    "rounded-xl border p-4 text-left transition hover:bg-slate-50 " +
                    (selectedDockId === dock.id
                      ? "border-slate-900 bg-slate-50"
                      : "")
                  }
                >
                  <p className="font-semibold">{dock.code}</p>
                  <p className="text-sm text-slate-500">
                    {dock.side || "Sin sector"} · Patio: {dock.yardStatus}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. Confirmar */}
      {scannedTruck && selectedTrip && selectedDock && (
        <form
          action={formAction}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow"
        >
          <h2 className="text-lg font-semibold text-emerald-900">
            5. Confirmar posicionamiento
          </h2>
          <p className="mt-2 text-sm text-emerald-800">
            Viaje <strong>{selectedTrip.code}</strong> con camión{" "}
            <strong>{scannedTruck.plate}</strong> en andén{" "}
            <strong>{selectedDock.code}</strong>.
          </p>

          <input type="hidden" name="tripId" value={selectedTrip.id} />
          <input type="hidden" name="truckId" value={scannedTruck.id} />
          <input type="hidden" name="dockId" value={selectedDock.id} />
          <input type="hidden" name="driverId" value={driverId ?? ""} />

          <button
            type="submit"
            disabled={pending}
            className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {pending ? "Confirmando..." : "Confirmar posicionamiento"}
          </button>
        </form>
      )}
    </div>
  );
}
