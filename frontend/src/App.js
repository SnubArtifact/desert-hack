import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Editor from "./components/Editor/Editor";
import { CompanyMode } from "./company";
import JoinPage from "./company/pages/JoinPage";

function MainApp() {
  const [theme, setTheme] = useState("light");
  const [showCompanyMode, setShowCompanyMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <>
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onCompanyClick={() => setShowCompanyMode(true)}
      />
      <Hero />
      <Editor />

      {showCompanyMode && (
        <CompanyMode onClose={() => setShowCompanyMode(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/join" element={<JoinPage />} />
    </Routes>
  );
}
