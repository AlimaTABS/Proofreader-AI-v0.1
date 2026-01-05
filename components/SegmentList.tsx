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
  onAddSegment: () => void;
}

export const SegmentList: React.FC<SegmentListProps> = ({
  segments,
  targetLanguage,
  onUpdate,
  onDelete,
  onRunAnalysis,
  onAddSegment,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="space-y-6">
        {segments.map((segment) => (
          <SegmentRow
            key={segment.id}
            segment={segment}
            targetLanguage={targetLanguage}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onRunAnalysis={onRunAnalysis}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onAddSegment}
          className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 shadow-sm"
        >
          <div className="bg-gray-100 rounded-full p-1 group-hover:bg-indigo-100 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          Add New Segment
        </button>
      </div>
    </div>
  );
};