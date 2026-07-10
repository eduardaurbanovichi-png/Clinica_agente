const Chat = {
    // Renderiza a mensagem de boas-vindas inicial
    renderInitialMessage() {
        const config = ConfigManager.get();
        const welcomeText = config.welcomeMessage || "Olá! Sou o Urbanovichi, assistente virtual da clínica. Como posso ajudar você hoje?";
        this.appendBubble(welcomeText, false);
    },

    // Adiciona uma nova bolha de conversa no chat-container
    appendBubble(text, isUser = false) {
        const chatContainer = document.getElementById("chat-container");
        if (!chatContainer) return;

        // Proteção contra undefined ou nulos para evitar quebra com .replace()
        const safeText = typeof text === "string" ? text : String(text || "");

        // Converte quebras de linha normais em tags <br> para formatação HTML correta
        const formattedText = safeText.replace(/\n/g, '<br>');

        const bubbleWrapper = document.createElement("div");
        bubbleWrapper.classList.add("d-flex", "mb-3", isUser ? "justify-content-end" : "justify-content-start");

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isUser) {
            bubbleWrapper.innerHTML = `
                <div class="d-flex align-items-end flex-column">
                    <div class="bubble bubble-user p-3 text-white rounded-3 mb-1" style="max-width: 75; background-color: #0d6efd;">
                        ${formattedText}
                    </div>
                    <small class="text-muted" style="font-size: 0.75rem;">${currentTime}</small>
                </div>
            `;
        } else {
            bubbleWrapper.innerHTML = `
                <div class="d-flex align-items-start flex-row">
                    <div class="avatar me-2 rounded-circle d-flex align-items-center justify-content-center text-white" style="width: 40px; height: 40px; background-color: #1e293b; flex-shrink: 0;">
                        🤖
                    </div>
                    <div class="d-flex align-items-start flex-column">
                        <div class="bubble bubble-ai p-3 rounded-3 mb-1" style="max-width: 75%; background-color: #f1f5f9; color: #1f2937;">
                            <span class="ai-text-content"></span>
                        </div>
                        <small class="text-muted" style="font-size: 0.75rem;">${currentTime}</small>
                    </div>
                </div>
            `;
        }

        chatContainer.appendChild(bubbleWrapper);

        // Aplica o efeito clássico de digitação se a mensagem for gerada pela IA
        if (!isUser) {
            const textSpan = bubbleWrapper.querySelector(".ai-text-content");
            if (textSpan && typeof UI !== 'undefined' && UI.typeWriter) {
                UI.typeWriter(textSpan, safeText);
            } else if (textSpan) {
                textSpan.innerHTML = formattedText;
                if (typeof UI !== 'undefined' && UI.scrollToBottom) UI.scrollToBottom();
            }
        } else {
            if (typeof UI !== 'undefined' && UI.scrollToBottom) UI.scrollToBottom();
        }
    },

    // Limpa a tela limpando os nós do container
    clear() {
        const chatContainer = document.getElementById("chat-container");
        if (chatContainer) {
            chatContainer.innerHTML = "";
            this.renderInitialMessage();
        }
    }
};
