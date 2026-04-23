import React from "react";
import { Loader } from "../ui/Loader";
import { RunnerStatus } from "../hooks/useWebContainerRunner";

interface PreviewFrameProps {
  url: string;
  status: RunnerStatus;
}

const statusMessage: Partial<Record<RunnerStatus, string>> = {
  idle: "Waiting for files…",
  installing: "Installing dependencies…",
  starting: "Starting dev server…",
  error: "Something went wrong. Check the terminal.",
};

export function PreviewFrame({ url, status }: PreviewFrameProps) {
  const showLoader = !url && status !== "error";
  const showError = status === "error" && !url;

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {showLoader && (
        <div className="flex flex-col items-center gap-3">
          <Loader />
          <p className="text-sm text-gray-500">
            {statusMessage[status] ?? "Loading…"}
          </p>
        </div>
      )}

      {showError && (
        <div className="flex flex-col items-center gap-2 text-center px-6">
          <p className="text-red-400 font-medium">Build error</p>
          <p className="text-sm text-gray-500">
            Check the terminal panel below for details.
          </p>
        </div>
      )}

      {url && (
        <iframe
          title="Preview"
          src={url}
          width="100%"
          height="100%"
          sandbox="allow-scripts allow-same-origin allow-forms"
          className="rounded-lg border border-gray-700"
        />
      )}
    </div>
  );
}
