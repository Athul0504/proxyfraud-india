import React from 'react';

export default function RiskSignals() {
  const signals = [
    {
      id: 'SIG-101',
      title: 'Shared device across multiple applicants',
      description: 'Device fingerprint #DEV-8F4A registered on 4 different loan applications within 30 minutes.',
      severity: 'HIGH',
      severityClass: 'severity-high',
    },
    {
      id: 'SIG-102',
      title: 'Shared IP address',
      description: 'IP 49.37.12.84 associated with 12 distinct applicant IDs in the last 24 hours.',
      severity: 'MEDIUM',
      severityClass: 'severity-medium',
    }
  ];

  return (
    <div className="risk-signals-panel card-styled">
      <div className="panel-header border-b pb-2">
        <div className="flex items-center gap-2">
          <span className="icon-badge font-mono">📱</span>
          <h3 className="panel-title font-mono uppercase">HARDWARE & ASN FORENSICS</h3>
        </div>
        <span className="badge-pill badge-danger font-mono">COMPROMISED</span>
      </div>

      <div className="forensics-telemetry-stack mt-3">
        {/* SECTION 1: PRIMARY HARDWARE FINGERPRINT */}
        <div className="telemetry-block border-danger-left">
          <div className="block-head flex justify-between font-mono">
            <span className="text-subtle font-bold">PRIMARY HARDWARE FINGERPRINT</span>
            <span className="text-danger font-bold">⚠️</span>
          </div>
          <div className="block-title font-bold text-lg">Xiaomi Redmi Note 12</div>
          <div className="tags-row font-mono mt-1">
            <span className="tag-item danger-tag">ROOT: Magisk v26.3</span>
            <span className="tag-item danger-tag">Zygisk Active</span>
          </div>
          <div className="block-meta font-mono mt-1 text-subtle">
            SMA: <code className="code-tag">C918 ... 8fca</code>
          </div>
        </div>

        {/* SECTION 2: EMULATOR SPOOFING ENGINE */}
        <div className="telemetry-block border-warning-left mt-3">
          <div className="block-head flex justify-between font-mono">
            <span className="text-subtle font-bold">EMULATOR SPOOFING ENGINE</span>
            <span className="badge-pill badge-warning">DETECTED</span>
          </div>
          <div className="block-title font-bold text-md">NoxPlayer VM Fingerprint</div>
          <p className="block-desc font-mono mt-1">
            Synthetic <code className="code-tag highlight">build.prop</code> driver overrides identified. GPU renderer reports <strong>SwiftShader Driver (OpenGL ES 3.0)</strong> instead of Adreno 610.
          </p>
        </div>

        {/* SECTION 3: TRANSIT IP & ASN METRICS */}
        <div className="telemetry-block border-primary-left mt-3">
          <div className="block-head flex justify-between font-mono">
            <span className="text-subtle font-bold">TRANSIT IP & ASN METRICS</span>
            <span className="badge-pill badge-danger font-mono">TOR EXIT</span>
          </div>
          <div className="ip-display-row font-mono mt-1">
            <span className="ip-large font-bold">185.220.101.44</span>
            <span className="asn-code font-bold">ASN 24940</span>
          </div>
          <p className="block-desc font-mono mt-1">
            TOR Project Autonomous System / Anonymous Proxy Gateway. WebRTC leaking local gateway: <code className="code-tag">10.0.2.15</code>
          </p>
        </div>

        {/* SECTION 4: CELLULAR TELCO TELEMETRY */}
        <div className="telemetry-block border-danger-left mt-3">
          <div className="block-head flex justify-between font-mono">
            <span className="text-subtle font-bold">CELLULAR TELCO TELEMETRY</span>
            <span className="text-subtle font-mono">14h Ago</span>
          </div>
          <div className="block-title font-bold text-md">Airtel West India (IMSI Shift)</div>
          <div className="block-warning-banner danger-banner font-mono mt-2">
            ⚠️ High Probability SIM-Swap ATD (Account Takeover) window.
          </div>
        </div>

        {/* BROADCAST SYNDICATE BLOCK ACTION BUTTON */}
        <button className="btn-broadcast-block btn-danger-solid font-mono w-full mt-4">
          🚨 BROADCAST SYNDICATE BLOCK
        </button>
        <p className="btn-subtext text-center font-mono text-subtle mt-1">
          Syncs to 28 RBI Regulated NBFC Nodes via API Gateway
        </p>
      </div>

      {/* ACTIVE SIGNALS LIST */}
      <div className="active-signals-subpanel mt-4 pt-3 border-t">
        <h4 className="subpanel-title font-mono text-subtle uppercase mb-2">ACTIVE ANOMALY INDICATORS ({signals.length})</h4>
        <div className="signals-list">
          {signals.map((sig) => (
            <div key={sig.id} className={`signal-card ${sig.severityClass}`}>
              <div className="signal-content">
                <div className="signal-title-row">
                  <span className="signal-title font-bold">{sig.title}</span>
                  <span className={`severity-tag ${sig.severityClass}`}>
                    {sig.severity}
                  </span>
                </div>
                <p className="signal-desc font-mono">{sig.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

