import React, { useState, useEffect, useMemo } from 'react';
import { getFraudNetwork, getFraudApplicantRiskScore } from '../services/api';

export default function FraudNetworkPanel() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [applicantRiskDetail, setApplicantRiskDetail] = useState(null);
  const [loadingRiskDetail, setLoadingRiskDetail] = useState(false);

  const [filterType, setFilterType] = useState('ALL'); // ALL, CLUSTER_ONLY, SHARED_ONLY, APPLICANTS_ONLY
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFraudNetwork();
      setNetworkData(data);
      // Default select APP-1008 if available
      const defaultApp = data.nodes.find(n => n.id === 'APP-1008');
      if (defaultApp) {
        handleSelectNode(defaultApp.id, data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load fraud network graph.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNode = async (nodeId, currentData = networkData) => {
    setSelectedNodeId(nodeId);
    if (!currentData) return;

    const node = currentData.nodes.find(n => n.id === nodeId);
    if (node && node.type === 'APPLICANT') {
      setLoadingRiskDetail(true);
      try {
        const riskDetail = await getFraudApplicantRiskScore(nodeId);
        setApplicantRiskDetail(riskDetail);
      } catch (err) {
        console.error('Error fetching risk detail:', err);
      } finally {
        setLoadingRiskDetail(false);
      }
    } else {
      setApplicantRiskDetail(null);
    }
  };

  // Compute node positions deterministically for SVG layout
  const nodePositions = useMemo(() => {
    if (!networkData || !networkData.nodes) return {};

    const positions = {};
    const width = 850;
    const height = 580;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes = networkData.nodes;
    const cluster = networkData.clusters && networkData.clusters[0];
    const clusterMembers = new Set(cluster ? cluster.member_applicant_ids : []);
    const sharedInfra = new Set([
      ...(cluster?.shared_attributes?.device_ids || []),
      ...(cluster?.shared_attributes?.ip_addresses || []),
      ...(cluster?.shared_attributes?.bank_account_ids || [])
    ]);

    // Central Cluster Nodes
    const clusterNodes = nodes.filter(n => clusterMembers.has(n.id) || sharedInfra.has(n.id));
    const outerNodes = nodes.filter(n => !clusterMembers.has(n.id) && !sharedInfra.has(n.id));

    // Place Cluster nodes in inner circle
    const innerRadius = 160;
    clusterNodes.forEach((node, i) => {
      const angle = (i / clusterNodes.length) * 2 * Math.PI - Math.PI / 2;
      positions[node.id] = {
        x: centerX + innerRadius * Math.cos(angle),
        y: centerY + innerRadius * Math.sin(angle),
        isCluster: true
      };
    });

    // Place Outer nodes in outer perimeter circle
    const outerRadius = 265;
    outerNodes.forEach((node, i) => {
      const angle = (i / outerNodes.length) * 2 * Math.PI - Math.PI / 2;
      positions[node.id] = {
        x: centerX + outerRadius * Math.cos(angle),
        y: centerY + outerRadius * Math.sin(angle),
        isCluster: false
      };
    });

    return positions;
  }, [networkData]);

  // Neighbor nodes & edges of selected node
  const { connectedNodeIds, connectedEdgeKeys } = useMemo(() => {
    if (!selectedNodeId || !networkData) return { connectedNodeIds: new Set(), connectedEdgeKeys: new Set() };

    const cNodes = new Set([selectedNodeId]);
    const cEdges = new Set();

    networkData.edges.forEach(edge => {
      if (edge.source === selectedNodeId) {
        cNodes.add(edge.target);
        cEdges.add(`${edge.source}-${edge.target}`);
      } else if (edge.target === selectedNodeId) {
        cNodes.add(edge.source);
        cEdges.add(`${edge.source}-${edge.target}`);
      }
    });

    return { connectedNodeIds: cNodes, connectedEdgeKeys: cEdges };
  }, [selectedNodeId, networkData]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (!networkData) return [];
    let list = networkData.nodes;

    if (filterType === 'CLUSTER_ONLY') {
      const cluster = networkData.clusters[0];
      const memberSet = new Set([
        ...(cluster?.member_applicant_ids || []),
        ...(cluster?.shared_attributes?.device_ids || []),
        ...(cluster?.shared_attributes?.ip_addresses || []),
        ...(cluster?.shared_attributes?.bank_account_ids || [])
      ]);
      list = list.filter(n => memberSet.has(n.id));
    } else if (filterType === 'SHARED_ONLY') {
      list = list.filter(n => n.is_shared || n.type === 'APPLICANT' && n.signal_count > 0);
    } else if (filterType === 'APPLICANTS_ONLY') {
      list = list.filter(n => n.type === 'APPLICANT');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(n => n.id.toLowerCase().includes(term) || (n.name && n.name.toLowerCase().includes(term)));
    }

    return list;
  }, [networkData, filterType, searchTerm]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const selectedNode = useMemo(() => {
    if (!networkData || !selectedNodeId) return null;
    return networkData.nodes.find(n => n.id === selectedNodeId);
  }, [networkData, selectedNodeId]);

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="spinner"></div>
        <p>Analyzing fraud syndicate graph & loading network nodes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-error">
        <h3>⚠️ Network Visualization Error</h3>
        <p>{error}</p>
        <button onClick={fetchNetwork} className="btn-retry">Retry Network Analysis</button>
      </div>
    );
  }

  const { summary, clusters } = networkData;

  return (
    <div className="fraud-network-panel">
      {/* 1. CLUSTER SUMMARY METRICS HEADER */}
      <div className="network-summary-header">
        <div className="metric-card highlight-card">
          <div className="metric-icon">🕸️</div>
          <div className="metric-body">
            <span className="metric-title">Suspicious Clusters</span>
            <span className="metric-value">{summary.total_clusters} Active Syndicate</span>
          </div>
        </div>

        <div className="metric-card warning-card">
          <div className="metric-icon">👥</div>
          <div className="metric-body">
            <span className="metric-title">Largest Cluster</span>
            <span className="metric-value">{summary.largest_cluster_size} Applicants</span>
          </div>
        </div>

        <div className="metric-card danger-card">
          <div className="metric-icon">🔗</div>
          <div className="metric-body">
            <span className="metric-title">Shared Infrastructure</span>
            <span className="metric-value">
              {summary.shared_devices_count} Device, {summary.shared_ips_count} IP, {summary.shared_bank_accounts_count} Bank Account
            </span>
          </div>
        </div>

        <div className="metric-card critical-card">
          <div className="metric-icon">🚨</div>
          <div className="metric-body">
            <span className="metric-title">Highest Risk Score</span>
            <span className="metric-value">{summary.highest_risk_score} / 100 ({summary.highest_risk_level})</span>
          </div>
        </div>
      </div>

      {/* CONTROLS & FILTER BAR */}
      <div className="network-controls-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search Applicant ID, Device, IP, or Bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && <button className="clear-btn" onClick={() => setSearchTerm('')}>×</button>}
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            All Entities ({summary.total_nodes})
          </button>
          <button
            className={`filter-btn danger ${filterType === 'CLUSTER_ONLY' ? 'active' : ''}`}
            onClick={() => setFilterType('CLUSTER_ONLY')}
          >
            Syndicate Cluster Only (7)
          </button>
          <button
            className={`filter-btn ${filterType === 'SHARED_ONLY' ? 'active' : ''}`}
            onClick={() => setFilterType('SHARED_ONLY')}
          >
            Shared Infra
          </button>
          <button
            className={`filter-btn ${filterType === 'APPLICANTS_ONLY' ? 'active' : ''}`}
            onClick={() => setFilterType('APPLICANTS_ONLY')}
          >
            Applicants Only (15)
          </button>
        </div>

        <div className="zoom-controls">
          <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))} title="Zoom In">+</button>
          <span>{Math.round(zoomLevel * 100)}%</span>
          <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.6))} title="Zoom Out">-</button>
          <button onClick={() => setZoomLevel(1)} title="Reset Zoom">↺</button>
        </div>
      </div>

      {/* MAIN GRAPH + INSPECTOR LAYOUT */}
      <div className="network-main-layout">
        {/* SVG GRAPH CANVAS */}
        <div className="graph-canvas-container">
          <div className="canvas-header-legend">
            <span className="legend-item"><span className="dot applicant-critical"></span> Fraud Syndicate Applicant</span>
            <span className="legend-item"><span className="dot applicant-normal"></span> Normal Applicant</span>
            <span className="legend-item"><span className="dot device"></span> Device ID</span>
            <span className="legend-item"><span className="dot ip"></span> IP Address</span>
            <span className="legend-item"><span className="dot bank"></span> Bank Account</span>
          </div>

          <svg className="network-svg" viewBox="0 0 850 580" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}>
            <defs>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* RENDER EDGES */}
            {networkData.edges.map((edge) => {
              const pSource = nodePositions[edge.source];
              const pTarget = nodePositions[edge.target];
              if (!pSource || !pTarget) return null;

              if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) return null;

              const edgeKey = `${edge.source}-${edge.target}`;
              const isSelectedEdge = connectedEdgeKeys.has(edgeKey);
              const isShared = edge.is_shared;

              return (
                <g key={edgeKey} className={`edge-group ${isSelectedEdge ? 'active-edge' : ''}`}>
                  <line
                    x1={pSource.x}
                    y1={pSource.y}
                    x2={pTarget.x}
                    y2={pTarget.y}
                    stroke={isSelectedEdge ? '#ff3b30' : (isShared ? '#ff9500' : '#3a3d4d')}
                    strokeWidth={isSelectedEdge ? 3 : (isShared ? 2 : 1)}
                    strokeDasharray={isShared ? 'none' : '3 3'}
                    opacity={selectedNodeId ? (isSelectedEdge ? 1 : 0.15) : 0.65}
                  />
                  {isShared && (
                    <text
                      x={(pSource.x + pTarget.x) / 2}
                      y={(pSource.y + pTarget.y) / 2 - 4}
                      fill="#ffb340"
                      fontSize="9"
                      textAnchor="middle"
                      className="edge-label"
                    >
                      {edge.relationship}
                    </text>
                  )}
                </g>
              );
            })}

            {/* RENDER NODES */}
            {filteredNodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNodeId === node.id;
              const isNeighbor = connectedNodeIds.has(node.id);
              const opacity = selectedNodeId ? (isSelected || isNeighbor ? 1 : 0.25) : 1;

              let nodeColor = '#30d158'; // default normal green
              let nodeRadius = 18;
              let icon = '👤';

              if (node.type === 'APPLICANT') {
                if (node.risk_score >= 80) {
                  nodeColor = '#ff453a'; // critical red
                  nodeRadius = 24;
                } else if (node.risk_score >= 30) {
                  nodeColor = '#ff9f0a';
                }
              } else if (node.type === 'DEVICE') {
                nodeColor = node.is_shared ? '#bf5af2' : '#64d2ff';
                icon = '📱';
                nodeRadius = node.is_shared ? 22 : 15;
              } else if (node.type === 'IP') {
                nodeColor = node.is_shared ? '#ff9f0a' : '#5e5ce6';
                icon = '🌐';
                nodeRadius = node.is_shared ? 22 : 15;
              } else if (node.type === 'BANK_ACCOUNT') {
                nodeColor = node.is_shared ? '#ffd60a' : '#30d158';
                icon = '🏦';
                nodeRadius = node.is_shared ? 22 : 15;
              }

              return (
                <g
                  key={node.id}
                  className={`node-group ${isSelected ? 'selected-node' : ''}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => handleSelectNode(node.id)}
                  style={{ cursor: 'pointer', opacity }}
                >
                  <circle
                    r={nodeRadius}
                    fill={nodeColor}
                    fillOpacity="0.25"
                    stroke={nodeColor}
                    strokeWidth={isSelected ? 4 : (node.is_shared || node.risk_score >= 80 ? 2.5 : 1.5)}
                    filter={node.risk_score >= 80 || node.is_shared ? 'url(#glow-red)' : undefined}
                  />

                  <text y="4" textAnchor="middle" fontSize={nodeRadius > 20 ? "14" : "11"}>
                    {icon}
                  </text>

                  <text
                    y={nodeRadius + 14}
                    textAnchor="middle"
                    fill="#e1e4e8"
                    fontSize="10"
                    fontWeight={node.is_shared || node.risk_score >= 80 ? 'bold' : 'normal'}
                    className="node-text-label"
                  >
                    {node.label}
                  </text>

                  {node.type === 'APPLICANT' && node.risk_score > 0 && (
                    <g transform={`translate(${nodeRadius - 6}, ${-nodeRadius + 4})`}>
                      <circle r="9" fill="#ff453a" />
                      <text y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                        {node.risk_score}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT SIDEBAR: SELECTED ENTITY INSPECTOR PANEL */}
        <div className="inspector-panel">
          {!selectedNode ? (
            <div className="inspector-empty">
              <span className="empty-icon">👈</span>
              <h4>Select a Node in the Graph</h4>
              <p>Click any Applicant, Device, IP, or Bank Account node to view full relationship forensics and risk details.</p>
            </div>
          ) : (
            <div className="inspector-content">
              {/* INSPECTOR HEADER */}
              <div className="inspector-header">
                <div className="entity-badge-row">
                  <span className={`entity-type-badge ${selectedNode.type.toLowerCase()}`}>
                    {selectedNode.type === 'APPLICANT' ? '👤 Applicant' :
                      selectedNode.type === 'DEVICE' ? '📱 Device ID' :
                      selectedNode.type === 'IP' ? '🌐 IP Address' : '🏦 Bank Account'}
                  </span>
                  {selectedNode.is_shared && (
                    <span className="badge-shared-alert">⚠️ Shared Infrastructure</span>
                  )}
                </div>
                <h3>{selectedNode.id}</h3>
                {selectedNode.name && <p className="entity-name">{selectedNode.name}</p>}
              </div>

              {/* APPLICANT NODE DETAILS */}
              {selectedNode.type === 'APPLICANT' && (
                <div className="applicant-inspector">
                  {loadingRiskDetail ? (
                    <div className="spinner-sm">Loading risk breakdown...</div>
                  ) : applicantRiskDetail ? (
                    <>
                      <div className="risk-score-banner">
                        <div className="score-ring">
                          <span className="score-num">{applicantRiskDetail.risk_score}</span>
                          <span className="score-max">/100</span>
                        </div>
                        <div className="score-meta">
                          <span className={`risk-level-tag ${applicantRiskDetail.risk_level.toLowerCase()}`}>
                            {applicantRiskDetail.risk_level} RISK
                          </span>
                          <span className="recommendation-tag">
                            Action: <strong>{applicantRiskDetail.recommendation}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="section-title">Score Breakdown ({applicantRiskDetail.signals.length} Signals)</div>
                      <div className="signals-list">
                        {applicantRiskDetail.signals.map((sig, idx) => (
                          <div key={idx} className={`signal-item severity-${sig.severity.toLowerCase()}`}>
                            <div className="sig-header">
                              <span className="sig-type">{sig.signal_type}</span>
                              <span className="sig-weight">+{sig.weight} pts</span>
                            </div>
                            <p className="sig-desc">{sig.description}</p>
                          </div>
                        ))}
                      </div>

                      {applicantRiskDetail.related_applicants.length > 0 && (
                        <div className="related-apps-section">
                          <div className="section-title">Connected Fraud Syndicate Members ({applicantRiskDetail.related_applicants.length})</div>
                          <div className="chips-container">
                            {applicantRiskDetail.related_applicants.map(relId => (
                              <button
                                key={relId}
                                className="chip-btn danger"
                                onClick={() => handleSelectNode(relId)}
                              >
                                👤 {relId}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )}

              {/* INFRASTRUCTURE NODE DETAILS (DEVICE, IP, BANK_ACCOUNT) */}
              {selectedNode.type !== 'APPLICANT' && (
                <div className="infra-inspector">
                  <div className="infra-summary-box">
                    <span className="infra-label">Connected Applicants Count:</span>
                    <span className="infra-count">{selectedNode.applicant_count || selectedNode.connected_applicants?.length || 1}</span>
                  </div>

                  <div className="section-title">Associated Applicants</div>
                  <div className="connected-applicants-list">
                    {(selectedNode.connected_applicants || []).map(appId => {
                      const appNode = networkData.nodes.find(n => n.id === appId);
                      const isCritical = appNode && appNode.risk_score >= 80;

                      return (
                        <div
                          key={appId}
                          className={`connected-app-card ${isCritical ? 'critical' : ''}`}
                          onClick={() => handleSelectNode(appId)}
                        >
                          <div className="app-card-info">
                            <span className="app-id">👤 {appId}</span>
                            <span className="app-name">{appNode?.name || 'Applicant'}</span>
                          </div>
                          {appNode && (
                            <span className={`app-risk-badge ${appNode.risk_level.toLowerCase()}`}>
                              Score: {appNode.risk_score}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
