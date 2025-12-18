import React, { useState, useEffect, useRef } from 'react';
import { StockItem, ProcessingStatus, QueueStats } from './types';
import { analyzeImage } from './services/geminiService';
import Uploader from './components/Uploader';
import StatsBar from './components/StatsBar';
import ResultList from './components/ResultList';

const MAX_CONCURRENT_REQUESTS = 3; // Keep strict limit to avoid browser/network bottlenecks

const App: React.FC = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ref to track items state without triggering re-renders inside loops
  const itemsRef = useRef<StockItem[]>([]);
  
  // Update ref when state changes
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const queueRef = useRef<string[]>([]); // Array of Item IDs to process
  const processingCountRef = useRef(0);

  const stats: QueueStats = {
    total: items.length,
    completed: items.filter(i => i.status === ProcessingStatus.COMPLETED).length,
    failed: items.filter(i => i.status === ProcessingStatus.FAILED).length,
    processing: items.filter(i => i.status === ProcessingStatus.PROCESSING).length,
    pending: items.filter(i => i.status === ProcessingStatus.PENDING).length,
  };

  const handleFilesSelected = (files: File[]) => {
    const newItems: StockItem[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      thumbnailUrl: URL.createObjectURL(file), // Be careful with memory here for 500+ items. 
      status: ProcessingStatus.PENDING,
      title: '',
      tags: [],
    }));

    setItems(prev => [...prev, ...newItems]);
    
    // Add to queue
    newItems.forEach(item => queueRef.current.push(item.id));
    
    // AUTO-START REMOVED: User must click "Start Generating" button manually now.
  };

  const startProcessing = () => {
    if (!isProcessing && queueRef.current.length > 0) {
      setIsProcessing(true);
      processQueue();
    }
  };

  const processQueue = async () => {
    if (processingCountRef.current >= MAX_CONCURRENT_REQUESTS || queueRef.current.length === 0) {
      if (processingCountRef.current === 0 && queueRef.current.length === 0) {
        setIsProcessing(false);
      }
      return;
    }

    // Take next item
    const itemId = queueRef.current.shift();
    if (!itemId) return;

    processingCountRef.current++;

    // Update status to processing
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: ProcessingStatus.PROCESSING } : item
    ));

    // Find item data
    const item = itemsRef.current.find(i => i.id === itemId);
    
    if (item) {
      try {
        const result = await analyzeImage(item.file);
        
        setItems(prev => prev.map(i => 
          i.id === itemId ? { 
            ...i, 
            status: ProcessingStatus.COMPLETED, 
            title: result.title, 
            tags: result.tags 
          } : i
        ));
      } catch (error) {
        setItems(prev => prev.map(i => 
          i.id === itemId ? { 
            ...i, 
            status: ProcessingStatus.FAILED, 
            error: error instanceof Error ? error.message : "Unknown error" 
          } : i
        ));
      } finally {
        processingCountRef.current--;
        // Trigger next immediately
        processQueue();
      }
    } else {
        processingCountRef.current--;
        processQueue();
    }

    // Try to spawn another worker if we have capacity
    processQueue();
  };

  // Ensure queue keeps moving if state changes trigger re-renders
  useEffect(() => {
    if (isProcessing) {
      processQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]); // Re-check queue when items update

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             </div>
             <h1 className="text-xl font-bold tracking-tight text-white">StockMeta AI</h1>
          </div>
          <div>
            <span className="text-xs font-mono text-gray-500 border border-gray-800 px-2 py-1 rounded bg-gray-900">
                v1.0.0 &bull; Adobe Stock Optimized
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome / Uploader State */}
        {items.length === 0 ? (
           <div className="max-w-2xl mx-auto mt-12 animate-fade-in-up">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-white mb-4">
                    Supercharge your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Stock Portfolio</span>
                </h2>
                <p className="text-lg text-gray-400">
                    Bulk analyze 500+ images instantly. Generate full, descriptive titles and exactly 47 SEO-optimized tags per image using advanced AI.
                </p>
              </div>
              <Uploader onFilesSelected={handleFilesSelected} />
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                      <div className="text-blue-400 font-bold mb-1">Zero Lag</div>
                      <p className="text-xs text-gray-500">Optimized for batches of 500+ images using queue management.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                      <div className="text-purple-400 font-bold mb-1">Full Titles</div>
                      <p className="text-xs text-gray-500">No cutoff. Complete, grammatical English sentences.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                      <div className="text-green-400 font-bold mb-1">47 Precision Tags</div>
                      <p className="text-xs text-gray-500">Exactly the right amount for maximum Adobe Stock visibility.</p>
                  </div>
              </div>
           </div>
        ) : (
            <div className="animate-fade-in">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        {/* Start Button */}
                        {stats.pending > 0 && !isProcessing && (
                            <button
                                onClick={startProcessing}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/50 hover:shadow-blue-700/50 transition-all flex items-center animate-bounce-short"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Start Generating Metadata ({stats.pending})
                            </button>
                        )}
                        
                        {/* Processing Indicator */}
                        {isProcessing && (
                             <span className="flex items-center text-blue-400 text-sm animate-pulse bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-800">
                                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                AI Processing Active
                             </span>
                        )}
                    </div>
                </div>
                
                <StatsBar stats={stats} />
                
                <div className="mt-6">
                    <ResultList items={items} />
                </div>

                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={() => {
                            if(window.confirm("Are you sure you want to clear all data?")) {
                                setItems([]);
                                queueRef.current = [];
                                processingCountRef.current = 0;
                                setIsProcessing(false);
                            }
                        }}
                        className="text-gray-500 hover:text-red-400 text-sm transition-colors"
                    >
                        Clear Session & Start Over
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;