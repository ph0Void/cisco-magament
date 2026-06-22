"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Network, MessageSquare, LogOut, Activity, Users, Logs, MessageCircleWarning, Router, Cable } from "lucide-react";
import { logoutAction } from "@/action/AuthAction";
import { useTopologyStore } from "@/store/topologyStore";

interface SideBarProps {
  username: string;
  rol: string;
}

export default function SideBar({ username, rol }: SideBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const clearStore = useTopologyStore((state) => state.clearStore);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Workspace", path: "/dashboard/workspace", icon: Network },
    { name: "Devices", path: "/dashboard/device", icon: Router },
    { name: "Chat", path: "/dashboard/chat", icon: MessageSquare },
  ];

  if (rol === "ADMIN" || rol === "STAFF") {
    menuItems.push({ name: "Log", path: "/dashboard/log", icon: Logs });
    menuItems.push({ name: "Alert", path: "/dashboard/alert", icon: MessageCircleWarning });
    menuItems.push({ name: "Topologies", path: "/dashboard/topology", icon: Cable });
  }
  if (rol === "ADMIN") {
    menuItems.push({ name: "User", path: "/dashboard/users", icon: Users });
  }

  const handleLogout = async () => {
    await logoutAction();
    clearStore();
    router.push("/auth");
  };

  return (
    <aside className="w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col justify-between shrink-0 transition-colors duration-200">
      <div>
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center border border-sidebar-border">
              <Activity className="w-5 h-5 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-wider text-sidebar-primary">
                CISCO MANAGEMENT
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group border ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border"
                  : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent border-transparent"
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60"}`} />
                <p className="text-sm font-semibold tracking-wide">{item.name}</p>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Profile & Logout */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        {username && (
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold text-sm">
              {username.substring(0, 2).toUpperCase()}
            </div>
            <p className="text-sm font-semibold truncate">{username}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}