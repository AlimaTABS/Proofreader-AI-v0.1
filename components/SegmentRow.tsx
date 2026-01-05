import React from 'react';
import { Trash2, Sparkles, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Segment, SegmentStatus, SegmentCategory } from '../types';

interface SegmentRowProps {
  segment: Segment;
  targetLanguage: string;
  onUpdate: (id: string, updates: Partial<Segment>) => void;
  onDelete: (id: string) => void;
  onRunAnalysis: (id: string) => void;
}

export const SegmentRow: React.FC<SegmentRowProps> = ({
  segment,
  targetLanguage,
  onUpdate,
  onDelete,
  onRunAnalysis,
}) => {
  
  const getStatusColor = (status: SegmentStatus) => {
    switch (status) {
      case SegmentStatus.Approved: return 'bg-green-100 text-green-700 border-green-200';
      case SegmentStatus.NeedsWork: return 'bg-red-100 text-red-700 border-red-200';
      case SegmentStatus.Reviewed: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const StatusIcon = {
    [SegmentStatus.Approved]: CheckCircle,
    [SegmentStatus.NeedsWork]: AlertCircle,
    [SegmentStatus.Reviewed]: CheckCircle,
    [SegmentStatus.Pending]: Clock,
  }[segment.status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      
      {/* Main Comparison Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        
        {/* Source Column */}
        <div className="p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">English Source</span>
          </div>
          <textarea
            className="w-full min-h-[120px] p-3 text-base text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y transition-all"
            placeholder="Enter English source text..."
            value={segment.sourceText}
            onChange={(e) => onUpdate(segment.id, { sourceText: e.target.value })}
          />
        </div>

        {/* Target Column */}
        <div className="p-4 flex flex-col gap-2 bg-slate-50/30">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{targetLanguage} Translation</span>
          </div>
          <textarea
            className="w-full min-h-[120px] p-3 text-base text-gray-800 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y transition-all"
            placeholder={`Enter ${targetLanguage} translation...`}
            value={segment.targetText}
            onChange={(e) => onUpdate(segment.id, { targetText: e.target.value })}
            dir={['Arabic', 'Urdu', 'Persian', 'Hebrew'].includes(targetLanguage) ? 'rtl' : 'ltr'}
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-gray-50 border-t border-gray-200 p-3 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={segment.status}
              onChange={(e) => onUpdate(segment.id, { status: e.target.value as SegmentStatus })}
              className={`appearance-none pl-9 pr-8 py-1.5 rounded-md text-sm font-semibold border focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer ${getStatusColor(segment.status)}`}
            >
              {Object.values(SegmentStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <StatusIcon className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
              segment.status === SegmentStatus.NeedsWork ? 'text-red-600' :
              segment.status === SegmentStatus.Approved ? 'text-green-600' :
              'text-gray-500'
            }`} />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Category:</span>
            <select
              value={segment.category}
              onChange={(e) => onUpdate(segment.id, { category: e.target.value as SegmentCategory })}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-md py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {Object.values(SegmentCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
            {/* AI Analysis Button */}
            <button
                onClick={() => onRunAnalysis(segment.id)}
                disabled={segment.isAnalyzing || !segment.sourceText || !segment.targetText}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium text-white transition-all shadow-sm
                    ${segment.isAnalyzing 
                        ? 'bg-indigo-400 cursor-wait' 
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow active:scale-95'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {segment.isAnalyzing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        AI Analysis
                    </>
                )}
            </button>

            {/* Delete Button */}
            <button
                onClick={() => onDelete(segment.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete Segment"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* AI Feedback Panel */}
      {segment.aiFeedback && (
        <div className="bg-indigo-50/50 border-t border-indigo-100 p-4 animate-fadeIn">
            <div className="flex items-start gap-3">
                <div className="mt-1 bg-indigo-100 p-1.5 rounded-full">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-indigo-900 mb-1">AI Semantic Audit</h4>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line prose prose-sm max-w-none">
                        {segment.aiFeedback}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};