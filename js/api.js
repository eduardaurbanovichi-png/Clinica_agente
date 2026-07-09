const OpenRouterAPI = {
    getSystemPrompt() {
        // ... restante do código do prompt
    },
 async sendMessage(messagesHist) {
        const config = ConfigManager.get();
        const apiKey = config.openRouterKey; // Pega a chave gsk_ salva
        
        if (!apiKey) {
            throw new Error("API_KEY_MISSING");
        }

        const fullMessages = [
            { role: "system", content: this.getSystemPrompt() },
            ...messagesHist
        ];

        try {
            // URL oficial do Groq
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: fullMessages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "Erro ao processar resposta.";

        } catch (error) {
            console.error(error);
            throw error;
        }
    }
