import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { analyzeUrl } from '../services/api';

export default function QRScannerPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrResult, setQrResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const isUrl = (text) => {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
    return /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed);
  };

  const processImageFile = async (file) => {
    if (!file) return;

    // 1. File Type Validation
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const extension = file.name ? file.name.split('.').pop().toLowerCase() : '';
    const isImageExt = ['png', 'jpg', 'jpeg', 'webp'].includes(extension);

    if (!validTypes.includes(file.type) && !isImageExt) {
      setError('Unsupported file format. Please upload a PNG, JPG, or WEBP image.');
      setQrResult(null);
      setFileName(file.name || 'Selected file');
      return;
    }

    setError(null);
    setLoading(true);
    setFileName(file.name);
    setQrResult(null);

    try {
      // 2. Decode QR Code using jsQR via Canvas
      const decodedText = await decodeQR(file);

      if (!decodedText) {
        setError('No QR code detected in this image.');
        setLoading(false);
        return;
      }

      // 3. Route decoded content
      const contentIsUrl = isUrl(decodedText);

      if (contentIsUrl) {
        // Send decoded URL through existing Digital Trust URL analyzer
        let targetUrl = decodedText.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = 'https://' + targetUrl;
        }

        const analysisData = await analyzeUrl(targetUrl);

        setQrResult({
          type: 'url',
          decodedContent: decodedText,
          analysis: analysisData
        });
      } else {
        // Plain text content - do NOT call URL analyzer
        setQrResult({
          type: 'text',
          decodedContent: decodedText
        });
      }
    } catch (err) {
      console.error('QR processing error:', err);
      setError(err.message || 'Error processing QR image.');
    } finally {
      setLoading(false);
    }
  };

  const decodeQR = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code && code.data) {
              resolve(code.data);
            } else {
              resolve(null);
            }
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image element.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const resetScan = () => {
    setQrResult(null);
    setError(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreBadgeClass = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'badge-critical';
      case 'HIGH':
        return 'badge-danger';
      case 'MEDIUM':
        return 'badge-warning';
      case 'LOW':
      default:
        return 'badge-success';
    }
  };

  return (
    <div className="qr-scanner-card card-styled">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">QR Code Security Scanner</h3>
          <p className="panel-subtitle">Upload or drag a QR image for client-side decoding and security inspection</p>
        </div>
        <span className="demo-chip">Client-Side Decoder</span>
      </div>

      {!qrResult && (
        <div className="qr-upload-wrapper">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            style={{ display: 'none' }}
            id="qr-file-input"
          />

          <div
            className="qr-dropzone-box"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <div className="qr-drop-icon">
              {loading ? (
                <div className="spinner large"></div>
              ) : (
                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4m4-4h.01M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4zm16 4h-4v-4h4v4z"/>
                </svg>
              )}
            </div>

            <div className="qr-drop-content">
              {loading ? (
                <span className="qr-status-text">Decoding QR image locally...</span>
              ) : (
                <>
                  <span className="qr-upload-title">QR CODE SECURITY SCAN</span>
                  <span className="qr-upload-subtitle">Click to select file or drag & drop image here</span>
                  <button type="button" className="btn-upload-qr" onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current && fileInputRef.current.click();
                  }}>
                    📁 Select QR Image (PNG, JPG, WEBP)
                  </button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="error-alert mt-3">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">{error}</span>
            </div>
          )}
        </div>
      )}

      {/* QR Result View */}
      {qrResult && (
        <div className="qr-result-container">
          <div className="qr-result-header-bar">
            <div>
              <span className="qr-result-tag">QR CODE DECODED</span>
              <span className="file-name-hint">{fileName}</span>
            </div>
            <button type="button" className="btn-reset-scan" onClick={resetScan}>
              🔄 Scan Another QR
            </button>
          </div>

          {/* Result Case A: URL Content */}
          {qrResult.type === 'url' && qrResult.analysis && (
            <div className="scan-result-card mt-2">
              <div className="qr-destination-box">
                <span className="box-label">Decoded Destination URL:</span>
                <code className="decoded-url-display">{qrResult.decodedContent}</code>
              </div>

              {/* Score Header */}
              <div className="result-score-header">
                <div className="score-main-block">
                  <div className={`score-badge-circle ${getScoreBadgeClass(qrResult.analysis.risk_level)}`}>
                    <span className="score-num">{qrResult.analysis.risk_score}</span>
                    <span className="score-denom">/100</span>
                  </div>
                  <div>
                    <div className="risk-level-tag-row">
                      <span className="tag-title">Risk Level:</span>
                      <span className={`badge-pill ${getScoreBadgeClass(qrResult.analysis.risk_level)}`}>
                        {qrResult.analysis.risk_level} RISK
                      </span>
                    </div>
                    <div className="url-meta-details">
                      Domain: <code>{qrResult.analysis.domain}</code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="explanation-box">
                <div className="explanation-title">📌 Risk Assessment Summary</div>
                <p className="explanation-text">{qrResult.analysis.explanation}</p>
              </div>

              {/* Risk Signals */}
              {qrResult.analysis.detected_risk_signals && qrResult.analysis.detected_risk_signals.length > 0 && (
                <div className="signals-group danger-group">
                  <h5 className="signals-group-title">
                    <span className="icon">🚨</span> Detected Risk Signals ({qrResult.analysis.detected_risk_signals.length})
                  </h5>
                  <ul className="signals-bullet-list">
                    {qrResult.analysis.detected_risk_signals.map((sig, i) => (
                      <li key={i} className="risk-signal-bullet">{sig}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Positive Signals */}
              {qrResult.analysis.positive_signals && qrResult.analysis.positive_signals.length > 0 && (
                <div className="signals-group positive-group">
                  <h5 className="signals-group-title">
                    <span className="icon">🛡️</span> Positive / Trust Signals ({qrResult.analysis.positive_signals.length})
                  </h5>
                  <ul className="signals-bullet-list">
                    {qrResult.analysis.positive_signals.map((sig, i) => (
                      <li key={i} className="positive-signal-bullet">{sig}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Result Case B: Plain Text Content */}
          {qrResult.type === 'text' && (
            <div className="plain-text-qr-card">
              <div className="text-qr-header">
                <span className="badge-pill badge-info">PLAIN TEXT CONTENT</span>
                <span className="text-subtle font-sm">Non-URL Data</span>
              </div>
              <div className="qr-decoded-text-box">
                <span className="box-label">Decoded Text Payload:</span>
                <div className="decoded-text-value">"{qrResult.decodedContent}"</div>
              </div>
              <div className="info-box mt-2">
                ℹ️ This QR code contains plain text data, not a Web URL address. URL risk analysis was not performed.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
