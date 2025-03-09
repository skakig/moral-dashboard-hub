
import { Link, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
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
    <Sidebar>
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
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={location.pathname === "/"}>
                <Link to="/">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={location.pathname === "/users"}>
                <Link to="/users">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={location.pathname === "/assessments"}>
                <Link to="/assessments">
                  <FileText className="h-4 w-4" />
                  <span>Assessments</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={location.pathname === "/affiliates"}>
                <Link to="/affiliates">
                  <Send className="h-4 w-4" />
                  <span>Affiliates</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={location.pathname === "/demographics"}>
                <Link to="/demographics">
                  <BarChart3 className="h-4 w-4" />
                  <span>Demographics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild active={location.pathname === "/trends"}>
                <Link to="/trends">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trends</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </nav>
        
        <div>
          <h4 className="px-2 text-xs font-medium text-muted-foreground">Content</h4>
          <nav className="grid gap-1 pt-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild active={location.pathname.startsWith("/articles")}>
                  <Link to="/articles">
                    <FileStack className="h-4 w-4" />
                    <span>Articles</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild active={location.pathname === "/content"}>
                  <Link to="/content">
                    <Command className="h-4 w-4" />
                    <span>AI Content</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
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
    </Sidebar>
  );
}
