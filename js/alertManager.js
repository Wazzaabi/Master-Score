// alertManager.js
window.alertManager = {
  show({ message, confirmText = "OK", cancelText = null, onConfirm = () => {}, onCancel = () => {} }) {
    const overlay = document.getElementById('alert-overlay');
    const messageBox = document.getElementById('alert-message');
    const btnConfirm = document.getElementById('alert-confirm');
    const btnCancel  = document.getElementById('alert-cancel');

    messageBox.textContent = message;
    btnConfirm.textContent = confirmText;

    if (cancelText !== null && cancelText !== "") {
      btnCancel.textContent = cancelText;
      btnCancel.style.display = 'inline-block';
    } else {
      btnCancel.style.display = 'none';
    }

    const close = () => overlay.classList.add('hidden');

    const confirmHandler = () => {
      close();
      onConfirm();
      cleanup();
    };

    const cancelHandler = () => {
      close();
      onCancel();
      cleanup();
    };

    function cleanup() {
      btnConfirm.removeEventListener('click', confirmHandler);
      btnCancel.removeEventListener('click', cancelHandler);
    }

    btnConfirm.addEventListener('click', confirmHandler);
    btnCancel.addEventListener('click', cancelHandler);

    overlay.classList.remove('hidden');
  }

};
