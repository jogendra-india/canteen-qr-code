import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

const ManualCameraExposure = ({ onScan }) => {
  const videoRef = useRef(null);

  // -- CAMERA ACTIVE ON MOUNT --
  const [cameraActive, setCameraActive] = useState(true);
  useEffect(() => {
    setCameraActive(true);
    return () => setCameraActive(false);
  }, []);

  // -- MOBILE DETECTION (for video sizing) --
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // -- FACING MODE (front vs. back) -- persisted
  const [facingMode, setFacingMode] = useState(() => {
    return localStorage.getItem('facingMode') || 'user';
  });
  useEffect(() => {
    localStorage.setItem('facingMode', facingMode);
  }, [facingMode]);

  // Toggle front/back camera
  const handleSwitchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  // -- ADVANCED CONTROLS TOGGLE --
  const [showControls, setShowControls] = useState(false);

  // -- BRIGHTNESS: 0..255 (using advanced constraints) -- persisted
  const [brightness, setBrightness] = useState(() => {
    const val = localStorage.getItem('brightness');
    return val ? parseInt(val, 10) : 128; // default 128
  });
  useEffect(() => {
    localStorage.setItem('brightness', brightness.toString());
  }, [brightness]);

  // -- EXPOSURE COMPENSATION: 0..255 (using advanced constraints) -- persisted
  const [exposureCompensation, setExposureCompensation] = useState(() => {
    const val = localStorage.getItem('exposureCompensation');
    return val ? parseInt(val, 10) : 0; // default 0
  });
  useEffect(() => {
    localStorage.setItem('exposureCompensation', exposureCompensation.toString());
  }, [exposureCompensation]);

  // -- EXPOSURE TIME: 1..2500 (using advanced constraints) -- persisted
  const [exposureTime, setExposureTime] = useState(() => {
    const val = localStorage.getItem('exposureTime');
    return val ? parseInt(val, 10) : 1000; // default 1000
  });
  useEffect(() => {
    localStorage.setItem('exposureTime', exposureTime.toString());
  }, [exposureTime]);

  // -- STREAM REFERENCE --
  const [stream, setStream] = useState(null);

  // 1. Initialize camera stream whenever cameraActive/facingMode changes
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
                .catch((err) => console.warn('Play interrupted:', err));
            };
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
        }
      })();
    }

    // Cleanup: stop camera if turning off or unmounting
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive, facingMode]);

  // 2. Apply advanced constraints (brightness, exposureCompensation, exposureTime)
  useEffect(() => {
    if (!stream) return;
    const [videoTrack] = stream.getVideoTracks();
    if (!videoTrack || !videoTrack.applyConstraints) return;

    videoTrack
      .applyConstraints({
        advanced: [
          // Chrome on Android may respect these; others may ignore them
          { brightness },                  // 0..255
          { exposureCompensation },        // 0..255 (some devices treat it as EV stops, not sure if 0..255 works widely)
          { exposureMode: 'manual' },      // Typically need 'manual' for exposureTime
          { exposureTime },                // 1..2500 (in microseconds on some devices)
        ],
      })
      .catch((err) => {
        console.warn('Advanced constraints not supported:', err);
      });
  }, [brightness, exposureCompensation, exposureTime, stream]);

  // -- SCAN RESULT --
  const [qrResult, setQrResult] = useState('No result');

  // 3. QR scanning with jsQR
  useEffect(() => {
    if (!cameraActive) return;

    let scanning = true;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

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

  return (
    <div style={{ textAlign: 'center', padding: 10 }}>
      <h2>QR Scan Canteen</h2>

      {/* VIDEO PREVIEW */}
      <div style={{ marginTop: 20 }}>
        <video
          ref={videoRef}
          style={{
            width: isMobile ? '100%' : '500px',
            background: '#000',
            // Flip horizontally if facingMode === "user" to mirror the camera
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
          playsInline
          muted
        />
      </div>

      {/* QR CODE RESULT */}
      <p style={{ marginTop: 20, fontWeight: 'bold' }}>
        QR Code: {qrResult}
      </p>

      {/* TOGGLE ADVANCED CONTROLS */}
      <div style={{ marginTop: 10 }}>
        <button onClick={() => setShowControls(!showControls)}>
          {showControls ? 'Hide Camera Controls' : 'Show Camera Controls'}
        </button>
      </div>

      {/* ADVANCED CONTROLS (conditionally shown) */}
      {showControls && (
        <div
          style={{
            margin: '20px auto',
            width: isMobile ? '90%' : '400px',
            textAlign: 'left',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '6px',
          }}
        >
          <h4>Camera Controls</h4>

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
              style={{ marginLeft: 10, width: '70%' }}
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
              style={{ marginLeft: 10, width: '70%' }}
            />
            <span style={{ marginLeft: 10 }}>{exposureCompensation}</span>
          </div>

          {/* EXPOSURE TIME */}
          <div style={{ marginBottom: 10 }}>
            <label>Exposure Time (1-2500):</label>
            <input
              type="range"
              min="1"
              max="2500"
              step="1"
              value={exposureTime}
              onChange={(e) => setExposureTime(parseInt(e.target.value, 10))}
              style={{ marginLeft: 10, width: '70%' }}
            />
            <span style={{ marginLeft: 10 }}>{exposureTime}</span>
          </div>
        </div>
      )}

      {/* STOP & SWITCH CAMERA (at bottom) */}
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
