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
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Lưu ý</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div dangerouslySetInnerHTML={{ __html: modal_Show || "Không có nội dung để hiển thị." }} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleConfirm} disabled={timeLeft > 0}>
          Tôi đã đọc {timeLeft > 0 && `(${timeLeft}s)`} {/* Hiển thị thời gian đếm ngược */}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}