import React, { useState, useMemo } from 'react';
import { StockItem, ProcessingStatus } from '../types';

interface ResultListProps {
  items: StockItem[];
}

const ITEMS_PER_PAGE = 20;

const ResultList: React.FC<ResultListProps> = ({ items }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Check if entire batch is done
  const isBatchComplete = useMemo(() => {
    return items.length > 0 && items.every(item => 
      item.status === ProcessingStatus.COMPLETED || item.status === ProcessingStatus.FAILED
    );
  }, [items]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportCSV = () => {
    // Adobe Stock CSV Format Specification
    // Header must be exactly: Filename, Title, Keywords, Category, Releases
    const headers = ["Filename", "Title", "Keywords", "Category", "Releases"];
    
    const rows = items.map(item => {
        // CSV Escaping Rules:
        // 1. If value contains comma, quote, or newline, wrap in double quotes.
        // 2. Escape double quotes by doubling them (" -> "")
        const escape = (str: string) => {
            if (!str) return '""';
            // Force wrap in quotes for safety with commas
            return `"${str.replace(/"/g, '""')}"`;
        };

        return [
            escape(item.file.name), // Filename (must include extension)
            escape(item.title),     // Title (max 200 chars)
            escape(item.tags.join(', ')), // Keywords (comma separated)
            "", // Category (Optional numeric code, left blank)
            ""  // Releases (Optional, left blank)
        ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0,19).replace(/[:]/g, "-");
    link.setAttribute("href", url);
    link.setAttribute("download", `AdobeStock_Metadata_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col space-y-4">
      
      {/* Success Banner / Main Action */}
      {isBatchComplete && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between animate-fade-in gap-4">
           <div className="flex items-center space-x-4">
                <div className="bg-green-500 p-3 rounded-full">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Batch Processing Complete!</h3>
                    <p className="text-green-200 text-sm">All {items.length} images have been analyzed.</p>
                </div>
           </div>
           <button 
                onClick={exportCSV}
                className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg shadow-green-900/50 hover:shadow-green-900/70 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
           >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Download Adobe Stock CSV
           </button>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col h-[600px]">
        {/* Header Toolbar */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-white">Results ({items.length})</h2>
          
          {/* Secondary Export Button (always visible) */}
          <button 
              onClick={exportCSV}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
              title="Export current progress"
          >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export CSV
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-3 bg-gray-900/50 text-xs font-medium text-gray-400 uppercase border-b border-gray-700">
          <div className="col-span-2 md:col-span-1">Preview</div>
          <div className="col-span-3 md:col-span-3">Status / Title</div>
          <div className="col-span-7 md:col-span-8">Keywords</div>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
          {currentItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 p-4 mb-2 bg-gray-750/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors items-start">
              
              {/* Thumbnail */}
              <div className="col-span-2 md:col-span-1">
                <div className="relative w-full pb-[100%] bg-gray-800 rounded-md overflow-hidden">
                  <img 
                    src={item.thumbnailUrl} 
                    alt="thumb" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Title & Status */}
              <div className="col-span-3 md:col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                          item.status === ProcessingStatus.COMPLETED ? 'bg-green-500' :
                          item.status === ProcessingStatus.PROCESSING ? 'bg-blue-500 animate-pulse' :
                          item.status === ProcessingStatus.FAILED ? 'bg-red-500' : 'bg-gray-600'
                      }`}></span>
                      <span className="text-xs font-mono text-gray-400 truncate w-32">{item.file.name}</span>
                  </div>
                  
                  {item.status === ProcessingStatus.COMPLETED ? (
                      <div>
                          <p className="text-sm font-medium text-white line-clamp-3 mb-1" title={item.title}>
                              {item.title}
                          </p>
                          <button 
                              onClick={() => copyToClipboard(item.title)}
                              className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                          >
                              Copy Title
                          </button>
                      </div>
                  ) : item.status === ProcessingStatus.FAILED ? (
                      <p className="text-sm text-red-400">Analysis failed. {item.error}</p>
                  ) : item.status === ProcessingStatus.PENDING ? (
                      <div className="flex items-center h-full">
                          <span className="text-gray-500 text-sm italic">Waiting to start...</span>
                      </div>
                  ) : (
                      <div className="space-y-2">
                          <div className="h-3 bg-gray-700 rounded w-full animate-pulse"></div>
                          <div className="h-3 bg-gray-700 rounded w-5/6 animate-pulse"></div>
                      </div>
                  )}
              </div>

              {/* Tags */}
              <div className="col-span-7 md:col-span-8">
                  {item.status === ProcessingStatus.COMPLETED ? (
                      <div>
                          <div className="flex flex-wrap gap-1 mb-2 max-h-32 overflow-hidden relative">
                              {item.tags.slice(0, 15).map((tag, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded border border-gray-600">
                                      {tag}
                                  </span>
                              ))}
                              {item.tags.length > 15 && (
                                  <span className="px-2 py-0.5 bg-gray-800 text-gray-500 text-xs rounded border border-gray-700">
                                      +{item.tags.length - 15} more
                                  </span>
                              )}
                          </div>
                          <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-green-400 font-medium">{item.tags.length} Tags Generated</span>
                              <button 
                                  onClick={() => copyToClipboard(item.tags.join(', '))}
                                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                              >
                                  Copy All Tags
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-2">
                          <div className="h-3 bg-gray-700 rounded w-full animate-pulse"></div>
                          <div className="h-3 bg-gray-700 rounded w-5/6 animate-pulse"></div>
                      </div>
                  )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Pagination */}
        <div className="p-3 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
          <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
          </span>
          <div className="space-x-2">
              <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white"
              >
                  Previous
              </button>
              <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white"
              >
                  Next
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultList;