document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chat-form");
    const messageInput = document.getElementById("message-input");

    // Inicializa a mensagem de boas-vindas usando o objeto correto
    if (typeof Chat !== 'undefined' && Chat.renderInitialMessage) {
        Chat.renderInitialMessage();
    }

    // Verifica se os elementos do formulário existem na tela
    if (!chatForm || !messageInput) {
        console.error("Erro: Elementos do formulário de chat não foram encontrados no HTML.");
        return;
    }

    // Gerencia o envio da mensagem do usuário
    async function handleUserMessage(event) {
        event.preventDefault(); // Impede o recarregamento da página

        const messageText = messageInput.value.trim();
        if (!messageText) return; // Retorna se o texto estiver vazio

        // 1. Exibe o balão do usuário na tela
        if (typeof Chat !== 'undefined' && Chat.appendBubble) {
            Chat.appendBubble(messageText, true);
        }
        
        // Limpa o campo de entrada de texto
        messageInput.value = "";

        // 2. Monta o histórico que será enviado para a API
        const messagesHist = [
            { role: "user", content: messageText }
        ];

        try {
            // 3. Envia para o Groq através do api.js
            if (typeof OpenRouterAPI !== 'undefined' && OpenRouterAPI.sendMessage) {
                const response = await OpenRouterAPI.sendMessage(messagesHist);
                
                // 4. Exibe a resposta final do agente na tela
                if (typeof Chat !== 'undefined' && Chat.appendBubble) {
                    Chat.appendBubble(response, false);
                }
            } else {
                if (typeof Chat !== 'undefined' && Chat.appendBubble) {
                    Chat.appendBubble("⚠️ Erro Interno: O arquivo de integração da API (api.js) não respondeu.", false);
                }
            }
        } catch (error) {
            console.error("Erro ao processar mensagem:", error);
            if (typeof Chat !== 'undefined' && Chat.appendBubble) {
                Chat.appendBubble("⚠️ Falha ao tentar obter resposta do agente.", false);
            }
        }
    }

    // Ativa o envio ao clicar no botão ou pressionar Enter
    chatForm.addEventListener("submit", handleUserMessage);
});
