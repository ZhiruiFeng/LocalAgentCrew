'use client';

import { useState } from 'react';
import type { FileTreeNode } from '@/types/schema';
import {
  Folder,
  FolderOpen,
  File,
  FileJson,
  FileText,
  ChevronRight,
  ChevronDown,
  Code,
  Eye,
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface FileTreeViewProps {
  fileTree: FileTreeNode;
}

function getFileIcon(name: string) {
  if (name.endsWith('.json')) return FileJson;
  if (name.endsWith('.md')) return FileText;
  return File;
}

interface TreeNodeProps {
  node: FileTreeNode;
  level: number;
  onSelect?: (node: FileTreeNode) => void;
  selectedPath?: string;
}

function TreeNode({ node, level, onSelect, selectedPath }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const isDirectory = node.type === 'directory';
  const isSelected = selectedPath === node.path;
  const FileIcon = isDirectory ? (isOpen ? FolderOpen : Folder) : getFileIcon(node.name);

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    }
    onSelect?.(node);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`file-tree-item flex items-center gap-2 ${
          isSelected ? 'selected' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {isDirectory ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        <FileIcon
          className={`h-4 w-4 flex-shrink-0 ${
            isDirectory
              ? 'text-yellow-500'
              : node.name.endsWith('.json')
              ? 'text-yellow-600'
              : 'text-blue-500'
          }`}
        />
        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
          {node.name}
        </span>
        {node.metadata?.sessionId && level === 3 && (
          <span className="text-xs text-gray-400 truncate ml-auto">
            {node.metadata.sessionId.slice(0, 8)}...
          </span>
        )}
      </div>
      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTreeView({ fileTree }: FileTreeViewProps) {
  const [selectedNode, setSelectedNode] = useState<FileTreeNode | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const isMarkdownFile = (name: string) => name.endsWith('.md');

  const handleSelect = async (node: FileTreeNode) => {
    setSelectedNode(node);

    if (node.type === 'file') {
      setLoading(true);
      try {
        const response = await fetch(`/api/file?path=${encodeURIComponent(node.path)}`);
        if (response.ok) {
          const data = await response.json();
          setFileContent(data.content);
        } else {
          setFileContent('Unable to load file content');
        }
      } catch {
        setFileContent('Error loading file');
      }
      setLoading(false);
    } else {
      setFileContent(null);
    }
  };

  return (
    <div className="flex h-[600px]">
      {/* Tree */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-2">
          <TreeNode
            node={fileTree}
            level={0}
            onSelect={handleSelect}
            selectedPath={selectedNode?.path}
          />
        </div>
      </div>

      {/* Content Preview */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : selectedNode?.type === 'file' && fileContent ? (
          <>
            {/* File header with path and toggle */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                {selectedNode.path}
              </div>
              {isMarkdownFile(selectedNode.name) && (
                <button
                  onClick={() => setShowRaw(!showRaw)}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title={showRaw ? 'Show rendered' : 'Show raw'}
                >
                  {showRaw ? (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </>
                  ) : (
                    <>
                      <Code className="h-3.5 w-3.5" />
                      <span>Raw</span>
                    </>
                  )}
                </button>
              )}
            </div>
            {/* File content */}
            <div className="flex-1 overflow-auto p-4">
              {isMarkdownFile(selectedNode.name) && !showRaw ? (
                <MarkdownRenderer content={fileContent} />
              ) : (
                <pre className="text-sm font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {fileContent}
                </pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            {selectedNode
              ? selectedNode.type === 'directory'
                ? `${selectedNode.children?.length || 0} items in this folder`
                : 'Select a file to preview'
              : 'Select a file to preview'}
          </div>
        )}
      </div>
    </div>
  );
}
