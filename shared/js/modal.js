/* --- public/shared/js/modal.js --- */
/* Controle universal de modais e confirmações */

function openModal(id) { 
    document.getElementById(id).style.display = 'flex'; 
    if (window.renderIcons) window.renderIcons(); 
}

function closeModal(id) { 
    document.getElementById(id).style.display = 'none'; 
}

// --- CONFIRM MODAL ---
let _confirmCallback = null;

function openConfirm(msg, callback) {
    document.getElementById('confirmMessage').innerText = msg;
    _confirmCallback = callback;
    document.getElementById('customConfirmModal').style.display = 'flex';
    if (window.renderIcons) window.renderIcons();
}

function closeConfirm() { 
    document.getElementById('customConfirmModal').style.display = 'none'; 
    _confirmCallback = null; 
}

function doConfirm() { 
    if (_confirmCallback) _confirmCallback(); 
    closeConfirm(); 
}
