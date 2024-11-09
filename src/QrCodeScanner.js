import React, { useState } from "react";
import QrScanner from "react-qr-scanner";

const QrCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);

  const handleScan = (data) => {
    if (data) {
      setScanResult(data.text);
    }
  };

  const handleError = (err) => {
    console.error("QR Code Scan Error: ", err);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>QR Code Scanner</h1>
      <QrScanner
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "600px", margin: "auto" }}
      />
      {scanResult ? (
        <p>Scanned Result: {scanResult}</p>
      ) : (
        <p>Scan a QR code to see the result here</p>
      )}
    </div>
  );
};

export default QrCodeScanner;
