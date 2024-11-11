import React, { useState, useCallback } from 'react';
import { QrReader } from 'react-qr-reader';

const QrCodeScanner = ({ onScan }) => {
  const [scanResult, setScanResult] = useState('No result');
  const [facingMode, setFacingMode] = useState('environment'); // Start with back camera

  // Toggle Camera
  const handleClick = useCallback(() => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      <h2>Canteen QR Scan</h2>
      <div
        style={{
          width: '100vw', // Full viewport width
          margin: '0', // Remove any margin
          padding: '0 20px', // Minimal padding on the sides
          boxSizing: 'border-box',
        }}
      >
        <QrReader
          key={facingMode}
          constraints={{ facingMode }}
          onResult={(result, error) => {
            if (result) {
              setScanResult(result?.text || 'No result');
              onScan(result?.text || 'No result');
            }
            if (error) {
              // Do nothing
            }
          }}
          style={{ width: '100%', height: '100%' }} // Full width and height
        />
      </div>
      <input
        type='text'
        placeholder='or enter Staff No'
        onChange={(e) => onScan(e.target.value)}
        style={{
          width: '80%',
          maxWidth: '400px',
          padding: '10px',
          margin: '20px auto',
          display: 'block',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      />
      <p>{scanResult}</p>
      <button onClick={handleClick} style={{ marginTop: '20px' }}>
        Switch Camera
      </button>
    </div>
  );
};

export default QrCodeScanner;
