import React from 'react';

export default function OverviewCards() {
  const cardsData = [
    {
      title: 'PREVENTED DISBURSAL (24H)',
      value: '₹2.14 Cr',
      badge: '+86.4% vs avg',
      badgeClass: 'badge-info',
      trend: 'Flagged Applications: 42 intercepted',
      trendClass: 'text-info',
      icon: '🛡️'
    },
    {
      title: 'ACTIVE L1 ESCALATIONS',
      value: '19 Cases',
      badge: 'CRITICAL',
      badgeClass: 'badge-danger',
      trend: 'Underwriting Velocity SLA: 2.6x SLA',
      trendClass: 'text-danger',
      icon: '🚨'
    },
    {
      title: 'SHELL ENTITY SYNDICATES',
      value: '7 Rings',
      badge: '88 Linked Nodes',
      badgeClass: 'badge-warning',
      trend: 'Apex Global Density: HIGH DENSITY',
      trendClass: 'text-warning',
      icon: '🕸️'
    },
    {
      title: 'ROOT / EMULATOR RATE',
      value: '8.71%',
      badge: '+2.1% (TOR/Mullvad)',
      badgeClass: 'badge-danger',
      trend: 'SIM Swap Window (<24h): 11 hits',
      trendClass: 'text-danger',
      icon: '📱'
    }
  ];

  return (
    <div className="overview-cards-grid">
      {cardsData.map((card, idx) => (
        <div key={idx} className="overview-card">
          <div className="card-top">
            <span className="card-title font-mono">{card.title}</span>
            <span className="card-icon">{card.icon}</span>
          </div>
          <div className="card-body">
            <div className="card-value font-mono">{card.value}</div>
            <span className={`card-badge ${card.badgeClass}`}>{card.badge}</span>
          </div>
          <div className="card-footer">
            <span className={`card-trend ${card.trendClass}`}>{card.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

