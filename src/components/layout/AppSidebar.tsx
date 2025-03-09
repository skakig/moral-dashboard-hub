
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Users,
  ClipboardList,
  LineChart,
  PieChart,
  MessageSquare,
  FileText,
  User,
  LucideIcon,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SidebarGroup, SidebarItem, SidebarMenu } from "@/components/ui/sidebar";

export default function AppSidebar() {
  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b px-6">
          <Link to="/" className="flex items-center gap-2 py-5">
            <div className="size-6 rounded-lg bg-primary"></div>
            <span className="text-xl font-semibold">TMH Admin</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <MainMenu />
          <AnalyticsMenu />
          <ContentMenu />
        </SidebarContent>
        <SidebarFooter className="border-t px-6 py-5">
          <div className="flex w-full items-center justify-between">
            <Link
              to="/settings"
              className="group flex items-center gap-3.5 text-sm text-muted-foreground/80 transition-colors hover:text-primary"
            >
              <Settings
                strokeWidth={1.5}
                size={20}
                className="group-hover:text-primary"
              />
              Settings
            </Link>
            <Link
              to="/profile"
              className="group flex items-center gap-3.5 text-sm text-muted-foreground/80 transition-colors hover:text-primary"
            >
              <User
                strokeWidth={1.5}
                size={20}
                className="group-hover:text-primary"
              />
              Profile
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}

interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const MainMenu = () => {
  const { pathname } = useLocation();

  const items: MenuItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      href: "/users",
      icon: Users,
    },
    {
      title: "Assessments",
      href: "/assessments",
      icon: ClipboardList,
    },
    {
      title: "Affiliates",
      href: "/affiliates",
      icon: Handshake,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarMenu title="Main">
        {items.map((item) => (
          <Link key={item.href} to={item.href}>
            <SidebarItem
              icon={<item.icon strokeWidth={1.5} size={20} />}
              active={pathname === item.href}
              className={cn(
                "transition-colors",
                pathname === item.href
                  ? "bg-muted text-foreground hover:bg-muted"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {item.title}
            </SidebarItem>
          </Link>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

const AnalyticsMenu = () => {
  const { pathname } = useLocation();

  const items: MenuItem[] = [
    {
      title: "Demographics",
      href: "/demographics",
      icon: PieChart,
    },
    {
      title: "Performance",
      href: "/insights",
      icon: BarChart3,
    },
    {
      title: "Trends",
      href: "/trends",
      icon: LineChart,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarMenu title="Analytics">
        {items.map((item) => (
          <Link key={item.href} to={item.href}>
            <SidebarItem
              icon={<item.icon strokeWidth={1.5} size={20} />}
              active={pathname === item.href}
              className={cn(
                "transition-colors",
                pathname === item.href
                  ? "bg-muted text-foreground hover:bg-muted"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {item.title}
            </SidebarItem>
          </Link>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

const ContentMenu = () => {
  const { pathname } = useLocation();

  const items: MenuItem[] = [
    {
      title: "Articles",
      href: "/articles",
      icon: FileText,
    },
    {
      title: "AI Content",
      href: "/content",
      icon: MessageSquare,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarMenu title="Content">
        {items.map((item) => (
          <Link key={item.href} to={item.href}>
            <SidebarItem
              icon={<item.icon strokeWidth={1.5} size={20} />}
              active={pathname.startsWith(item.href)}
              className={cn(
                "transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-muted text-foreground hover:bg-muted"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {item.title}
            </SidebarItem>
          </Link>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
