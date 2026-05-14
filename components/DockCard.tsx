type DockCardProps = {
  name: string;
  status?: string | null;
  location?: string | null;
};

export default function DockCard({ name, status, location }: DockCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {location && <p className="text-sm text-gray-500">{location}</p>}
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {status || "Sin estado"}
        </span>
      </div>
    </div>
  );
}