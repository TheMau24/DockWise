type Trip = {
  id: string;
  status?: string | null;
  created_at?: string | null;
};

type TripTableProps = {
  trips: Trip[];
};

export default function TripTable({ trips }: TripTableProps) {
  if (trips.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        No hay viajes registrados todavía.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Fecha creación</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => (
            <tr key={trip.id} className="border-b border-gray-100 last:border-b-0">
              <td className="px-4 py-3 font-mono text-xs text-gray-700">
                {trip.id}
              </td>
              <td className="px-4 py-3 text-gray-800">
                {trip.status || "Sin estado"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {trip.created_at
                  ? new Date(trip.created_at).toLocaleString("es-CL")
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}