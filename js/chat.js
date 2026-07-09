/**
 * GESTÃO DO HISTÓRICO, CRIAÇÃO DE BOLHAS E RECURSOS DE ÁUDIO (TTS/STT)
 */

const ChatEngine = {
    history: [],
    currentUtterance: null,

    loadHistory() {
        try {
            const saved = localStorage.getItem("urbanovichi_chat_history");
            this.history = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.history = [];
        }
    },

    saveHistory() {
        localStorage.setItem("urbanovichi_chat_history", JSON.stringify(this.history));
    },

    clearHistory() {
        this.history = [];
        this.saveHistory();
        document.getElementById('chat-messages').innerHTML = "";
        this.renderInitialMessage();
    },

    renderInitialMessage() {
        const chatMessages = document.getElementById('chat-messages');
        if (this.history.length === 0) {
            this.appendBubble("ai", "Olá! Sou o Urbanovichi, assistente virtual da clínica. Como posso lhe ajudar hoje? Sinta-se à vontade para selecionar uma das ações rápidas ou digitar sua dúvida.", false);
        } else {
            this.history.forEach(msg => {
                this.appendBubble(msg.role, msg.content, false);
            });
        }
    },

    /**
     * Adiciona e renderiza a bolha na tela
     */
    appendBubble(role, text, animateText = false) {
        const chatMessages = document.getElementById('chat-messages');
        const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const wrapper = document.createElement('div');
        wrapper.className = `msg-wrapper msg-${role} animate-message`;

        const isUser = (role === "user");
        const avatarIcon = isUser ? "fa-user" : "fa-user-md-chat";

        let actionButtonsHtml = "";
        if (!isUser) {
            actionButtonsHtml = `
                <div class="msg-actions">
                    <button class="btn btn-msg-util btn-tts" title="Ouvir Resposta"><i class="fa-solid fa-volume-high"></i></button>
                    <button class="btn btn-msg-util btn-copy" title="Copiar Texto"><i class="fa-solid fa-copy"></i></button>
                </div>
            `;
        }

        wrapper.innerHTML = `
            <div class="chat-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
            <div class="msg-bubble position-relative">
                <div class="msg-content-text"></div>
                <span class="msg-meta">${timestamp}</span>
                ${actionButtonsHtml}
            </div>
        `;

        chatMessages.appendChild(wrapper);
        const textContainer = wrapper.querySelector('.msg-content-text');

        // Atribuição dos eventos internos dos botões utilitários da bolha
        if (!isUser) {
            wrapper.querySelector('.btn-copy').addEventListener('click', () => {
                navigator.clipboard.writeText(text);
                UI.showToast("Texto copiado para a área de transferência!");
            });
            wrapper.querySelector('.btn-tts').addEventListener('click', () => {
                this.speak(text);
            });
        }

        if (animateText) {
            UI.typeWriter(textContainer, text, 8, () => {
                UI.scrollToBottom();
            });
        } else {
            textContainer.innerHTML = text.replace(/\n/g, '<br>');
            UI.scrollToBottom();
        }
    },

    /**
     * Speech Synthesis (Leitor de Voz / TTS)
     */
    speak(text) {
        if (!('speechSynthesis' in window)) {
            UI.showToast("Seu navegador não oferece suporte para síntese de voz.", "error");
            return;
        }

        window.speechSynthesis.cancel(); // Cancela leituras anteriores em execução

        // Remove quebras de linha e caracteres especiais para deixar a leitura mais natural
        const cleanText = text.replace(/[*#]/g, '');
        this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
        this.currentUtterance.lang = 'pt-BR';

        // Tenta encontrar uma voz em português disponível no sistema
        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find(voice => voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR'));
        if (ptVoice) {
            this.currentUtterance.voice = ptVoice;
        }

        window.speechSynthesis.speak(this.currentUtterance);
    }
};