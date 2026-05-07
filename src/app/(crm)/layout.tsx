import { CrmShell } from "@/components/layout/crm-shell";
import type { ReactNode } from "react";

export default function CrmLayout({ children }: { children: ReactNode }) {
  return <CrmShell>{children}</CrmShell>;
}
