import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Dockwise
          </p>
          <h1 className="text-xl font-bold text-gray-900">
            Control de transporte y andenes
          </h1>
        </div>

        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-950">
            Dashboard
          </Link>
          <Link href="/docks" className="text-gray-600 hover:text-gray-950">
            Andenes
          </Link>
          <Link href="/trips" className="text-gray-600 hover:text-gray-950">
            Viajes
          </Link>
        </nav>
      </div>
    </header>
  );
}