
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/ThemeProvider";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="mb-6 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-background"></div>
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 tmh-gradient-accent bg-clip-text text-transparent">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Button onClick={() => navigate("/")} size="lg">
          Return to Dashboard
        </Button>
      </div>
    </ThemeProvider>
  );
};

export default NotFound;
