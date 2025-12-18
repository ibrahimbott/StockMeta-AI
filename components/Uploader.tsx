import React, { useCallback } from 'react';

interface UploaderProps {
  onFilesSelected: (files: File[]) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onFilesSelected }) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = (Array.from(e.dataTransfer.files) as File[]).filter(file => file.type.startsWith('image/'));
      onFilesSelected(imageFiles);
    }
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFiles = (Array.from(e.target.files) as File[]).filter(file => file.type.startsWith('image/'));
      onFilesSelected(imageFiles);
    }
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-gray-600 hover:border-blue-500 bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200 rounded-2xl p-12 text-center cursor-pointer group"
    >
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={handleChange}
        className="hidden" 
        id="fileInput"
      />
      <label htmlFor="fileInput" className="cursor-pointer block">
        <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Drop 500+ Images Here</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Support for JPG, PNG, WEBP. Bulk processing is optimized for performance.
          <br/>
          <span className="text-blue-400 mt-2 block font-medium">Click to browse files</span>
        </p>
      </label>
    </div>
  );
};

export default Uploader;