import React, { useState } from "react";
import {
  CheckCircle,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { Step } from "../types";

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>(
    {}
  );
  const [search, setSearch] = useState("");

  const toggleExpand = (id: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredSteps = steps.filter((step) =>
    step.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-100">Build Steps</h2>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search steps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 pr-3 py-1.5 w-full rounded-md bg-gray-800 text-sm text-gray-200 border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        {filteredSteps.map((step) => {
          const isExpanded = expandedSteps[step.id];

          return (
            <div
              key={step.id}
              role="button"
              tabIndex={0}
              onClick={() => onStepClick(step.id)}
              onKeyDown={(e) => e.key === "Enter" && onStepClick(step.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                currentStep === step.id
                  ? "bg-gray-800 border-l-4 border-blue-500"
                  : "hover:bg-gray-800"
              }`}
            >
              <div
                className="flex items-start justify-between gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(step.id);
                }}
              >
                <div className="flex items-center gap-2">
                  {step.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : step.status === "in-progress" ? (
                    <Clock className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-600" />
                  )}
                  <h3 className="font-medium text-gray-100">{step.title}</h3>
                </div>
                {step.description &&
                  (isExpanded ? (
                    <ChevronDown className="text-gray-400 w-4 h-4" />
                  ) : (
                    <ChevronRight className="text-gray-400 w-4 h-4" />
                  ))}
              </div>

              {isExpanded && step.description && (
                <p className="text-sm text-gray-400 mt-2 transition-opacity duration-300 ease-in">
                  {step.description}
                </p>
              )}
            </div>
          );
        })}
        {filteredSteps.length === 0 && (
          <p className="text-sm text-gray-500 text-center pt-4">
            No steps found.
          </p>
        )}
      </div>
    </div>
  );
}
