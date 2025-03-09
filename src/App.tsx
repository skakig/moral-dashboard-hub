
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import AppLayout from "./components/layout/AppLayout";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import pages
import Index from "./pages/Index";
import Assessments from "./pages/Assessments";
import Demographics from "./pages/Demographics";
import AIContent from "./pages/AIContent";
import AIInsights from "./pages/AIInsights";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import ArticlesPage from "./pages/articles";
import AffiliatesPage from "./pages/Affiliates";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <Router>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/demographics" element={<Demographics />} />
              <Route path="/content" element={<AIContent />} />
              <Route path="/insights" element={<AIInsights />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/users" element={<Users />} />
              <Route path="/articles/*" element={<ArticlesPage />} />
              <Route path="/affiliates" element={<AffiliatesPage />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
