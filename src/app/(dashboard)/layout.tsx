import { UserShell } from "@/components/layout/user-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserShell>{children}</UserShell>;
}
