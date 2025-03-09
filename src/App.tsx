
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import ArticlesPage from "./pages/articles/ArticlesPage";
import ArticleViewPage from "./pages/articles/ArticleViewPage";
import Demographics from "./pages/Demographics";
import Affiliates from "./pages/Affiliates";

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
      </Routes>
    </Router>
  );
}

export default App;
