import React, { useState, useEffect } from 'react';
import { Award, ChevronDown, ChevronUp, Download, FileText, Loader2, Target, Trash2, Zap } from 'lucide-react';
import {
  apiService,
  JobPosting,
  JobMatchingResponse,
  RankedCandidate,
} from '../services/api';
import MatchScoreBar from '../components/matching/MatchScoreBar';

const CandidateMatchingPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [result, setResult] = useState<JobMatchingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'precompute' | 'clear' | null>(null);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    apiService.getAllJobPostings().then(setJobs).catch(() => {});
  }, []);

  const activeJobs = jobs.filter((j) => j.status === 'Active');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExportCsv = () => {
    if (!result) return;
    const rows = [
      ['Rank', 'Full Name', 'Email', 'Skills', 'Has Resume', 'Total Score (%)', 'Similarity Score', 'Keyword Match Score'],
      ...result.ranked_candidates.map((c, i) => [
        i + 1,
        c.full_name,
        c.email,
        `"${c.skills.join('; ')}"`,
        c.has_resume ? 'Yes' : 'No',
        c.scores.total_score.toFixed(1),
        (c.scores.semantic_score * 100).toFixed(1),
        (c.scores.keyword_score * 100).toFixed(1),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matching_${result.job_title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMatch = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    setError('');
    setStatusMsg('');
    setResult(null);
    try {
      const data = await apiService.getMatchingCandidates(selectedJobId, minScore);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Failed to match candidates.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrecompute = async () => {
    if (!selectedJobId) return;
    setActionLoading('precompute');
    setStatusMsg('');
    setError('');
    try {
      const data = await apiService.precomputeEmbeddings(selectedJobId);
      setStatusMsg(data.message);
    } catch (e: any) {
      setError(e.message || 'Failed to pre-warm cache.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearCache = async () => {
    if (!selectedJobId) return;
    setActionLoading('clear');
    setStatusMsg('');
    setError('');
    try {
      const data = await apiService.clearEmbeddingCache(selectedJobId);
      setStatusMsg(data.message);
    } catch (e: any) {
      setError(e.message || 'Failed to clear cache.');
    } finally {
      setActionLoading(null);
    }
  };

  const rankBadge = (index: number) => {
    const colors = ['#f59e0b', '#9ca3af', '#b45309'];
    const labels = ['#1', '#2', '#3'];
    if (index < 3) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            background: colors[index],
            color: '#fff',
            borderRadius: 9999,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <Award size={13} />
          {labels[index]}
        </span>
      );
    }
    return (
      <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>#{index + 1}</span>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Target size={22} className="text-blue-600" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Candidate Matching</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Rank candidates using 70% similarity (Gemini) + 30% keyword match.
        </p>
      </div>

      {/* Controls */}
      <div
        className="rounded-xl shadow-sm p-5 mb-6"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex flex-wrap gap-4 items-end">
          {/* Job selector */}
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Job Posting</label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                setResult(null);
                setStatusMsg('');
                setError('');
              }}
              className="themed-select w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select a job —</option>
              {activeJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.job_title} ({j.department})
                </option>
              ))}
            </select>
          </div>

          {/* Min score */}
          <div style={{ width: 130 }}>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Min Score (0–100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="themed-input w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleMatch}
              disabled={!selectedJobId || loading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Target size={15} />}
              Match Candidates
            </button>

            <button
              onClick={handlePrecompute}
              disabled={!selectedJobId || actionLoading !== null}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {actionLoading === 'precompute' ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Zap size={15} />
              )}
              Pre-warm Cache
            </button>

            <button
              onClick={handleClearCache}
              disabled={!selectedJobId || actionLoading !== null}
              className="inline-flex items-center gap-2 border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-40 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {actionLoading === 'clear' ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
              Clear Cache
            </button>
          </div>
        </div>

        {/* Status / error messages */}
        {statusMsg && (
          <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {statusMsg}
          </div>
        )}
        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div>
          {/* Job requirements */}
          <div
            className="rounded-xl shadow-sm p-5 mb-4"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {result.job_title} — Requirements
              </h2>
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.requirements.map((r) => (
                <span
                  key={r}
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
                >
                  {r}
                </span>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              {result.total_candidates} candidate(s) matched &bull; computed{' '}
              {new Date(result.computed_at).toLocaleTimeString()}
            </p>
          </div>

          {/* Candidate cards */}
          {result.ranked_candidates.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              No candidates meet the minimum score threshold.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {result.ranked_candidates.map((c: RankedCandidate, index: number) => {
                const expanded = expandedIds.has(c.user_id);
                return (
                  <div
                    key={c.user_id}
                    className="rounded-xl shadow-sm p-4"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank badge */}
                      <div className="mt-1 flex-shrink-0">{rankBadge(index)}</div>

                      {/* Candidate info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.full_name}</span>
                          {c.has_resume && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              <FileText size={11} />
                              Resume
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.email}</p>

                        {/* Skills preview */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(expanded ? c.skills : c.skills.slice(0, 6)).map((s) => (
                            <span
                              key={s}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                            >
                              {s}
                            </span>
                          ))}
                          {!expanded && c.skills.length > 6 && (
                            <button
                              onClick={() => toggleExpand(c.user_id)}
                              className="text-xs text-blue-500 hover:underline"
                            >
                              +{c.skills.length - 6} more
                            </button>
                          )}
                          {expanded && c.skills.length > 6 && (
                            <button
                              onClick={() => toggleExpand(c.user_id)}
                              className="text-xs text-blue-500 hover:underline"
                            >
                              Show less
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="flex-shrink-0 w-52 mt-1">
                        <MatchScoreBar
                          totalScore={c.scores.total_score}
                          semanticScore={c.scores.semantic_score}
                          keywordScore={c.scores.keyword_score}
                        />
                      </div>

                      {/* Expand toggle */}
                      <button
                        onClick={() => toggleExpand(c.user_id)}
                        className="flex-shrink-0 mt-1"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="Toggle details"
                      >
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateMatchingPage;
