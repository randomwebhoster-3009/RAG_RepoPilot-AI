import InteractiveRepoTree from "./InteractiveRepoTree";
import "../styles/Explorer.css";

function Explorer({ treeData, isLoading, isDarkMode }) {
  return (
    <div className={`explorer ${isDarkMode ? "dark" : ""}`}>
      <div className="explorer-header">EXPLORER</div>
      <div className="explorer-content">
        {isLoading && <div className="explorer-loading">Loading repository…</div>}
        {!isLoading && !treeData && (
          <div className="explorer-empty">Load a repository to view its structure</div>
        )}
        {!isLoading && treeData && <InteractiveRepoTree data={treeData} />}
      </div>
    </div>
  );
}

export default Explorer;
