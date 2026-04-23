import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StepsList } from "../components/StepsList";
import { FileExplorer } from "../components/FileExplorer";
import { TabView } from "../components/TabView";
import { CodeEditor } from "../components/CodeEditor";
import { PreviewFrame } from "../components/PreviewFrame";
import { TerminalPanel } from "../components/TerminalPanel";
import { Step, FileItem, StepType } from "../types";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { parseXml } from "../steps";
import { useWebContainer } from "../hooks/useWebContainer";
import { useWebContainerRunner } from "../hooks/useWebContainerRunner";
import { Loader } from "../components/Loader";
import Header from "../components/Header";
import JSZip from "jszip";

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };

  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);

  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [terminalOpen, setTerminalOpen] = useState(true);

  // ── WebContainer runner (owns install / dev-server / logs) ───────────
  const runner = useWebContainerRunner(webcontainer, files);

  const rows = 1;

  // ── Build file tree from steps ───────────────────────────────────────
  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;

    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [];
          let currentFileStructure = [...originalFiles];
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }
              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => ({
          ...s,
          status: "completed",
        }))
      );
    }
  }, [steps]);

  // ── Mount files into WebContainer ────────────────────────────────────
  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }
        return mountStructure[file.name];
      };

      files.forEach((file) => processFile(file, true));
      return mountStructure;
    };

    const mountStructure = createMountStructure(files);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  // ── Initial generation ───────────────────────────────────────────────
  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim(),
    });
    setTemplateSet(true);

    const { prompts, uiPrompts } = response.data;

    setSteps(
      parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending",
      }))
    );

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      })),
    });
    setLoading(false);

    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.response).map((x) => ({
        ...x,
        status: "pending" as "pending",
      })),
    ]);

    setLlmMessages(
      [...prompts, prompt].map((content) => ({
        role: "user" as "user",
        content,
      }))
    );
    setLlmMessages((x) => [
      ...x,
      { role: "assistant", content: stepsResponse.data.response },
    ]);
  }

  useEffect(() => {
    init();
  }, []);

  // ── Follow-up send ───────────────────────────────────────────────────
  const handleSend = async () => {
    if (!userPrompt.trim()) return;
    const newMessage = { role: "user" as "user", content: userPrompt };

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...llmMessages, newMessage],
    });
    setLoading(false);
    setPrompt("");

    setLlmMessages((x) => [...x, newMessage]);
    setLlmMessages((x) => [
      ...x,
      { role: "assistant", content: stepsResponse.data.response },
    ]);

    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.response).map((x) => ({
        ...x,
        status: "pending" as "pending",
      })),
    ]);
  };

  // ── Download Zip ──────────────────────────────────────────────────────
  const handleDownload = async () => {
    const zip = new JSZip();

    const addFilesToZip = (folder: JSZip, items: FileItem[]) => {
      items.forEach((file) => {
        if (file.type === "file") {
          folder.file(file.name, file.content || "");
        } else if (file.type === "folder" && file.children) {
          const subFolder = folder.folder(file.name);
          if (subFolder) {
            addFilesToZip(subFolder, file.children);
          }
        }
      });
    };

    addFilesToZip(zip, files);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header prompt={prompt} />

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-6 gap-6 p-6">
          {/* ── Left column: Steps + chat input ── */}
          <div className="col-span-1 h-[calc(100vh-12rem)] flex flex-col space-y-4">
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 rounded-md">
              <StepsList
                steps={steps}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
            </div>

            <div className="mt-2">
              {(loading || !templateSet) && <Loader />}
              {!(loading || !templateSet) && (
                <div className="relative max-w-sm w-full">
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="max-h-36 py-2.5 sm:py-3 ps-4 pe-20 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 resize-none overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                    placeholder="Message..."
                    rows={rows}
                  />
                  <div className="absolute top-2 end-3 z-10">
                    <button
                      onClick={handleSend}
                      type="button"
                      className="py-1.5 px-3 inline-flex shrink-0 justify-center items-center text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-hidden focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Middle column: File Explorer ── */}
          <div className="col-span-1 h-[calc(100vh-12rem)]">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>

          {/* ── Right columns: Editor / Preview + Terminal ── */}
          <div className="col-span-4 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-12rem)] flex flex-col">
            <TabView
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onRefresh={runner.refresh}
              isRefreshing={runner.status === "installing"}
              onDownload={handleDownload}
            />

            {/* Editor + Preview area — PreviewFrame always mounted, hidden via CSS */}
            <div className="flex-1 overflow-hidden min-h-0">
              {/* Code editor */}
              <div
                className="h-full"
                style={{ display: activeTab === "code" ? "block" : "none" }}
              >
                <CodeEditor file={selectedFile} />
              </div>

              {/* Preview — always in DOM so iframe URL is preserved */}
              <div
                className="h-full"
                style={{ display: activeTab === "preview" ? "block" : "none" }}
              >
                <PreviewFrame url={runner.url} status={runner.status} />
              </div>
            </div>

            {/* Terminal panel — toggleable */}
            <TerminalPanel
              logs={runner.logs}
              status={runner.status}
              isOpen={terminalOpen}
              onToggle={() => setTerminalOpen((o) => !o)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
