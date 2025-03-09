import {
  BarChart,
  Bot,
  BrainCircuit,
  FileText,
  LayoutDashboard,
  ScrollText,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const [user, setUser] = useState<any>(null);
  const { setTheme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Add new items to the navigation array
  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Users",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Assessments",
      href: "/assessments",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Demographics",
      href: "/demographics",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: "Articles",
      href: "/articles",
      icon: <ScrollText className="h-5 w-5" />,
    },
    {
      name: "AI Content",
      href: "/ai-content",
      icon: <Bot className="h-5 w-5" />,
    },
    {
      name: "AI Insights",
      href: "/ai-insights",
      icon: <BrainCircuit className="h-5 w-5" />,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: <UserCircle className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <LayoutDashboard className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-64 border-right p-0">
        <SheetHeader className="pl-6 pr-6 pt-6 pb-4">
          <SheetTitle>TheMoralHierarchy</SheetTitle>
          <SheetDescription>
            Manage your account preferences
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="flex flex-col space-y-1 py-4">
          {navigation.map((item) => (
            <Link to={item.href} key={item.href}>
              <Button variant="ghost" className="justify-start gap-2 w-full px-6 font-normal">
                {item.icon}
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
        <Separator />
        <div className="flex flex-col space-y-4 mt-auto pl-6 pr-6 pt-4 pb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start gap-2 w-full font-normal">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Your profile" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user?.email}</div>
                  <div className="text-muted-foreground text-xs">Administrator</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuItem>
                <Link to="/profile">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/settings">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SheetContent>
    </Sheet>
  );
}
