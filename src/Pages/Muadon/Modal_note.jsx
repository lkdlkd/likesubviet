import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function Modalnote({ modal_Show }) {
  const [show, setShow] = useState(false); // Trạng thái hiển thị modal
  const [timeLeft, setTimeLeft] = useState(3); // Thời gian đếm ngược (3 giây)
  const { path } = useParams(); // Chỉ lấy path, bỏ type
  // Kiểm tra trạng thái ẩn modal từ `localStorage`
  useEffect(() => {
    if (path) {
      const hiddenUntilKey = `modalHiddenUntil_${path}`; // Key chỉ theo path
      const hiddenUntil = localStorage.getItem(hiddenUntilKey);

      if (hiddenUntil && new Date(hiddenUntil) > new Date()) {
        setShow(false);
      } else {
        setShow(true);
        setTimeLeft(3);
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [path]);

  // Xử lý khi người dùng nhấn "Tôi đã đọc"
  const handleConfirm = () => {
    setShow(false);
    if (path) {
      const hiddenUntilKey = `modalHiddenUntil_${path}`;
      const hiddenUntil = new Date();
      hiddenUntil.setHours(hiddenUntil.getHours() + 5); // Ẩn modal trong 5 tiếng
      localStorage.setItem(hiddenUntilKey, hiddenUntil.toISOString());
    }
  };
  // Xử lý khi người dùng nhấn dấu "X"
  const handleClose = () => {
    setShow(false); // Chỉ tắt modal, không lưu trạng thái ẩn
  };
  if (modal_Show === "" || modal_Show === undefined || modal_Show === null) {
    return null; // Nếu không có nội dung, không hiển thị modal
  }
  return (
    <>
      {/* Enhanced Modal Styles */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        @keyframes countdownPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        .modal-enhanced .modal-dialog {
          animation: modalFadeIn 0.3s ease both;
        }
        .modal-enhanced .modal-content {
          border: none;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          overflow: hidden;
          position: relative;
        }
        .modal-enhanced .modal-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #007bff, #28a745, #ffc107);
        }
        
        .modal-enhanced .modal-header {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px 16px 0 0;
          animation: slideInDown 0.4s ease both;
          position: relative;
          overflow: hidden;
        }
        .modal-enhanced .modal-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }
        
        .modal-enhanced .modal-title {
          color: #495057;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .modal-enhanced .modal-title::before {
          content: '⚠️';
          font-size: 1.2em;
          animation: pulse 2s infinite;
        }
        
        .modal-enhanced .btn-close {
          transition: all 0.25s ease;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-enhanced .btn-close:hover {
          transform: scale(1.1) rotate(90deg);
          background-color: rgba(220,53,69,0.1);
        }
        
        .modal-enhanced .modal-body {
          padding: 24px;
          animation: slideInDown 0.5s ease both;
          animation-delay: 0.1s;
          background: linear-gradient(135deg, #ffffff, #f8f9fa);
        }
        
        .modal-enhanced .modal-footer {
          border-top: 1px solid rgba(0,0,0,0.08);
          background: linear-gradient(135deg, #f8f9fa, #ffffff);
          animation: slideInDown 0.6s ease both;
          animation-delay: 0.2s;
          padding: 16px 24px;
        }
        
        .btn-enhanced {
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          min-width: 120px;
        }
        .btn-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .btn-enhanced:hover::before {
          left: 100%;
        }
        .btn-enhanced:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,123,255,0.3);
        }
        .btn-enhanced:active {
          transform: translateY(0);
        }
        .btn-enhanced:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .btn-primary.btn-enhanced {
          background: linear-gradient(135deg, #007bff, #0056b3);
          border: none;
        }
        .btn-primary.btn-enhanced:hover:not(:disabled) {
          background: linear-gradient(135deg, #0056b3, #003d82);
        }
        
        .countdown-text {
          animation: countdownPulse 1s infinite;
          font-weight: 600;
          color: #6c757d;
        }
        
        .modal-content-text {
          line-height: 1.6;
          color: #495057;
        }
        .modal-content-text h1, 
        .modal-content-text h2, 
        .modal-content-text h3 {
          color: #007bff;
          margin-bottom: 16px;
        }
        .modal-content-text p {
          margin-bottom: 12px;
        }
        .modal-content-text ul {
          padding-left: 20px;
        }
        .modal-content-text li {
          margin-bottom: 8px;
        }
        
        .modal-backdrop.show {
          opacity: 0.6;
          backdrop-filter: blur(2px);
        }
        
        /* Icon animations */
        .modal-icon {
          transition: all 0.3s ease;
        }
        .modal-enhanced:hover .modal-icon {
          transform: scale(1.1) rotate(5deg);
        }
      `}</style>
      
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        className="modal-enhanced"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span className="modal-icon"></span>
            Lưu ý
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div 
            className="modal-content-text"
            dangerouslySetInnerHTML={{ __html: modal_Show || "Không có nội dung để hiển thị." }} 
          />
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="primary" 
            className="btn-enhanced"
            onClick={handleConfirm} 
            disabled={timeLeft > 0}
          >
            <i className="ti ti-check me-2"></i>
            Tôi đã đọc 
            {timeLeft > 0 && (
              <span className="countdown-text ms-2">
                ({timeLeft}s)
              </span>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}