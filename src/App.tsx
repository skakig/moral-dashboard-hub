
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { default as Dashboard } from "./pages/Index";
import Login from "./pages/Login";
import { default as Register } from "./pages/Login"; // Temporary using Login as Register since Register page doesn't exist
import Settings from "./pages/Settings";
import ArticlesPage from "./pages/articles/ArticlesPage";
import ArticleViewPage from "./pages/articles/ArticleViewPage";
import Demographics from "./pages/Demographics";
import Affiliates from "./pages/Affiliates";
import Users from "./pages/Users";
import Assessments from "./pages/Assessments";
import Trends from "./pages/Trends";
import AIContent from "./pages/AIContent";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:id" element={<ArticleViewPage />} />
        <Route path="/demographics" element={<Demographics />} />
        <Route path="/affiliates" element={<Affiliates />} />
        <Route path="/users" element={<Users />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/content" element={<AIContent />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
