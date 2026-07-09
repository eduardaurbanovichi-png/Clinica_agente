const Chat = {
    // Renderiza a mensagem inicial de boas-vindas da clínica
    renderInitialMessage() {
        const config = ConfigManager.get();
        // Se por acaso a welcomeMessage não existir no config.js, define um texto padrão
        const welcomeText = config.welcomeMessage || "Olá! Sou o Urbanovichi, assistente virtual da clínica. Como posso ajudar você hoje?";
        
        this.appendBubble(welcomeText, false);
    },

    // Adiciona um balão de mensagem no corpo do chat
    appendBubble(text, isUser = false) {
        const chatContainer = document.getElementById("chat-container");
        if (!chatContainer) return;

        // TRAVA DE SEGURANÇA: Garante que 'text' seja sempre uma string válida, evitando erros de .replace()
        const safeText = typeof text === "string" ? text : String(text || "");

        // Formata as quebras de linha para tags HTML <br>
        const formattedText = safeText.replace(/\n/g, '<br>');

        // Cria a estrutura do balão de mensagem
        const bubbleWrapper = document.createElement("div");
        bubbleWrapper.classList.add("d-flex", "mb-3", isUser ? "justify-content-end" : "justify-content-start");

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isUser) {
            bubbleWrapper.innerHTML = `
                <div class="d-flex align-items-end flex-column">
                    <div class="bubble bubble-user p-3 text-white rounded-3 mb-1" style="max-width: 75%; background-color: var(--bubble-user-bg, #0d6efd);">
                        ${formattedText}
                    </div>
                    <small class="text-muted" style="font-size: 0.75rem;">${currentTime}</small>
                </div>
            `;
        } else {
            bubbleWrapper.innerHTML = `
                <div class="d-flex align-items-start flex-row">
                    <div class="avatar me-2 rounded-circle d-flex align-items-center justify-content-center text-white" style="width: 40px; height: 40px; background-color: #1e293b;">
                        🤖
                    </div>
                    <div class="d-flex align-items-start flex-column">
                        <div class="bubble bubble-ai p-3 rounded-3 mb-1" style="max-width: 75%; background-color: var(--bubble-ai-bg, #f1f5f9); color: var(--bubble-ai-text, #1f2937);">
                            <span class="ai-text-content"></span>
                        </div>
                        <small class="text-muted" style="font-size: 0.75rem;">${currentTime}</small>
                    </div>
                </div>
            `;
        }

        chatContainer.appendChild(bubbleWrapper);

        // Se for a IA respondendo, aplica o efeito de máquina de escrever (typeWriter)
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

    // Limpa o histórico visual do chat na tela
    clear() {
        const chatContainer = document.getElementById("chat-container");
        if (chatContainer) {
            chatContainer.innerHTML = "";
            this.renderInitialMessage();
        }
    }
};

// Inicializa a mensagem de boas-vindas assim que a página terminar de carregar
document.addEventListener("DOMContentLoaded", () => {
    if (typeof Chat !== 'undefined' && Chat.renderInitialMessage) {
        Chat.renderInitialMessage();
    }
});
