import type { Dock, Driver, TransportCompany, Trip, Truck } from "@/types/database";

export const transportCompanies: TransportCompany[] = [
  { id: "company-1", name: "Transportes Leslie" },
  { id: "company-2", name: "Flota Interna" },
];

export const drivers: Driver[] = [
  {
    id: "driver-1",
    name: "Juan Pérez",
    rut: "12.345.678-9",
    companyId: "company-1",
  },
];

export const trucks: Truck[] = [
  {
    id: "truck-1",
    plate: "ABCD-12",
    type: "Tracto",
    companyId: "company-1",
    status: "Disponible",
    qrCode: "QR-TRUCK-ABCD12",
  },
  {
    id: "truck-2",
    plate: "WXYZ-34",
    type: "Rígido",
    companyId: "company-1",
    status: "Disponible",
    qrCode: "QR-TRUCK-WXYZ34",
  },
];

export const docks: Dock[] = [
  {
    id: "dock-1",
    code: "ANDÉN 01",
    side: "Norte",
    yardStatus: "Vacío",
    operationalStatus: "Habilitado",
  },
  {
    id: "dock-2",
    code: "ANDÉN 02",
    side: "Norte",
    yardStatus: "Ocupado",
    operationalStatus: "En carga",
    currentTripId: "trip-1",
  },
  {
    id: "dock-3",
    code: "ANDÉN 03",
    side: "Sur",
    yardStatus: "Bloqueado",
    operationalStatus: "En mantenimiento",
  },
];

export const trips: Trip[] = [
  {
    id: "trip-1",
    code: "VIAJE-001",
    origin: "CD Pudahuel",
    destination: "Parque Arauco",
    vehicleTypeRequired: "Tracto",
    containerCode: "CONT-001",
    driverId: "driver-1",
    companyId: "company-1",
    truckId: "truck-1",
    dockId: "dock-2",
    status: "En carga",
    operationType: "Despacho",
    date: "2026-05-14",
  },
  {
    id: "trip-2",
    code: "VIAJE-002",
    origin: "CD Pudahuel",
    destination: "Plaza Oeste",
    vehicleTypeRequired: "Rígido",
    companyId: "company-1",
    status: "Disponible",
    operationType: "Descarga",
    date: "2026-05-14",
  },
];