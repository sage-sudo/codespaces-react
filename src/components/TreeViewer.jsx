import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

export const TreeViewer = () => {
  const [treeData, setTreeData] = useState('');
  const [includeFiles, setIncludeFiles] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateTree = async () => {
    setLoading(true);
    try {
      const tree = await buildProjectTree(includeFiles);
      setTreeData(tree);
    } catch (error) {
      setTreeData(`Error generating tree: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const buildProjectTree = async (withFiles) => {
    const structure = {
      'src/': {
        'core/': {
          'VendorManager.js': withFiles ? await fetchFileContent('/src/core/VendorManager.js') : null,
          'BaseVendorAdapter.js': withFiles ? await fetchFileContent('/src/core/BaseVendorAdapter.js') : null
        },
        'vendors/': {
          'YFinanceVendor.js': withFiles ? await fetchFileContent('/src/vendors/YFinanceVendor.js') : null,
          'ExampleVendorA.js': withFiles ? await fetchFileContent('/src/vendors/ExampleVendorA.js') : null,
          'ExampleVendorB.js': withFiles ? await fetchFileContent('/src/vendors/ExampleVendorB.js') : null,
          'VendorTemplate.js': withFiles ? await fetchFileContent('/src/vendors/VendorTemplate.js') : null
        },
        'components/': {
          'TradingDashboard.jsx': withFiles ? await fetchFileContent('/src/components/TradingDashboard.jsx') : null,
          'YFinanceComponents.jsx': withFiles ? await fetchFileContent('/src/components/YFinanceComponents.jsx') : null,
          'AdminComponents.jsx': withFiles ? await fetchFileContent('/src/components/AdminComponents.jsx') : null,
          'CodeEditor.jsx': withFiles ? await fetchFileContent('/src/components/CodeEditor.jsx') : null,
          'ErrorBoundary.jsx': withFiles ? await fetchFileContent('/src/components/ErrorBoundary.jsx') : null
        },
        'utils/': {
          'VendorRegistry.js': withFiles ? await fetchFileContent('/src/utils/VendorRegistry.js') : null
        },
        'App.jsx': withFiles ? await fetchFileContent('/src/App.jsx') : null,
        'App.css': withFiles ? await fetchFileContent('/src/App.css') : null,
        'index.jsx': withFiles ? await fetchFileContent('/src/index.jsx') : null
      },
      'public/': {
        'index.html': null,
        'favicon.ico': null
      },
      'package.json': withFiles ? await fetchFileContent('/package.json') : null,
      'vite.config.js': withFiles ? await fetchFileContent('/vite.config.js') : null,
      'README.md': null
    };

    return formatTree(structure, '', withFiles);
  };

  const fetchFileContent = async (path) => {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      return `// Error loading file: ${error.message}`;
    }
    return null;
  };

  const formatTree = (obj, prefix = '', withFiles = false, isLast = true) => {
    let result = '';
    const entries = Object.entries(obj);
    
    entries.forEach(([key, value], index) => {
      const isLastItem = index === entries.length - 1;
      const connector = isLastItem ? '└── ' : '├── ';
      const nextPrefix = prefix + (isLastItem ? '    ' : '│   ');
      
      result += `${prefix}${connector}${key}\n`;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result += formatTree(value, nextPrefix, withFiles, isLastItem);
      } else if (withFiles && value && typeof value === 'string') {
        const fileLines = value.split('\n');
        const preview = fileLines.slice(0, 3).join('\n');
        result += `${nextPrefix}┌─ Content (${fileLines.length} lines):\n`;
        result += `${nextPrefix}│  ${preview.replace(/\n/g, `\n${nextPrefix}│  `)}\n`;
        if (fileLines.length > 3) {
          result += `${nextPrefix}│  ...\n`;
        }
        result += `${nextPrefix}└─\n`;
      }
    });
    
    return result;
  };

  const downloadTree = () => {
    const filename = includeFiles ? 'project_tree_with_files.txt' : 'project_tree.txt';
    const blob = new Blob([treeData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadZip = async () => {
    setLoading(true);
    try {
      const zip = new JSZip();
      
      // Add project structure files
      const files = {
        'src/core/VendorManager.js': await fetchFileContent('/src/core/VendorManager.js'),
        'src/core/BaseVendorAdapter.js': await fetchFileContent('/src/core/BaseVendorAdapter.js'),
        'src/vendors/YFinanceVendor.js': await fetchFileContent('/src/vendors/YFinanceVendor.js'),
        'src/vendors/ExampleVendorA.js': await fetchFileContent('/src/vendors/ExampleVendorA.js'),
        'src/vendors/ExampleVendorB.js': await fetchFileContent('/src/vendors/ExampleVendorB.js'),
        'src/vendors/VendorTemplate.js': await fetchFileContent('/src/vendors/VendorTemplate.js'),
        'src/components/TradingDashboard.jsx': await fetchFileContent('/src/components/TradingDashboard.jsx'),
        'src/components/YFinanceComponents.jsx': await fetchFileContent('/src/components/YFinanceComponents.jsx'),
        'src/components/AdminComponents.jsx': await fetchFileContent('/src/components/AdminComponents.jsx'),
        'src/components/CodeEditor.jsx': await fetchFileContent('/src/components/CodeEditor.jsx'),
        'src/components/ErrorBoundary.jsx': await fetchFileContent('/src/components/ErrorBoundary.jsx'),
        'src/components/TreeViewer.jsx': await fetchFileContent('/src/components/TreeViewer.jsx'),
        'src/utils/VendorRegistry.js': await fetchFileContent('/src/utils/VendorRegistry.js'),
        'src/App.jsx': await fetchFileContent('/src/App.jsx'),
        'src/App.css': await fetchFileContent('/src/App.css'),
        'src/index.jsx': await fetchFileContent('/src/index.jsx'),
        'package.json': await fetchFileContent('/package.json'),
        'vite.config.js': await fetchFileContent('/vite.config.js'),
        'README.md': await fetchFileContent('/README.md')
      };

      // Add tree structure
      zip.file('PROJECT_STRUCTURE.txt', treeData);
      
      // Add all files to zip
      Object.entries(files).forEach(([path, content]) => {
        if (content) {
          zip.file(path, content);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trading_dashboard_project.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating zip:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateTree();
  }, []);

  return (
    <div className="tree-viewer">
      <div className="tree-controls">
        <label className="tree-option">
          <input
            type="checkbox"
            checked={includeFiles}
            onChange={(e) => setIncludeFiles(e.target.checked)}
          />
          Include file contents
        </label>
        <div className="tree-actions">
          <button onClick={generateTree} disabled={loading} className="tree-btn">
            {loading ? 'Generating...' : 'Refresh Tree'}
          </button>
          <button onClick={downloadTree} disabled={!treeData} className="tree-btn download">
            Download Tree
          </button>
          {includeFiles && (
            <button onClick={downloadZip} disabled={!treeData || loading} className="tree-btn zip">
              Download ZIP
            </button>
          )}
        </div>
      </div>
      
      <div className="tree-display">
        <pre className="tree-content">{treeData || 'Generating tree structure...'}</pre>
      </div>
    </div>
  );
};