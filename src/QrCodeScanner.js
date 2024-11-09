import React, { useState, useCallback } from "react";
import { QrReader } from "react-qr-reader";

const QrCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // Start with back camera

  // Handle QR Code Scan Result
  const handleScan = (result) => {
    if (result) {
      setScanResult(result?.text || "");
    }
  };

  const handleError = (error) => {
    console.error("QR Code Scan Error: ", error);
  };

  // Toggle Camera
  const handleClick = useCallback(() => {
    setFacingMode((prevMode) =>
      prevMode === "user" ? "environment" : "user"
    );
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>QR Code Scanner</h1>
      <QrReader
        delay={300}
        constraints={{ facingMode }}
        onError={handleError}
        onResult={(result, error) => {
          if (result) handleScan(result);
          if (error) handleError(error);
        }}
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
