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
  badgeBg: string;
  dot: string;
}

const PHASE_COLORS: Record<string, PhaseConfig> = {
  'Initial Screening': {
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1d4ed8',
    badgeBg: '#3b82f6',
    dot: '#3b82f6',
  },
  'Teaching Demo': {
    bg: '#faf5ff',
    border: '#e9d5ff',
    text: '#7c3aed',
    badgeBg: '#8b5cf6',
    dot: '#8b5cf6',
  },
  'Interview': {
    bg: '#fffbeb',
    border: '#fcd34d',
    text: '#92400e',
    badgeBg: '#f59e0b',
    dot: '#f59e0b',
  },
  'Final Selection': {
    bg: '#fff7ed',
    border: '#fdba74',
    text: '#c2410c',
    badgeBg: '#f97316',
    dot: '#f97316',
  },
  'Job Offer': {
    bg: '#f0fdf4',
    border: '#86efac',
    text: '#15803d',
    badgeBg: '#22c55e',
    dot: '#22c55e',
  },
  'Onboarding': {
    bg: '#f0fdfa',
    border: '#5eead4',
    text: '#0f766e',
    badgeBg: '#14b8a6',
    dot: '#14b8a6',
  },
};

const RecruitmentPhasesSection: React.FC<Props> = ({ phases }) => {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const phaseMap = new Map(phases.map(p => [p.phase_name, p]));

  const togglePhase = (phaseName: string) => {
    setExpandedPhase(prev => (prev === phaseName ? null : phaseName));
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
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
              className="flex flex-col items-center p-4 rounded-xl text-center transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: colors.bg,
                border: isExpanded ? `2px solid ${colors.dot}` : `1px solid ${colors.border}`,
                boxShadow: isExpanded ? `0 0 0 2px ${colors.dot}30` : 'none',
                color: colors.text,
              }}
            >
              <span className="text-3xl font-bold" style={{ color: colors.text }}>{count}</span>
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
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <h3 className="font-semibold text-sm mb-3" style={{ color: colors.text }}>
              {expandedPhase} — {phase.count} applicant{phase.count !== 1 ? 's' : ''}
            </h3>
            {phase.candidates.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No applicants in this stage.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {phase.candidates.map(c => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 shadow-sm"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: colors.badgeBg }}
                    >
                      <User size={13} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.job_title}</p>
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
