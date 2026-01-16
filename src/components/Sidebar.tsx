import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/firebase";

import {
  LayoutDashboard,
  Archive,
  PlusCircle,
  User,
  LogOut,
  UserCircle2,
} from "lucide-react";

export default function Sidebar() {
  const { user, profile } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Home", icon: LayoutDashboard },
    { to: "/vault", label: "Ghost Vault", icon: Archive },
    { to: "/ghost", label: "Submit Project", icon: PlusCircle },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

    // ✅ NEW PROFILE PAGE ENTRY (we will create it next)
    { to: "/profile", label: "Profile", icon: UserCircle2 },
  ];

  const displayName =
    profile?.ghostHandle ||
    (user?.email ? `@ghost_${user.email.split("@")[0]}` : "Anonymous Ghost 👻");

  const avatarInitial =
    (profile?.ghostHandle || user?.email || "G")[0]?.toUpperCase() || "G";

  return (
    <aside className="w-72 min-h-screen border-r border-sidebar-border bg-background relative">
      <div className="sticky top-0 h-full flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6">
            <h1 className="text-2xl font-bold">Ghost Whisperer</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Revive abandoned code.
            </p>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-sidebar-accent">
                <div className="w-9 h-9 rounded-full border bg-sidebar-accent flex items-center justify-center font-bold text-primary">
                  {avatarInitial}
                </div>

                <div className="flex flex-col">
                  {/* ✅ Ghost handle shown */}
                  <span className="text-sm font-semibold truncate">
                    {displayName}
                  </span>

                  {/* Email shown smaller */}
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={logOut}
                className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:neon-border-intense transition-all"
            >
              <User className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-20 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </aside>
  );
}
