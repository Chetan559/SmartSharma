import React from 'react';
import { Code2, Eye, RefreshCw, Download } from 'lucide-react';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onDownload?: () => void;
}

export function TabView({ activeTab, onTabChange, onRefresh, isRefreshing, onDownload }: TabViewProps) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <button
        onClick={() => onTabChange('code')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          activeTab === 'code'
            ? 'bg-gray-700 text-gray-100'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
        }`}
      >
        <Code2 className="w-4 h-4" />
        Code
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          activeTab === 'preview'
            ? 'bg-gray-700 text-gray-100'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
        }`}
      >
        <Eye className="w-4 h-4" />
        Preview
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Manual Refresh button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Reinstall dependencies and restart dev server"
          className={`p-1.5 rounded-md transition-colors ${
            isRefreshing
              ? 'text-blue-400 cursor-not-allowed'
              : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      )}

      {/* Download button */}
      {onDownload && (
        <button
          onClick={onDownload}
          title="Download code as ZIP"
          className="p-1.5 rounded-md transition-colors text-gray-500 hover:text-gray-200 hover:bg-gray-800"
        >
          <Download className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}