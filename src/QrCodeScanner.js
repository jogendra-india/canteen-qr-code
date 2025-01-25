import React, { useState, useCallback, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';

const QrCodeScanner = ({ onScan }) => {
  const [scanResult, setScanResult] = useState('No result');
  const [isMobile, setIsMobile] = useState(false);

  // 1) Retrieve brightness from localStorage or default to 1
  const [brightness, setBrightness] = useState(() => {
    const storedBrightness = localStorage.getItem('brightness');
    return storedBrightness ? parseFloat(storedBrightness) : 1;
  });

  // 1) Retrieve faceMode from localStorage or default to 1
  const [facingMode, setFacingMode] = useState(() => {
    const storedFacingMode = localStorage.getItem('facingMode');
    return storedFacingMode ? storedFacingMode : 'user';
  });

  // 2) Persist brightness in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('brightness', brightness.toString());
  }, [brightness]);

  // Persist facingMode in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('facingMode', facingMode);
  }, [facingMode]);

  // Detect screen size on mount and whenever resized
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // mobile breakpoint
    };
    // Run once to set initial state
    handleResize();
    // Listen for resize events
    window.addEventListener('resize', handleResize);

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle camera mode (front vs. back)
  const handleClick = useCallback(() => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
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

      {/* QR Reader container */}
      <div
        style={{
          width: '80vw',
          height: 'auto',
          padding: '2px',
          margin: '0px auto',
        }}
      >
        <QrReader
          key={facingMode}
          // 3) Remove autofocus by specifying advanced constraints if supported
          constraints={{
            facingMode,
            advanced: [{ focusMode: 'manual' }], 
            // Some devices/browsers may not support this
          }}
          onResult={(result, error) => {
            if (result) {
              setScanResult(result?.text || 'No result');
              onScan(result?.text || 'No result');
            }
            // do nothing on error
          }}
          videoContainerStyle={{ position: 'relative' }}
          videoStyle={{
            // Adjust height for mobile vs. desktop
            height: isMobile ? '100%' : '70vh',
            // Use CSS filter to control brightness
            filter: `brightness(${brightness})`,
          }}
        />
      </div>

      <p>{scanResult}</p>

      <button onClick={handleClick} style={{ marginTop: '10px' }}>
        Switch Camera
      </button>
    </div>
  );
};

export default QrCodeScanner;
