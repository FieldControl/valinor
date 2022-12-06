import React from 'react';
import { toast } from 'react-toastify';
import { FaExclamationTriangle, FaCheck } from 'react-icons/fa';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function notify(msg: string, type: string) {
  const content = (
    <div className="toast-card">
      {type === 'error' ? <FaExclamationTriangle color="#fff" size={18} /> : <FaCheck color="#fff" size={18} />}
      <p className="toast-message text--justify">{msg}</p>
    </div>
  );

  if (type === 'error') {
    toast.error(content, {
      position: 'top-right',
      autoClose: 7000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
  } else if (type === 'success') {
    toast.success(content, {
      position: 'top-right',
      autoClose: 7000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
  }
}
