import { useEffect, useRef, useState, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { FileItem } from "../types";

export type RunnerStatus =
  | "idle"
  | "installing"
  | "starting"
  | "ready"
  | "error";

export interface WebContainerRunner {
  url: string;
  status: RunnerStatus;
  logs: string[];
  refresh: () => void;
}

/**
 * Owns all WebContainer process lifecycle:
 *  - Runs `npm install` automatically when files are first mounted.
 *  - Re-runs `npm install` only when package.json content changes (Option B).
 *  - Exposes `refresh()` for the manual Refresh button.
 *  - Accumulates logs for the TerminalPanel.
 */
export function useWebContainerRunner(
  webContainer: WebContainer | undefined,
  files: FileItem[]
): WebContainerRunner {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [logs, setLogs] = useState<string[]>([]);

  // Refs to track state without stale closures
  const hasBootstrapped = useRef(false);
  const lastPackageJson = useRef<string | null>(null);
  const devProcessRef = useRef<Awaited<ReturnType<WebContainer["spawn"]>> | null>(null);
  const isRunningRef = useRef(false);
  const refreshRequestedRef = useRef(false);

  const appendLog = useCallback((line: string) => {
    setLogs((prev) => [...prev, line]);
  }, []);

  const killDevServer = useCallback(async () => {
    if (devProcessRef.current) {
      try {
        devProcessRef.current.kill();
      } catch {
        // process may already be dead
      }
      devProcessRef.current = null;
    }
  }, []);

  const runInstallAndDev = useCallback(
    async (wc: WebContainer, forceInstall: boolean) => {
      if (isRunningRef.current && !forceInstall) return;
      isRunningRef.current = true;

      try {
        await killDevServer();

        if (forceInstall) {
          // ── npm install ────────────────────────────────────────────────
          setStatus("installing");
          setLogs([]);
          appendLog("$ npm install");

          const installProcess = await wc.spawn("npm", ["install"]);
          installProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                appendLog(data);
              },
            })
          );
          const installExit = await installProcess.exit;
          if (installExit !== 0) {
            appendLog(`\n[Error] npm install exited with code ${installExit}`);
            setStatus("error");
            isRunningRef.current = false;
            return;
          }
          appendLog("\n✓ Dependencies installed");
        }

        // ── npm run dev ────────────────────────────────────────────────
        setStatus("starting");
        appendLog("\n$ npm run dev");

        const devProcess = await wc.spawn("npm", ["run", "dev"]);
        devProcessRef.current = devProcess;

        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              appendLog(data);
            },
          })
        );

        wc.on("server-ready", (port, serverUrl) => {
          appendLog(`\n✓ Server ready at ${serverUrl}`);
          setUrl(serverUrl);
          setStatus("ready");
        });
      } catch (err: any) {
        appendLog(`\n[Error] ${err?.message ?? String(err)}`);
        setStatus("error");
      } finally {
        isRunningRef.current = false;
      }
    },
    [killDevServer, appendLog]
  );

  // ── Main effect: watch for files changes ──────────────────────────────
  useEffect(() => {
    if (!webContainer || files.length === 0) return;

    // Extract current package.json content from the file tree
    const pkgFile = findFile(files, "package.json");
    const pkgContent = pkgFile?.content ?? null;

    const isFirstRun = !hasBootstrapped.current;
    const pkgChanged =
      !isFirstRun && pkgContent !== null && pkgContent !== lastPackageJson.current;

    if (!isFirstRun && !pkgChanged && !refreshRequestedRef.current) {
      // Files updated but package.json didn't change — just hot-reload (HMR handles it)
      return;
    }

    const shouldInstall = isFirstRun || pkgChanged || refreshRequestedRef.current;
    refreshRequestedRef.current = false;
    hasBootstrapped.current = true;
    lastPackageJson.current = pkgContent;

    runInstallAndDev(webContainer, shouldInstall);
  }, [webContainer, files, runInstallAndDev]);

  // ── Manual refresh ────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    if (!webContainer) return;
    refreshRequestedRef.current = true;
    hasBootstrapped.current = false; // force re-trigger on next file effect
    // Trigger immediately
    runInstallAndDev(webContainer, true);
    hasBootstrapped.current = true;
  }, [webContainer, runInstallAndDev]);

  return { url, status, logs, refresh };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function findFile(files: FileItem[], name: string): FileItem | null {
  for (const f of files) {
    if (f.type === "file" && f.name === name) return f;
    if (f.type === "folder" && f.children) {
      const found = findFile(f.children, name);
      if (found) return found;
    }
  }
  return null;
}
