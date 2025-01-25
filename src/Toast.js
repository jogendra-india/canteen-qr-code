import React from 'react';

const Toast = ({ message, type, onClose }) => {
  if (!message) return null;

  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    padding: '10px 15px',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '14px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease-in-out',
    backgroundColor: type === 'success' ? '#4caf50' : '#f44336',
  };

  const closeButtonStyle = {
    marginLeft: '10px',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      {message}
      <button style={closeButtonStyle} onClick={onClose}>x</button>
    </div>
  );
};

export default Toast;
