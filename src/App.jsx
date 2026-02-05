import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Explorer from "./components/Explorer";
import ChatWrapper from "./components/ChatWrapper";
import "./styles/App.css";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [explorerVisible, setExplorerVisible] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("repopilot-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem("repopilot-dark-mode", JSON.stringify(isDarkMode));
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  const loadRepo = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/load-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl }),
      });

      const data = await response.json();
      setTreeData(data.structure);
    } catch (error) {
      console.error("Error loading repository:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuToggle = () => {
    setExplorerVisible(!explorerVisible);
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`app-container ${isDarkMode ? "dark" : "light"}`}>
      <Navbar
        repoUrl={repoUrl}
        onRepoUrlChange={setRepoUrl}
        onLoadRepo={loadRepo}
        isLoading={loading}
        onMenuToggle={handleMenuToggle}
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
      />

      <div className="app-body">
        {explorerVisible && (
          <Explorer treeData={treeData} isLoading={loading} isDarkMode={isDarkMode} />
        )}

        <div className="main-content">
          <ChatWrapper treeData={treeData} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}

export default App;
