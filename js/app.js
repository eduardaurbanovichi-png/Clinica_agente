/**
 * ORQUESTRADOR CENTRAL DE EVENTOS DA APLICAÇÃO (INICIALIZAÇÃO, SUBMITS E MIC)
 */

document.addEventListener("DOMContentLoaded", () => {
    // Inicialização de Componentes e UI
    AOS.init({ duration: 800, once: true });
    UI.init();
    ChatEngine.loadHistory();

    const config = ConfigManager.get();
    UI.applyTheme(config.theme);
    UI.updateClinicName(config.clinicName);
    ChatEngine.renderInitialMessage();

    // Preenche campos do modal de configurações com os valores atuais salvos
    document.getElementById('cfg-clinic-name').value = config.clinicName;
    document.getElementById('cfg-api-key').value = config.openRouterKey;
    document.getElementById('cfg-model').value = config.model;

    // --- ASSINATURA DE EVENTOS ---

    // Envio de Mensagem por Formulário
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    async function handleUserMessage(text) {
        const trimmedText = text.trim();
        if (!trimmedText) return;

        // Limpa input imediatamente
        chatInput.value = "";

        // Adiciona mensagem do usuário à tela e histórico
        ChatEngine.appendBubble("user", trimmedText, false);
        ChatEngine.history.push({ role: "user", content: trimmedText });
        ChatEngine.saveHistory();

        // Ativa animação de digitação
        UI.showTyping(true);

        try {
            // Requisição API mapeando o histórico completo corrente
            const aiResponse = await OpenRouterAPI.sendMessage(ChatEngine.history);
            
            UI.showTyping(false);
            ChatEngine.appendBubble("ai", aiResponse, true);
            
            // Adiciona retorno da IA ao histórico persistido
            ChatEngine.history.push({ role: "assistant", content: aiResponse });
            ChatEngine.saveHistory();

        } catch (error) {
            UI.showTyping(false);
            console.error(error);
            
            let userFriendlyErrorMessage = "Desculpe, ocorreu uma falha inesperada na conexão. Por favor, tente novamente.";
            
            if (error.message === "API_KEY_MISSING") {
                userFriendlyErrorMessage = "Por favor, configure sua chave da API OpenRouter no Painel de Configurações (ícone de engrenagem) para iniciar as respostas da IA.";
            } else if (error.message === "TIMEOUT") {
                userFriendlyErrorMessage = "A requisição expirou devido à lentidão do servidor remoto. Tente reenviar sua pergunta.";
            }

            ChatEngine.appendBubble("ai", `⚠️ ${userFriendlyErrorMessage}`, false);
            UI.showToast(error.message, "error");
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserMessage(chatInput.value);
    });

    // Cliques em Cards de Ações Rápidas
    document.querySelectorAll('.quick-action-btn').forEach(button => {
        button.addEventListener('click', () => {
            const prompt = button.getAttribute('data-prompt');
            handleUserMessage(prompt);
        });
    });

    // Alternador de Tema Rápido (Navbar)
    document.getElementById('btn-theme-toggle').addEventListener('click', () => {
        const currentConfig = ConfigManager.get();
        const nextTheme = currentConfig.theme === 'light' ? 'dark' : 'light';
        ConfigManager.save({ theme: nextTheme });
        UI.applyTheme(nextTheme);
        UI.showToast(`Tema alterado para modo ${nextTheme === 'light' ? 'claro' : 'escuro'}.`);
    });

    // Limpar Conversa Rápida (Navbar)
    document.getElementById('btn-clear-chat').addEventListener('click', () => {
        if(confirm("Deseja realmente limpar todo o histórico de conversas atual?")) {
            ChatEngine.clearHistory();
            window.speechSynthesis.cancel();
            UI.showToast("Histórico de mensagens redefinido com sucesso.");
        }
    });

    // Salvar Dados do Modal de Configurações
    document.getElementById('settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('cfg-clinic-name').value.trim();
        const newKey = document.getElementById('cfg-api-key').value.trim();
        const newModel = document.getElementById('cfg-model').value;

        ConfigManager.save({
            clinicName: newName || "Clínica Urbanovichi",
            openRouterKey: newKey,
            model: newModel
        });

        UI.updateClinicName(newName || "Clínica Urbanovichi");
        
        // Esconde o modal dinamicamente utilizando a API nativa do Bootstrap 5
        const modalEl = document.getElementById('settingsModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();

        UI.showToast("Configurações salvas e aplicadas com sucesso!");
    });

    // Mostrar/Esconder Chave API no Input
    document.getElementById('btn-toggle-key-visibility').addEventListener('click', function() {
        const input = document.getElementById('cfg-api-key');
        const icon = this.querySelector('i');
        if(input.type === "password") {
            input.type = "text";
            icon.className = "fa-solid fa-eye-slash";
        } else {
            input.type = "password";
            icon.className = "fa-solid fa-eye";
        }
    });

    // Botão de Reset Completo de Fábrica
    document.getElementById('btn-factory-reset').addEventListener('click', () => {
        if(confirm("Atenção! Isso apagará suas chaves de API e todas as customizações salvas localmente. Continuar?")) {
            ConfigManager.reset();
            ChatEngine.clearHistory();
            location.reload();
        }
    });

    // --- RECONHECIMENTO DE VOZ (STT - SPEECH TO TEXT) ---
    const micBtn = document.getElementById('btn-mic');
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let isListening = false;

        micBtn.addEventListener('click', () => {
            if (!isListening) {
                recognition.start();
            } else {
                recognition.stop();
            }
        });

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
            chatInput.placeholder = "Ouvindo sua voz... Fale agora.";
        };

        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('listening');
            chatInput.placeholder = "Digite sua dúvida ou instrução aqui...";
        };

        recognition.onerror = (event) => {
            console.error("Erro no SpeechRecognition: ", event.error);
            UI.showToast(`Erro de captação de voz: ${event.error}`, "error");
        };

        recognition.onresult = (event) => {
            const speechToTextResult = event.results[0][0].transcript;
            if (speechToTextResult.trim()) {
                handleUserMessage(speechToTextResult);
            }
        };
    } else {
        micBtn.disabled = true;
        micBtn.title = "Reconhecimento de Voz não suportado neste navegador.";
    }
});