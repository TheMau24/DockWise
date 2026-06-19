import { requireRole } from "@/lib/auth";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["DRIVER"]);
  return <>{children}</>;
}
