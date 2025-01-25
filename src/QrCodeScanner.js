import React, { useState, useEffect, useRef, useCallback } from 'react';
import QrScanner from 'qr-scanner';

const QrCodeScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Scan result text (for display)
  const [scanResult, setScanResult] = useState('No result');

  // Persisted brightness
  const [brightness, setBrightness] = useState(() => {
    const storedBrightness = localStorage.getItem('brightness');
    return storedBrightness ? parseFloat(storedBrightness) : 1;
  });

  // Persisted facingMode
  const [facingMode, setFacingMode] = useState(() => {
    const storedFacingMode = localStorage.getItem('facingMode');
    return storedFacingMode || 'user'; // default to front camera
  });

  // Detect if it's mobile for layout (optional)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist brightness in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('brightness', brightness.toString());
    // Also update video element's filter if available
    if (videoRef.current) {
      videoRef.current.style.filter = `brightness(${brightness})`;
    }
  }, [brightness]);

  // Persist facingMode in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('facingMode', facingMode);
    // If the scanner is already created, switch cameras
    if (qrScannerRef.current) {
      // The library allows picking a camera by "user" or "environment"
      qrScannerRef.current.setCamera(facingMode).catch((err) => {
        console.error('Camera switch error:', err);
      });
    }
  }, [facingMode]);

  // Initialize QrScanner on mount
  useEffect(() => {
    if (!videoRef.current) return;

    // Create new QrScanner instance
    qrScannerRef.current = new QrScanner(
      videoRef.current,
      (result) => {
        // If we're using the new API (options object),
        // result is an object: { data, cornerPoints, ... }
        const text = result?.data || ''; // Safely handle missing data
        setScanResult(text || 'No result');
        onScan(text || 'No result');
      },
      {
        // We prefer the user's chosen facingMode
        preferredCamera: facingMode,
        returnDetailedScanResult: true, // get the result object with .data
        // You can tune other options, e.g. highlightScanRegion, maxScansPerSecond, etc.
      }
    );

    // Start scanning
    qrScannerRef.current.start().catch((err) => {
      console.error('Camera start error:', err);
    });

    // Clean up on unmount
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
    // We only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the video filter whenever brightness changes (in case the videoRef was not ready before).
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.filter = `brightness(${brightness})`;
    }
  }, [brightness]);

  // Toggle camera (front vs. back)
  const handleClick = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      {/* Numeric Input */}
      <input
        type="tel"
        inputMode="numeric"
        placeholder="Enter Staff No"
        onChange={(e) => onScan(e.target.value)}
        style={{
          width: '70%',
          maxWidth: '400px',
          padding: '10px',
          margin: '0px auto',
          display: 'block',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      />
      <h2 style={{ marginTop: '15px' }}>Canteen QR Scan</h2>

      {/* Brightness Slider */}
      <div style={{ marginTop: '20px' }}>
        <label>
          <strong>Video Brightness: </strong>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={brightness}
            onChange={(e) => setBrightness(e.target.value)}
            style={{ verticalAlign: 'middle', width: '200px' }}
          />
          <span style={{ marginLeft: '10px' }}>{brightness}</span>
        </label>
      </div>

      {/* Video Container */}
      <div
        style={{
          width: '80vw',
          height: 'auto',
          margin: '20px auto 0',
          border: '1px solid #ccc',
          position: 'relative',
        }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: isMobile ? '100%' : '70vh',
            objectFit: 'cover',
          }}
          muted
        />
      </div>

      <p style={{ marginTop: '10px' }}>{scanResult}</p>

      {/* Switch Camera Button */}
      <button onClick={handleClick} style={{ marginTop: '10px' }}>
        Switch Camera
      </button>
    </div>
  );
};

export default QrCodeScanner;
