/**
 * ARQUIVO DE CONFIGURAÇÃO DO AGENTE URBANOVICHI
 * Controla e inicializa o localStorage e as definições globais da aplicação.
 */

const DEFAULT_CONFIG = {
    clinicName: "Clínica Urbanovichi",
    openRouterKey: "", // Deixado em branco para que o usuário insira via modal ou direto no código
    model: "google/gemini-2.5-flash",
    theme: "light"
};

const ConfigManager = {
    init() {
        if (!localStorage.getItem("urbanovichi_config")) {
            localStorage.setItem("urbanovichi_config", JSON.stringify(DEFAULT_CONFIG));
        }
    },

    get() {
        this.init();
        try {
            return JSON.parse(localStorage.getItem("urbanovichi_config"));
        } catch (e) {
            return DEFAULT_CONFIG;
        }
    },

    save(newConfig) {
        const current = this.get();
        const updated = { ...current, ...newConfig };
        localStorage.setItem("urbanovichi_config", JSON.stringify(updated));
        return updated;
    },

    reset() {
        localStorage.setItem("urbanovichi_config", JSON.stringify(DEFAULT_CONFIG));
        return DEFAULT_CONFIG;
    }
};

// Inicialização imediata ao carregar o script
ConfigManager.init();