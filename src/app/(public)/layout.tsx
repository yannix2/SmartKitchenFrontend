import { LandingNav } from "@/components/layout/landing-nav";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNav />

      {/* Spacer for fixed header */}
      <main className="flex-1 pt-16">{children}</main>

      <SiteFooter />
    </div>
  );
}
