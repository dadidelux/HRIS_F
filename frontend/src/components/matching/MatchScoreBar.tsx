import React from 'react';

interface MatchScoreBarProps {
  totalScore: number;    // 0-100
  semanticScore: number; // 0-1
  keywordScore: number;  // 0-1
  compact?: boolean;
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'Strong Match';
  if (score >= 45) return 'Moderate Match';
  return 'Weak Match';
}

function scoreColor(score: number): string {
  if (score >= 70) return '#16a34a'; // green-600
  if (score >= 45) return '#ca8a04'; // yellow-600
  return '#dc2626';                  // red-600
}

function scoreBg(score: number): string {
  if (score >= 70) return '#dcfce7'; // green-100
  if (score >= 45) return '#fef9c3'; // yellow-100
  return '#fee2e2';                  // red-100
}

const MatchScoreBar: React.FC<MatchScoreBarProps> = ({
  totalScore,
  semanticScore,
  keywordScore,
  compact = false,
}) => {
  const color = scoreColor(totalScore);
  const bg = scoreBg(totalScore);
  const label = scoreLabel(totalScore);

  return (
    <div style={{ minWidth: compact ? 120 : 200 }}>
      {/* Total score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: compact ? 0 : 6 }}>
        <div
          style={{
            flex: 1,
            height: 10,
            borderRadius: 9999,
            background: '#e5e7eb',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(totalScore, 100)}%`,
              height: '100%',
              background: color,
              borderRadius: 9999,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color,
            minWidth: 38,
            textAlign: 'right',
          }}
        >
          {totalScore.toFixed(1)}%
        </span>
      </div>

      {/* Label badge */}
      {!compact && (
        <span
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 600,
            color,
            background: bg,
            borderRadius: 9999,
            padding: '2px 8px',
            marginBottom: 8,
          }}
        >
          {label}
        </span>
      )}

      {/* Breakdown bars */}
      {!compact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Semantic */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#6b7280', width: 68 }}>Similarity</span>
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 9999,
                background: '#e5e7eb',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(semanticScore * 100, 100)}%`,
                  height: '100%',
                  background: '#2563eb',
                  borderRadius: 9999,
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: '#374151', minWidth: 32, textAlign: 'right' }}>
              {(semanticScore * 100).toFixed(0)}%
            </span>
          </div>

          {/* Keyword */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#6b7280', width: 80 }}>Keyword Match</span>
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 9999,
                background: '#e5e7eb',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(keywordScore * 100, 100)}%`,
                  height: '100%',
                  background: '#7c3aed',
                  borderRadius: 9999,
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: '#374151', minWidth: 32, textAlign: 'right' }}>
              {(keywordScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchScoreBar;
