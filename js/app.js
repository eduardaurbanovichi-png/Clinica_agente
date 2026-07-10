document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chat-form");
    const messageInput = document.getElementById("message-input");

    // Roda a mensagem inicial imediatamente no carregamento da DOM
    if (typeof Chat !== 'undefined' && Chat.renderInitialMessage) {
        Chat.renderInitialMessage();
    }

    // Valida se os elementos vitais do formulário estão no HTML carregado
    if (!chatForm || !messageInput) {
        console.error("Erro Crítico: Elementos do formulário (chat-form ou message-input) não existem no DOM.");
        return;
    }

    // Dispara a rotina de envio de mensagens
    async function handleUserMessage(event) {
        event.preventDefault(); // Impede o envio nativo que recarrega a página

        const messageText = messageInput.value.trim();
        if (!messageText) return; // Cancela se o campo contiver apenas espaços em branco

        // 1. Injeta o balão visual do usuário na tela
        if (typeof Chat !== 'undefined' && Chat.appendBubble) {
            Chat.appendBubble(messageText, true);
        }
        
        // Limpa a caixa de texto para a próxima mensagem
        messageInput.value = "";

        // 2. Encapsula o array de histórico para repassar à API
        const messagesHist = [
            { role: "user", content: messageText }
        ];

        try {
            // 3. Encaminha para o módulo de integração
            if (typeof OpenRouterAPI !== 'undefined' && OpenRouterAPI.sendMessage) {
                const response = await OpenRouterAPI.sendMessage(messagesHist);
                
                // 4. Exibe o resultado/resposta final da IA na tela
                if (typeof Chat !== 'undefined' && Chat.appendBubble) {
                    Chat.appendBubble(response, false);
                }
            } else {
                if (typeof Chat !== 'undefined' && Chat.appendBubble) {
                    Chat.appendBubble("⚠️ Erro Estrutural: O arquivo js/api.js não foi carregado corretamente.", false);
                }
            }
        } catch (error) {
            console.error("Falha ao gerenciar envio:", error);
            if (typeof Chat !== 'undefined' && Chat.appendBubble) {
                Chat.appendBubble("⚠️ Ocorreu uma falha interna inesperada ao processar o chat.", false);
            }
        }
    }

    // Adiciona o listener para monitorar o submit
    chatForm.addEventListener("submit", handleUserMessage);
});
