import React, { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";

const ManualCameraExposure = ({ onScan }) => {
  const videoRef = useRef(null);

  // --- CAMERA ACTIVE ON MOUNT ---
  const [cameraActive, setCameraActive] = useState(true);
  useEffect(() => {
    setCameraActive(true);
    return () => setCameraActive(false);
  }, []);

  // --- MOBILE DETECTION (for responsive video sizing) ---
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- FACING MODE (front vs. back) -- persisted ---
  const [facingMode, setFacingMode] = useState(() => {
    return localStorage.getItem("facingMode") || "user";
  });
  useEffect(() => {
    localStorage.setItem("facingMode", facingMode);
  }, [facingMode]);

  // Switch camera front/back
  const handleSwitchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  // --- SHOW/HIDE ADVANCED CONTROLS ---
  const [showControls, setShowControls] = useState(false);

  // --- EXPOSURE MODE: continuous or manual -- persisted ---
  const [exposureMode, setExposureMode] = useState(() => {
    return localStorage.getItem("exposureMode") || "continuous";
  });
  useEffect(() => {
    localStorage.setItem("exposureMode", exposureMode);
  }, [exposureMode]);

  // --- BRIGHTNESS: 0..255 (advanced constraint) -- persisted ---
  const [brightness, setBrightness] = useState(() => {
    const val = localStorage.getItem("brightness");
    return val ? parseInt(val, 10) : 128; // default = 128
  });
  useEffect(() => {
    localStorage.setItem("brightness", brightness.toString());
  }, [brightness]);

  // --- EXPOSURE COMPENSATION: 0..255 (advanced constraint) -- persisted ---
  const [exposureCompensation, setExposureCompensation] = useState(() => {
    const val = localStorage.getItem("exposureCompensation");
    return val ? parseInt(val, 10) : 0; // default = 0
  });
  useEffect(() => {
    localStorage.setItem(
      "exposureCompensation",
      exposureCompensation.toString()
    );
  }, [exposureCompensation]);

  // --- EXPOSURE TIME: 1..2500 (advanced constraint) -- persisted ---
  const [exposureTime, setExposureTime] = useState(() => {
    const val = localStorage.getItem("exposureTime");
    return val ? parseInt(val, 10) : 1000; // default = 1000
  });
  useEffect(() => {
    localStorage.setItem("exposureTime", exposureTime.toString());
  }, [exposureTime]);

  // --- MEDIA STREAM ---
  const [stream, setStream] = useState(null);

  // 1) Initialize or stop camera whenever cameraActive/facingMode changes
  useEffect(() => {
    let localStream;
    if (cameraActive) {
      (async () => {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: false,
          });
          setStream(localStream);

          if (videoRef.current) {
            videoRef.current.srcObject = localStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current
                .play()
                .catch((err) => console.warn("Play interrupted:", err));
            };
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
        }
      })();
    }
    // Cleanup if camera is turned off or component unmounts
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive, facingMode]);

  // 2) Apply advanced constraints (brightness, exposureComp, exposureTime, exposureMode)
  useEffect(() => {
    if (!stream) return;
    const [videoTrack] = stream.getVideoTracks();
    if (!videoTrack || !videoTrack.applyConstraints) return;

    const constraints = {
      advanced: [
        // Some devices might interpret brightness and exposureComp from 0..255
        { brightness },
        { exposureCompensation },
        { exposureMode }, // "continuous" or "manual"
      ],
    };

    // If exposureMode is manual, also apply exposureTime
    if (exposureMode === "manual") {
      constraints.advanced.push({ exposureTime });
    }

    videoTrack.applyConstraints(constraints).catch((err) => {
      console.warn("Advanced constraints not supported:", err);
    });
  }, [brightness, exposureCompensation, exposureTime, exposureMode, stream]);

  // --- SCAN RESULT ---
  const [qrResult, setQrResult] = useState("No result");

  // 3) QR scanning loop
  useEffect(() => {
    if (!cameraActive) return;

    let scanning = true;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const scanFrame = () => {
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || !scanning) {
        if (scanning) requestAnimationFrame(scanFrame);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code && code.data) {
        setQrResult(code.data);
        if (onScan) onScan(code.data);
      }
      requestAnimationFrame(scanFrame);
    };

    requestAnimationFrame(scanFrame);
    return () => {
      scanning = false;
    };
  }, [cameraActive, onScan]);

  // --- RESET TO DEFAULTS ---
  const handleResetControls = () => {
    // Clear localStorage for these keys
    localStorage.removeItem("facingMode");
    localStorage.removeItem("brightness");
    localStorage.removeItem("exposureCompensation");
    localStorage.removeItem("exposureTime");
    localStorage.removeItem("exposureMode");

    // Reset state to defaults
    setFacingMode("user");
    setBrightness(128);
    setExposureCompensation(0);
    setExposureTime(1000);
    setExposureMode("continuous");
  };

  return (
    <div style={{ textAlign: "center", padding: 10 }}>
      <h2>QR Scan Canteen</h2>

      {/* VIDEO PREVIEW */}
      <div style={{ marginTop: 20 }}>
        <video
          ref={videoRef}
          style={{
            width: isMobile ? "100%" : "500px",
            background: "#000",
            // Flip horizontally if front camera ("user") to look like a mirror
            transform: facingMode === "user" ? "scaleX(-1)" : "none",
          }}
          playsInline
          muted
        />
      </div>

      {/* QR CODE RESULT */}
      <p style={{ marginTop: 20, fontWeight: "bold" }}>QR Code: {qrResult}</p>

      {/* TOGGLE ADVANCED CONTROLS */}
      <div style={{ marginTop: 10 }}>
        <button onClick={() => setShowControls(!showControls)}>
          {showControls ? "Hide Camera Controls" : "Show Camera Controls"}
        </button>
      </div>

      {/* ADVANCED CONTROLS SECTION */}
      {showControls && (
        <div
          style={{
            margin: "20px auto",
            width: isMobile ? "90%" : "400px",
            textAlign: "left",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "6px",
          }}
        >
          <h4>Camera Controls</h4>

          {/* EXPOSURE MODE */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Exposure Mode
            </label>
            <select
              value={exposureMode}
              onChange={(e) => setExposureMode(e.target.value)}
            >
              <option value="continuous">Continuous</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* BRIGHTNESS */}
          <div style={{ marginBottom: 10 }}>
            <label>Brightness (0-255):</label>
            <input
              type="range"
              min="0"
              max="255"
              step="1"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
              style={{ marginLeft: 10, width: "70%" }}
            />
            <span style={{ marginLeft: 10 }}>{brightness}</span>
          </div>

          {/* EXPOSURE COMPENSATION */}
          <div style={{ marginBottom: 10 }}>
            <label>Exposure Comp (0-255):</label>
            <input
              type="range"
              min="0"
              max="255"
              step="1"
              value={exposureCompensation}
              onChange={(e) =>
                setExposureCompensation(parseInt(e.target.value, 10))
              }
              style={{ marginLeft: 10, width: "70%" }}
            />
            <span style={{ marginLeft: 10 }}>{exposureCompensation}</span>
          </div>

          {/* EXPOSURE TIME (only relevant if exposureMode=manual, but user can set it anyway) */}
          <div style={{ marginBottom: 10 }}>
            <label>Exposure Time (1-2500):</label>
            <input
              type="range"
              min="1"
              max="2500"
              step="1"
              value={exposureTime}
              onChange={(e) => setExposureTime(parseInt(e.target.value, 10))}
              style={{ marginLeft: 10, width: "70%" }}
            />
            <span style={{ marginLeft: 10 }}>{exposureTime}</span>
          </div>

          {/* RESET BUTTON */}
          <div style={{ marginTop: 15 }}>
            <button onClick={handleResetControls}>Reset Controls</button>
          </div>
        </div>
      )}

      {/* STOP & SWITCH CAMERA (BOTTOM) */}
      <div style={{ marginTop: 20 }}>
        {cameraActive ? (
          <button onClick={() => setCameraActive(false)}>Stop Camera</button>
        ) : (
          <button onClick={() => setCameraActive(true)}>Start Camera</button>
        )}

        <button onClick={handleSwitchCamera} style={{ marginLeft: 10 }}>
          Switch Camera
        </button>
      </div>
    </div>
  );
};

export default ManualCameraExposure;
