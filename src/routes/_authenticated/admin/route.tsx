import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { LayoutDashboard, ListMusic, MessageSquare, Settings, Users } from "lucide-react";

import { checkIsAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  // `userId` comes from the parent `_authenticated` route's beforeLoad — this
  // route only adds the admin-role check on top of the session check already
  // enforced there.
  beforeLoad: async ({ context }) => {
    const isAdmin = await checkIsAdmin(context.userId);
    if (!isAdmin) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Admin | Dany Beats" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/beats", label: "Beats", icon: ListMusic },
  { to: "/admin/comments", label: "Comments", icon: MessageSquare },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="font-display text-sm font-semibold tracking-tighter uppercase">
            Dany Beats — Admin
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Back to site
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-2 sm:px-8">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item && item.exact }}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              activeProps={{ className: cn("bg-surface text-foreground") }}
            >
              <span className="inline-flex items-center gap-1.5">
                <item.icon className="size-3.5" aria-hidden="true" />
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
