import React from 'react';
import { QueueStats } from '../types';

interface StatsBarProps {
  stats: QueueStats;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const completionRate = stats.total > 0 ? Math.round(((stats.completed + stats.failed) / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Images</p>
        <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
        <p className="text-blue-400 text-xs font-medium uppercase tracking-wider">Processing</p>
        <p className="text-2xl font-bold text-blue-100 mt-1">{stats.processing}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
        <p className="text-green-400 text-xs font-medium uppercase tracking-wider">Completed</p>
        <p className="text-2xl font-bold text-green-100 mt-1">{stats.completed}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
        <p className="text-red-400 text-xs font-medium uppercase tracking-wider">Failed</p>
        <p className="text-2xl font-bold text-red-100 mt-1">{stats.failed}</p>
      </div>
      <div className="col-span-2 md:col-span-1 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm flex flex-col justify-center">
        <div className="flex justify-between items-end mb-2">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Progress</p>
            <p className="text-white font-bold">{completionRate}%</p>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
