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
    <div style={{ textAlign: 'center' }}>
      <h2>Canteen QR Scan</h2>
      <QrReader
        key={facingMode}
        constraints={{ facingMode }}
        onResult={(result, error) => {
          if (result) {
            setScanResult(result?.text || 'No result');
            onScan(result?.text || 'No result');
          }

          if (error) {
           // do nothing

          }
        }}
        style={{ width: '100%', maxWidth: '800px', margin: 'auto' }}
      />
      <input
        type='text'
        placeholder='Enter Staff No'
        onChange={(e) => onScan(e.target.value)}
      />
      <p>{scanResult}</p>
      <button onClick={handleClick} style={{ marginTop: '20px' }}>
        Switch Camera
      </button>
    </div>
  );
};

export default QrCodeScanner;
