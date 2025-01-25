import React from 'react';

const Toast = ({ message, type }) => {
  // Simple inline styling. Move into CSS if you prefer.
  const containerStyle = {
    position: 'relative',
    marginBottom: '10px',
    padding: '10px 15px',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '14px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease-in-out',
    backgroundColor: type === 'success' ? '#4caf50' : '#f44336',
  };


  return (
    <div style={containerStyle}>
      {message}
    </div>
  );
};

export default Toast;
