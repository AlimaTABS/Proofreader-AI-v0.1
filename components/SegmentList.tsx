import React from 'react';
import { Segment } from '../types';
import { SegmentRow } from './SegmentRow';
import { Plus } from 'lucide-react';

interface SegmentListProps {
  segments: Segment[];
  targetLanguage: string;
  onUpdate: (id: string, updates: Partial<Segment>) => void;
  onDelete: (id: string) => void;
  onRunAnalysis: (id: string) => void;
  onRunWordAnalysis: (id: string) => void;
  onAddSegment: () => void;
}

export const SegmentList: React.FC<SegmentListProps> = ({
  segments,
  targetLanguage,
  onUpdate,
  onDelete,
  onRunAnalysis,
  onRunWordAnalysis,
  onAddSegment,
}) => {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="space-y-4">
        {segments.map((segment) => (
          <SegmentRow
            key={segment.id}
            segment={segment}
            targetLanguage={targetLanguage}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onRunAnalysis={onRunAnalysis}
            onRunWordAnalysis={onRunWordAnalysis}
          />
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <button
          onClick={onAddSegment}
          className="group flex items-center gap-2 px-8 py-4 bg-white border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 shadow-sm"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Add New Review Segment
        </button>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">End of project list</p>
      </div>
    </div>
  );
};
