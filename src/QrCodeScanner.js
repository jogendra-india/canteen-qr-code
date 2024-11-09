import React, { useState } from "react";
import QrScanner from "react-qr-scanner";

const QrCodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isBackCamera, setIsBackCamera] = useState(true);

  const handleScan = (data) => {
    if (data) {
      setScanResult(data.text);
    }
  };

  const handleError = (err) => {
    console.error("QR Code Scan Error: ", err);
  };

  const toggleCamera = () => {
    setIsBackCamera((prevState) => !prevState);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>QR Code Scanner</h1>
      <QrScanner
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "600px", margin: "auto" }}
        facingMode={isBackCamera ? "environment" : "user"} // Switch between back and front cameras
      />
      {scanResult ? (
        <p>Scanned Result: {scanResult}</p>
      ) : (
        <p>Scan a QR code to see the result here</p>
      )}
      <button onClick={toggleCamera} style={{ marginTop: "20px" }}>
        Switch Camera
      </button>
    </div>
  );
};

export default QrCodeScanner;
