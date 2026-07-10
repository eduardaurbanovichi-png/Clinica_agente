document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chat-form");
    const messageInput = document.getElementById("message-input");

    // Verifica se os elementos principais existem na tela antes de rodar
    if (!chatForm || !messageInput) {
        console.error("Erro: Elementos do formulário de chat não foram encontrados no HTML.");
        return;
    }

    // Função que gerencia o envio da mensagem
    async function handleUserMessage(event) {
        event.preventDefault(); // Impede a página de recarregar

        const messageText = messageInput.value.trim();
        if (!messageText) return; // Não envia se estiver vazio

        // 1. Mostra a mensagem do usuário na tela
        if (typeof Chat !== 'undefined' && Chat.appendBubble) {
            Chat.appendBubble(messageText, true);
        }
        
        // Limpa o campo de texto
        messageInput.value = "";

        // 2. Cria o histórico temporário para enviar para a API
        // (Você pode expandir isso para pegar mensagens anteriores se necessário)
        const messagesHist = [
            { role: "user", content: messageText }
        ];

        try {
            // 3. Chama o Groq/OpenRouter que configuramos no api.js
            if (typeof OpenRouterAPI !== 'undefined' && OpenRouterAPI.sendMessage) {
                const response = await OpenRouterAPI.sendMessage(messagesHist);
                
                // 4. Exibe a resposta da IA na tela
                if (typeof Chat !== 'undefined' && Chat.appendBubble) {
                    Chat.appendBubble(response, false);
                }
            } else {
                if (typeof Chat !== 'undefined' && Chat.appendBubble) {
                    Chat.appendBubble("⚠️ Erro Interno: O objeto de API não foi carregado corretamente.", false);
                }
            }
        } catch (error) {
            console.error("Erro ao processar mensagem:", error);
            if (typeof Chat !== 'undefined' && Chat.appendBubble) {
                Chat.appendBubble("⚠️ Falha crítica ao tentar enviar a mensagem.", false);
            }
        }
    }

    // Vincula o evento de envio ao formulário (funciona tanto clicando no botão quanto dando Enter)
    chatForm.addEventListener("submit", handleUserMessage);
});
