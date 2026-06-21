"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export type PositioningState = {
  ok: boolean;
  message: string;
};

/**
 * Confirma el posicionamiento de un viaje en un andén:
 * - Asigna camión (y chofer si aplica) al viaje y lo pasa a POSICIONADO_EN_ANDEN.
 * - Marca el andén con recurso posicionado.
 * - Pasa el camión a EN_PATIO.
 * - Registra el cambio en el historial.
 */
export async function confirmPositioning(
  _prevState: PositioningState,
  formData: FormData
): Promise<PositioningState> {
  const tripId = String(formData.get("tripId") || "");
  const truckId = String(formData.get("truckId") || "");
  const dockId = String(formData.get("dockId") || "");
  const driverId = String(formData.get("driverId") || "");

  if (!tripId || !truckId || !dockId) {
    return { ok: false, message: "Faltan datos para confirmar el posicionamiento." };
  }

  const [trip, dock, truck] = await Promise.all([
    prisma.trip.findUnique({ where: { id: tripId } }),
    prisma.dock.findUnique({ where: { id: dockId } }),
    prisma.truck.findUnique({ where: { id: truckId } }),
  ]);

  if (!trip || !dock || !truck) {
    return { ok: false, message: "Viaje, andén o camión no encontrado." };
  }

  if (dock.yardStatus !== "VACIO" || dock.operationalStatus !== "HABILITADO") {
    return { ok: false, message: "El andén ya no está disponible. Elige otro." };
  }

  if (trip.truckId && trip.truckId !== truckId) {
    return { ok: false, message: "El viaje ya fue tomado por otro camión." };
  }

  await prisma.$transaction([
    prisma.trip.update({
      where: { id: tripId },
      data: {
        truckId,
        dockId,
        driverId: driverId || trip.driverId,
        status: "POSICIONADO_EN_ANDEN",
      },
    }),
    prisma.dock.update({
      where: { id: dockId },
      data: { yardStatus: "RECURSO_POSICIONADO" },
    }),
    prisma.truck.update({
      where: { id: truckId },
      data: { status: "EN_PATIO" },
    }),
  ]);

  const user = await getSessionUser();
  await prisma.changeLog.create({
    data: {
      entityName: "Trip",
      entityId: tripId,
      action: "POSITION_AT_DOCK",
      oldValue: {
        status: trip.status,
        dockId: trip.dockId,
        truckId: trip.truckId,
      },
      newValue: { status: "POSICIONADO_EN_ANDEN", dockId, truckId },
      userId: user?.id ?? null,
      tripId,
    },
  });

  revalidatePath("/driver");
  revalidatePath("/operator");
  revalidatePath("/");

  return {
    ok: true,
    message: `Viaje ${trip.code} posicionado en andén ${dock.code}.`,
  };
}
