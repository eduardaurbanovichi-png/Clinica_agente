const ConfigManager = {
    STORAGE_KEY: "urbanovichi_chat_config",

    // Configurações padrão iniciais
    defaultConfig: {
        clinicName: "Clínica Urbanovichi",
        openRouterKey: "", // Onde o usuário digita/salva a chave gsk_
        model: "llama3-8b-8192", // Modelo padrão, estável e rápido do Groq
        theme: "light",
        welcomeMessage: "Olá! Sou o Urbanovichi, assistente virtual da clínica. Como posso ajudar você hoje?"
    },

    // Obtém as configurações salvas no navegador ou retorna as padrões
    get() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (!saved) {
            return this.defaultConfig;
        }
        try {
            return { ...this.defaultConfig, ...JSON.parse(saved) };
        } catch (e) {
            return this.defaultConfig;
        }
    },

    // Salva novas alterações feitas pelo usuário
    save(newConfig) {
        const current = this.get();
        const updated = { ...current, ...newConfig };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
        return updated;
    }
};
