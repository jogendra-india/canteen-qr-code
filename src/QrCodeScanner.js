import React, { useState, useCallback } from "react";
import { QrReader } from "react-qr-reader";

const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";

const QrCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [facingMode, setFacingMode] = useState(FACING_MODE_ENVIRONMENT);

  // Handle QR Code Scan Result
  const handleScan = (data) => {
    if (data) {
      setScanResult(data.text);
    }
  };

  const handleError = (err) => {
    console.error("QR Code Scan Error: ", err);
  };

  // Toggle Camera
  const handleClick = useCallback(() => {
    setFacingMode((prevState) =>
      prevState === FACING_MODE_USER
        ? FACING_MODE_ENVIRONMENT
        : FACING_MODE_USER
    );
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>QR Code Scanner</h1>
      <QrReader
        delay={300}
        onError={handleError}
        onResult={handleScan}
        constraints={{ facingMode }}
        style={{ width: "600px", margin: "auto" }}
      />
      {scanResult ? (
        <p>Scanned Result: {scanResult}</p>
      ) : (
        <p>Scan a QR code to see the result here</p>
      )}
      <button onClick={handleClick} style={{ marginTop: "20px" }}>
        Switch Camera
      </button>
    </div>
  );
};

export default QrCodeScanner;
