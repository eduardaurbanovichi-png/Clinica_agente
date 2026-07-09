/**
 * GERENCIAMENTO DE INTERFACE DO USUÁRIO (DOM, TOASTS, TEMAS)
 */

const UI = {
    toast: null,

    init() {
        this.toast = new bootstrap.Toast(document.getElementById('app-toast'));
    },

    showToast(message, type = "success") {
        const toastEl = document.getElementById('app-toast');
        const toastText = document.getElementById('toast-text');
        
        toastEl.className = `toast align-items-center border-0 shadow text-white bg-${type === "success" ? "success" : "danger"}`;
        
        const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
        toastText.innerHTML = `<i class="fa-solid ${icon} fs-5"></i> <span>${message}</span>`;
        
        this.toast.show();
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        const icon = document.querySelector('#btn-theme-toggle i');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    },

    updateClinicName(name) {
        document.getElementById('nav-clinic-name').textContent = name;
    },

    showTyping(show) {
        const indicator = document.getElementById('typing-indicator');
        if (show) {
            indicator.classList.remove('d-none');
        } else {
            indicator.classList.add('d-none');
        }
        this.scrollToBottom();
    },

    scrollToBottom() {
        const chatBody = document.getElementById('chat-messages');
        chatBody.scrollTop = chatBody.scrollHeight;
    },

    /**
     * Renderiza o efeito de máquina de escrever letra por letra.
     */
 typeWriter(element, text, speed = 8, callback = null) {
        let i = 0;
        element.innerHTML = "";
        
        // Garante que 'text' seja uma string válida para evitar o erro de .length
        const safeText = typeof text === "string" ? text : String(text || "");
        
        function type() {
            if (i < safeText.length) {
                if (safeText.substr(i, 1) === '\n') {
                    element.innerHTML += '<br>';
                } else {
                    element.innerHTML += safeText.charAt(i);
                }
                i++;
                UI.scrollToBottom();
                setTimeout(type, speed);
            } else {
                if (callback) callback();
            }
        }
        type();
    }
};
