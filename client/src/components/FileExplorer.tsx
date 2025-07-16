import React, { useState, useCallback } from "react";
import { FolderTree, File, ChevronRight, ChevronDown } from "lucide-react";
import { FileItem } from "../types";

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

interface FileNodeProps {
  item: FileItem;
  depth: number;
  onFileClick: (file: FileItem) => void;
  expanded: Record<string, boolean>;
  toggleExpand: (path: string) => void;
  selectedPath: string | null;
}

const FileNode: React.FC<FileNodeProps> = ({
  item,
  depth,
  onFileClick,
  expanded,
  toggleExpand,
  selectedPath,
}) => {
  const isFolder = item.type === "folder";
  const isExpanded = expanded[item.path];

  const handleClick = () => {
    if (isFolder) {
      toggleExpand(item.path);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors duration-200 ${
          selectedPath === item.path
            ? "bg-gray-800 text-blue-400 font-semibold"
            : "hover:bg-gray-800"
        }`}
        style={{ paddingLeft: `${depth * 1.25}rem` }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
      >
        {isFolder && (
          <span className="text-gray-400 transition-transform duration-200">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {isFolder ? (
          <FolderTree className="w-4 h-4 text-blue-400" />
        ) : (
          <File className="w-4 h-4 text-gray-400" />
        )}
        <span className="truncate">{item.name}</span>
      </div>

      {isFolder && isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileNode
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              expanded={expanded}
              toggleExpand={toggleExpand}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const toggleExpand = useCallback((path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  }, []);

  const handleSelect = (file: FileItem) => {
    setSelectedPath(file.path);
    onFileSelect(file);
  };

  return (
    <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg p-4 h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-100">
        <FolderTree className="w-5 h-5" />
        File Explorer
      </h2>
      <div className="space-y-1">
        {files.map((file, index) => (
          <FileNode
            key={`${file.path}-${index}`}
            item={file}
            depth={0}
            onFileClick={handleSelect}
            expanded={expandedFolders}
            toggleExpand={toggleExpand}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </div>
  );
}
