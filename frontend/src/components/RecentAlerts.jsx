import React from 'react';

export default function RecentAlerts() {
  const alerts = [
    {
      id: 1,
      type: 'CRITICAL',
      typeClass: 'badge-danger',
      message: '[IMPS-MUM] Rapid burst velocity: 16 accounts flagged CRITICAL (98).',
      time: '2 mins ago',
      target: 'APP-88204'
    },
    {
      id: 2,
      type: 'INVESTIGATING',
      typeClass: 'badge-warning',
      message: '[UPI-DEL] Device Fingerprint conflict across 4 NBFC loan apps.',
      time: '8 mins ago',
      target: 'Redmi Note 12'
    },
    {
      id: 3,
      type: 'INFO',
      typeClass: 'badge-info',
      message: 'Document OCR & fraud risk check initiated for loan request.',
      time: '14 mins ago',
      target: 'APP-9486'
    }
  ];

  return (
    <div className="recent-alerts-panel card-styled">
      {/* STITCH ANOMALY FEED TICKER BAR */}
      <div className="anomaly-ticker-bar font-mono">
        <span className="ticker-label text-danger font-bold">🔴 ANOMALY FEED</span>
        <div className="ticker-scroll">
          <span className="ticker-item">
            <strong className="text-danger">[IMPS-MUM]</strong> Rapid burst velocity: 16 accounts flagged <span className="badge-pill badge-danger font-bold">CRITICAL (98)</span>
          </span>
          <span className="ticker-separator">●</span>
          <span className="ticker-item">
            <strong className="text-primary">[UPI-DEL]</strong> Device Fingerprint conflict across 4 NBFC loan apps <span className="badge-pill badge-warning font-bold">INVESTIGATING</span>
          </span>
        </div>
        <span className="live-indicator">
          <span className="live-dot"></span> LIVE
        </span>
      </div>

      <div className="alerts-timeline mt-3">
        {alerts.map((item) => (
          <div key={item.id} className="timeline-item">
            <div className="timeline-line"></div>
            <div className="timeline-point"></div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className={`badge-pill ${item.typeClass} font-mono`}>{item.type}</span>
                <span className="timeline-time font-mono">{item.time}</span>
              </div>
              <p className="timeline-message font-mono">{item.message}</p>
              <div className="timeline-target font-mono">Target: <code className="code-tag">{item.target}</code></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

