const OpenRouterAPI = {
    // Define as diretrizes de comportamento do assistente da clínica
    getSystemPrompt() {
        return `Você é o Urbanovichi, assistente virtual inteligente da Clínica Urbanovichi.
Seu objetivo é ajudar os pacientes com informações sobre consultas, exames, especialidades, horários e orientações gerais de forma extremamente educada, profissional e prestativa.
Mantenha suas respostas claras, acolhedoras e organizadas.`;
    },

    // Função principal que envia o histórico de mensagens para o Groq
    async sendMessage(messagesHist) {
        const config = ConfigManager.get();
        
        // Recupera a chave salva nas configurações do navegador
        const apiKey = config.openRouterKey; 
        
        if (!apiKey) {
            throw new Error("API_KEY_MISSING");
        }

        // Monta o payload com o prompt de sistema e o histórico de conversas
        const fullMessages = [
            { role: "system", content: this.getSystemPrompt() },
            ...messagesHist
        ];

        try {
            // Requisição direta para o endpoint oficial do Groq
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: config.model || "llama3-8b-8192", // Usa o modelo do Groq configurado
                    messages: fullMessages,
                    temperature: 0.7
                })
            });

            // Se a API retornar um status de erro (ex: 401, 403, 400)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const apiErrorMessage = errorData?.error?.message || `Erro HTTP ${response.status}`;
                return `⚠️ Erro na API do Groq: ${apiErrorMessage}. Verifique sua chave de API nas configurações.`;
            }

            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content;

            if (!reply) {
                return "⚠️ O Groq processou a requisição, mas retornou uma resposta sem texto estruturado.";
            }

            return reply;

        } catch (error) {
            console.error("Erro na requisição da API:", error);
            return `⚠️ Erro de Rede ou CORS: Não foi possível conectar ao servidor do Groq. Certifique-se de que sua chave está correta ou se o navegador está bloqueando a requisição direta (CORS).`;
        }
    }
};
