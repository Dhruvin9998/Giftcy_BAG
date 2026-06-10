import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Portal — Giftcy" }] }),
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading) {
      const isAuthorized = user && ["admin", "super-admin", "staff"].includes(user.role);
      
      // Handle base path redirect
      if (loc.pathname === "/admin") {
        if (isAuthorized) {
          nav({ to: "/admin/dashboard" });
        } else {
          nav({ to: "/admin/login" });
        }
      } 
      // Handle dashboard access validation
      else if (loc.pathname.startsWith("/admin/dashboard")) {
        if (!isAuthorized) {
          nav({ to: "/admin/login" });
        }
      }
    }
  }, [user, loading, loc.pathname, nav]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-serif text-muted-foreground animate-pulse">
        Checking administrative session…
      </div>
    );
  }

  return <Outlet />;
}
