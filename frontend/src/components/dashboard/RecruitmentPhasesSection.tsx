import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { RecruitmentPhase, RecruitmentStage, RECRUITMENT_STAGES } from '../../services/api';

interface Props {
  phases: RecruitmentPhase[];
}

interface PhaseConfig {
  bg: string;
  border: string;
  text: string;
  badge: string;
  badgeText: string;
  dot: string;
}

const PHASE_COLORS: Record<string, PhaseConfig> = {
  'Initial Screening': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-500',
    badgeText: 'text-white',
    dot: 'bg-blue-500',
  },
  'Teaching Demo': {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    badge: 'bg-purple-500',
    badgeText: 'text-white',
    dot: 'bg-purple-500',
  },
  Interview: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-500',
    badgeText: 'text-white',
    dot: 'bg-amber-500',
  },
  'Final Selection': {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    badge: 'bg-orange-500',
    badgeText: 'text-white',
    dot: 'bg-orange-500',
  },
  'Job Offer': {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-500',
    badgeText: 'text-white',
    dot: 'bg-green-500',
  },
  Onboarding: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-800',
    badge: 'bg-teal-500',
    badgeText: 'text-white',
    dot: 'bg-teal-500',
  },
};

const RecruitmentPhasesSection: React.FC<Props> = ({ phases }) => {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  // Build a map for quick lookup
  const phaseMap = new Map(phases.map(p => [p.phase_name, p]));

  const togglePhase = (phaseName: string) => {
    setExpandedPhase(prev => (prev === phaseName ? null : phaseName));
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Recruitment Pipeline
      </h2>

      {/* Phase indicator cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {RECRUITMENT_STAGES.map(stageName => {
          const phase = phaseMap.get(stageName);
          const count = phase?.count ?? 0;
          const colors = PHASE_COLORS[stageName];
          const isExpanded = expandedPhase === stageName;

          return (
            <button
              key={stageName}
              onClick={() => togglePhase(stageName)}
              className={`
                flex flex-col items-center p-4 rounded-xl border-2 text-center
                transition-all duration-200 cursor-pointer
                ${colors.bg} ${colors.border} ${colors.text}
                ${isExpanded ? 'ring-2 ring-offset-1 ring-current shadow-md' : 'hover:shadow-sm'}
                dark:bg-opacity-20
              `}
            >
              <span className={`text-3xl font-bold ${colors.text}`}>{count}</span>
              <span className="text-xs font-medium mt-1 leading-tight">{stageName}</span>
              {isExpanded ? (
                <ChevronUp size={14} className="mt-2 opacity-60" />
              ) : (
                <ChevronDown size={14} className="mt-2 opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded candidate list */}
      {expandedPhase && (() => {
        const phase = phaseMap.get(expandedPhase as RecruitmentStage);
        const colors = PHASE_COLORS[expandedPhase];
        if (!phase) return null;
        return (
          <div className={`rounded-xl border ${colors.border} ${colors.bg} dark:bg-opacity-10 p-4`}>
            <h3 className={`font-semibold text-sm mb-3 ${colors.text}`}>
              {expandedPhase} — {phase.count} applicant{phase.count !== 1 ? 's' : ''}
            </h3>
            {phase.candidates.length === 0 ? (
              <p className="text-gray-400 text-sm">No applicants in this stage.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {phase.candidates.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-700 shadow-sm"
                  >
                    <div className={`w-7 h-7 rounded-full ${colors.badge} flex items-center justify-center flex-shrink-0`}>
                      <User size={13} className={colors.badgeText} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.job_title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default RecruitmentPhasesSection;
