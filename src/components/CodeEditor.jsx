import React, { useState, useEffect } from 'react';

export const CodeEditor = ({ initialCode, title, onSave }) => {
  const [code, setCode] = useState(initialCode);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const saveCode = () => {
    const newVersion = {
      code,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    const newHistory = [newVersion, ...history].slice(0, 5);
    setHistory(newHistory);
    
    if (onSave) onSave(code);
  };

  const revertToVersion = (version) => {
    setCode(version.code);
    setShowHistory(false);
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <h4>{title}</h4>
        <div className="editor-controls">
          <button onClick={() => setShowHistory(!showHistory)} className="history-btn">
            History ({history.length})
          </button>
          <button onClick={saveCode} className="save-btn">
            Save
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="code-history">
          <h5>Version History (Last 5)</h5>
          {history.length === 0 ? (
            <p>No saved versions yet</p>
          ) : (
            history.map((version) => (
              <div key={version.id} className="history-item">
                <span className="history-time">
                  {new Date(version.timestamp).toLocaleString()}
                </span>
                <button 
                  onClick={() => revertToVersion(version)}
                  className="revert-btn"
                >
                  Revert
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="code-textarea"
        spellCheck={false}
      />
    </div>
  );
};