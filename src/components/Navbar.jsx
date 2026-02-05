import { useState } from "react";
import "../styles/Navbar.css";

function Navbar({
  repoUrl,
  onRepoUrlChange,
  onLoadRepo,
  isLoading,
  onMenuToggle,
  isDarkMode,
  onDarkModeToggle,
}) {
  const [localRepoUrl, setLocalRepoUrl] = useState(repoUrl);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalRepoUrl(value);
    onRepoUrlChange(value);
  };

  const handleLoadClick = () => {
    onLoadRepo();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLoadClick();
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <button className="menu-button" onClick={onMenuToggle} title="Toggle Explorer">
          ☰
        </button>
        <div className="app-title">RepoPilot</div>
      </div>

      <div className="navbar-center">
        <input
          type="text"
          placeholder="GitHub repository URL"
          value={localRepoUrl}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="repo-input"
          disabled={isLoading}
        />
      </div>

      <div className="navbar-right">
        <button
          className="load-button"
          onClick={handleLoadClick}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Load"}
        </button>

        <button
          className="dark-mode-toggle"
          onClick={onDarkModeToggle}
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}

export default Navbar;
