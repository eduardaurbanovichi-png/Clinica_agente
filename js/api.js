const OpenRouterAPI = {
    // Define o comportamento e as regras de negócio que a IA deve seguir
    getSystemPrompt() {
        return `Você é o Urbanovichi, assistente virtual inteligente da Clínica Urbanovichi.
Seu objetivo é ajudar os pacientes com informações sobre consultas, exames, especialidades, horários e orientações gerais de forma extremamente educada, profissional e prestativa.
Mantenha suas respostas claras, acolhedoras e organizadas.`;
    },

    // Envia o histórico estruturado de conversas para a API
    async sendMessage(messagesHist) {
        const config = ConfigManager.get();
        const apiKey = config.openRouterKey; // Pega a chave salva nas configurações do navegador
        
        if (!apiKey) {
            return "⚠️ Chave de API não configurada. Por favor, clique no ícone de engrenagem no topo e salve sua chave de API válida.";
        }

        const fullMessages = [
            { role: "system", content: this.getSystemPrompt() },
            ...messagesHist
        ];

        try {
            // Requisição para os servidores oficiais da API Groq
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: config.model || "llama3-8b-8192",
                    messages: fullMessages,
                    temperature: 0.7
                })
            });

            // Captura erros de resposta da API (ex: chave errada ou cota estourada)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const apiErrorMessage = errorData?.error?.message || `Erro HTTP ${response.status}`;
                return `⚠️ Erro retornado pela API: ${apiErrorMessage}.`;
            }

            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content;

            if (!reply) {
                return "⚠️ A API processou a mensagem com sucesso, mas retornou um bloco de dados vazio.";
            }

            return reply;

        } catch (error) {
            console.error("Erro de conexão na requisição:", error);
            return `⚠️ Erro de rede ou CORS: Não foi possível conectar ao servidor da API. Verifique sua conexão ou se a chave está inserida corretamente.`;
        }
    }
};
