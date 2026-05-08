import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ id, message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle2 className="toast-icon success" />,
    error: <XCircle className="toast-icon error" />,
    warning: <AlertCircle className="toast-icon warning" />,
    info: <Info className="toast-icon info" />,
  };

  return (
    <div className={`toast-item toast-${type} animate-slide-in`}>
      <div className="toast-content">
        {icons[type]}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={() => onClose(id)}>
        <X size={16} />
      </button>
      <div className="toast-progress-bar">
        <div className={`toast-progress toast-progress-${type}`} />
      </div>
    </div>
  );
};

export const ToastContainer = ({ notifications, removeToast }) => {
  return (
    <div className="toast-container">
      {notifications.map((n) => (
        <Toast key={n.id} {...n} onClose={removeToast} />
      ))}
    </div>
  );
};

export default Toast;
