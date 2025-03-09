import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "@/pages/Index";
import Assessments from "@/pages/Assessments";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import AIInsights from "@/pages/AIInsights";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import AIContent from "@/pages/AIContent";
import Articles from "@/pages/articles";
import Demographics from "./pages/Demographics";
import UserProfile from "./pages/UserProfile";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="tmh-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/users" element={<Users />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/ai-content" element={<AIContent />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/demographics" element={<Demographics />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
