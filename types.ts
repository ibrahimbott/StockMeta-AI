export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface StockItem {
  id: string;
  file: File;
  thumbnailUrl: string;
  status: ProcessingStatus;
  title: string;
  tags: string[];
  error?: string;
  progress?: number; // 0-100 placeholder if we had granular progress
}

export interface GeminiResponse {
  title: string;
  tags: string[];
}

export interface QueueStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  processing: number;
}
