import React, { useState, useCallback, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';

const QrCodeScanner = ({ onScan }) => {
  const [scanResult, setScanResult] = useState('No result');
  const [facingMode, setFacingMode] = useState('user'); // Start with back camera

  const [isMobile, setIsMobile] = useState(false);

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

  const handleClick = useCallback(() => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      <input
        type="text"
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

      {/* QR Reader container with 0px top/bottom margin */}
      <div
        style={{
          width: '80vw',
          height: 'auto',
          padding: '2px',
        }}
      >
        <QrReader
          key={facingMode}
          videoStyle={{ height: isMobile ? '100%' : '70%', }}
          constraints={{ facingMode }}
          videoContainerStyle= {{ position: 'relative' }}
          onResult={(result, error) => {
            if (result) {
              setScanResult(result?.text || 'No result');
              onScan(result?.text || 'No result');
            }
            // do nothing on error
          }}
        />
      </div>
      <p>{scanResult}</p>
      <button onClick={handleClick} style={{ marginTop: '20px' }}>
        Switch Camera
      </button>
    </div>
  );
};

export default QrCodeScanner;
