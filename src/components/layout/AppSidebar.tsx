
import { Link, useLocation } from "react-router-dom";
import { 
  SidebarMain, 
  SidebarHeader, 
  SidebarContent,
  SidebarFooter,
  SidebarItem
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Users, FileText, Send, BarChart3, Settings, 
  TrendingUp, FileStack, Command, User
} from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function AppSidebar() {
  const location = useLocation();
  const { user } = useUser();
  
  return (
    <SidebarMain>
      <SidebarHeader className="border-b">
        <Link to="/" className="flex items-center gap-2 px-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="/placeholder.svg" alt="TMH Logo" />
            <AvatarFallback>TMH</AvatarFallback>
          </Avatar>
          <span className="text-lg font-bold">TMH Admin</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="space-y-6">
        <nav className="grid gap-1">
          <SidebarItem active={location.pathname === "/"} icon={<LayoutDashboard className="h-4 w-4" />}>
            <Link to="/">Dashboard</Link>
          </SidebarItem>
          
          <SidebarItem active={location.pathname === "/users"} icon={<Users className="h-4 w-4" />}>
            <Link to="/users">Users</Link>
          </SidebarItem>
          
          <SidebarItem active={location.pathname === "/assessments"} icon={<FileText className="h-4 w-4" />}>
            <Link to="/assessments">Assessments</Link>
          </SidebarItem>
          
          <SidebarItem active={location.pathname === "/affiliates"} icon={<Send className="h-4 w-4" />}>
            <Link to="/affiliates">Affiliates</Link>
          </SidebarItem>
          
          <SidebarItem active={location.pathname === "/demographics"} icon={<BarChart3 className="h-4 w-4" />}>
            <Link to="/demographics">Demographics</Link>
          </SidebarItem>
          
          <SidebarItem active={location.pathname === "/trends"} icon={<TrendingUp className="h-4 w-4" />}>
            <Link to="/trends">Trends</Link>
          </SidebarItem>
        </nav>
        
        <div>
          <h4 className="px-2 text-xs font-medium text-muted-foreground">Content</h4>
          <nav className="grid gap-1 pt-2">
            <SidebarItem active={location.pathname.startsWith("/articles")} icon={<FileStack className="h-4 w-4" />}>
              <Link to="/articles">Articles</Link>
            </SidebarItem>
            
            <SidebarItem active={location.pathname === "/content"} icon={<Command className="h-4 w-4" />}>
              <Link to="/content">AI Content</Link>
            </SidebarItem>
          </nav>
        </div>
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <div className="flex items-center justify-between p-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button variant="ghost" size="icon" asChild>
            <Link to="/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </SidebarMain>
  );
}
