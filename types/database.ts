export type UserRole = "admin" | "driver" | "operator";

export type TripStatus =
  | "Creado"
  | "Disponible"
  | "Asignado"
  | "En ruta"
  | "En destino"
  | "Posicionado en andén"
  | "En carga"
  | "En descarga"
  | "Disponible para retiro"
  | "Finalizado"
  | "Cancelado";

export type DockYardStatus =
  | "Vacío"
  | "Ocupado"
  | "Recurso posicionado"
  | "En espera"
  | "Bloqueado";

export type DockOperationalStatus =
  | "Habilitado"
  | "Deshabilitado"
  | "En carga"
  | "En descarga"
  | "Disponible para retiro"
  | "En mantenimiento"
  | "Cerrado temporalmente";

export type VehicleType = "Tracto" | "Rígido" | "Camión 5T" | "Furgón";

export type TransportCompany = {
  id: string;
  name: string;
};

export type Driver = {
  id: string;
  name: string;
  rut: string;
  companyId: string;
};

export type Truck = {
  id: string;
  plate: string;
  type: VehicleType;
  companyId: string;
  status: "Disponible" | "En viaje" | "En patio" | "Bloqueado";
  qrCode: string;
};

export type Dock = {
  id: string;
  code: string;
  side: "Norte" | "Sur" | "Este" | "Oeste";
  yardStatus: DockYardStatus;
  operationalStatus: DockOperationalStatus;
  currentTripId?: string;
};

export type Trip = {
  id: string;
  code: string;
  origin: string;
  destination: string;
  vehicleTypeRequired: VehicleType;
  containerCode?: string;
  driverId?: string;
  companyId: string;
  truckId?: string;
  dockId?: string;
  status: TripStatus;
  operationType: "Retiro" | "Despacho" | "Carga" | "Descarga" | "Movimiento interno";
  date: string;
};