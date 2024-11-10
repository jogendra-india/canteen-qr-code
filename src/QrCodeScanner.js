import React, { useState, useCallback } from 'react';
import { QrReader } from 'react-qr-reader';

const QrCodeScanner = ({ onScan }) => {
  const [scanResult, setScanResult] = useState('No result');
  const [facingMode, setFacingMode] = useState('user'); // Start with front camera

  // Toggle Camera
  const handleClick = useCallback(() => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>QR Code Scanner</h1>
      <QrReader
        key={facingMode}
        constraints={{ facingMode }}
        onResult={(result, error) => {
          if (result) {
            setScanResult(result?.text || 'No result');
            onScan(result?.text || 'No result');
          }

          if (error) {
            console.info('QR Code Scan Error: ', error);
          }
        }}
        style={{ width: '100%', maxWidth: '600px', margin: 'auto' }}
      />
      <p>{scanResult}</p>
      <button onClick={handleClick} style={{ marginTop: '20px' }}>
        Switch Camera
      </button>
    </div>
  );
};

export default QrCodeScanner;
