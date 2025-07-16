import React, { useEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";
import { Loader } from "../ui/Loader";

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer | undefined;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (!webContainer || files.length === 0) return;

    let cleanup = () => {};

    const runProject = async () => {
      try {
        // Register the server-ready listener
        const handleServerReady = (port: number, url: string) => {
          console.log(`Server ready at port ${port}: ${url}`);
          setUrl(url);
        };

        webContainer.on("server-ready", handleServerReady);
        cleanup = () => {
          // Remove listener on cleanup if API supports it
          // @ts-ignore
          webContainer.off?.("server-ready", handleServerReady);
        };

        console.log("Spawning install process...");
        // Install dependencies
        const installProcess = await webContainer.spawn("npm", ["install"]);
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log("[npm install]", data);
            },
          })
        );
        await installProcess.exit;

        // Run dev server
        const devProcess = await webContainer.spawn("npm", ["run", "dev"]);
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log("[npm run dev]", data);
            },
          })
        );
      } catch (error) {
        console.error("Failed to run project in WebContainer:", error);
      }
    };

    runProject();

    return () => {
      cleanup();
    };
  }, [webContainer, files]);

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && <Loader />}
      {url && (
        <iframe
          title="Preview"
          src={url}
          width="100%"
          height="100%"
          sandbox="allow-scripts allow-same-origin"
          className="rounded-lg border border-gray-700"
        />
      )}
    </div>
  );
}
