
import React, { useMemo } from 'react';
import { Segment, SegmentStatus } from '../types';
import { SegmentRow } from './SegmentRow';
import { Plus, BarChart3, CheckSquare, AlertTriangle, Layers } from 'lucide-react';

interface SegmentListProps {
  segments: Segment[];
  targetLanguage: string;
  onUpdate: (id: string, updates: Partial<Segment>) => void;
  onDelete: (id: string) => void;
  onRunAnalysis: (id: string) => void;
  onTranslate: (id: string) => void;
  onRunWordAnalysis: (id: string) => void;
  onAddSegment: () => void;
}

export const SegmentList: React.FC<SegmentListProps> = ({
  segments,
  targetLanguage,
  onUpdate,
  onDelete,
  onRunAnalysis,
  onTranslate,
  onRunWordAnalysis,
  onAddSegment,
}) => {
  const stats = useMemo(() => {
    const total = segments.length;
    const approved = segments.filter(s => s.status === SegmentStatus.Approved).length;
    const needsWork = segments.filter(s => s.status === SegmentStatus.NeedsWork).length;
    const reviewed = segments.filter(s => s.status === SegmentStatus.Reviewed).length;
    const progress = total > 0 ? Math.round(((approved + reviewed) / total) * 100) : 0;
    
    return { total, approved, needsWork, reviewed, progress };
  }, [segments]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Stats Summary Bar */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg"><Layers className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Segments</p>
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="bg-green-50 p-2 rounded-lg"><CheckSquare className="w-5 h-5 text-green-600" /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Approved</p>
            <p className="text-lg font-bold text-gray-900">{stats.approved}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="bg-red-50 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Needs Work</p>
            <p className="text-lg font-bold text-gray-900">{stats.needsWork}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-lg"><BarChart3 className="w-5 h-5 text-indigo-600" /></div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase">QA Progress</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{stats.progress}%</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${stats.progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {segments.map((segment) => (
          <SegmentRow
            key={segment.id}
            segment={segment}
            targetLanguage={targetLanguage}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onRunAnalysis={onRunAnalysis}
            onTranslate={onTranslate}
            onRunWordAnalysis={onRunWordAnalysis}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onAddSegment}
          className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Add New Segment
        </button>
      </div>
    </div>
  );
};
