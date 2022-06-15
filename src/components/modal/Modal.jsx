import React, { Children } from "react";

import closeImg from "../../assets/close.png"

import "./styles.scss";

function Modal({ isOpen, setIsOpen, children }) {
  return (
    <div className="modal-bg" style={{ display: isOpen ? "flex" : "none" }}>
      <div className="modal-ui">
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          <img src={closeImg} alt="fechar" />
        </button>
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
