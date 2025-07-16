import React from "react";
import Editor from "@monaco-editor/react";
import { FileItem } from "../types";

interface CodeEditorProps {
  file: FileItem | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a file to view its contents
      </div>
    );
  }

  function getLanguageFromExtension(filename: string): string {
    if (filename.endsWith(".tsx") || filename.endsWith(".ts"))
      return "typescript";
    if (filename.endsWith(".jsx") || filename.endsWith(".js"))
      return "javascript";
    if (filename.endsWith(".html")) return "html";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".json")) return "json";
    return "plaintext";
  }

  return (
    <Editor
      key={file.path}
      height="100%"
      defaultLanguage={getLanguageFromExtension(file.name)}
      theme="vs-dark"
      value={file.content || ""}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
      }}
    />
  );
}
