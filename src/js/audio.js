/* ===========================
   SISTEMA DE ÁUDIO PARA O PROJETO SPLINE
   Autor: Ricardo Andreotti
   Descrição: Sistema completo de áudio com sons interativos e ambiente
   =========================== */

/**
 * Classe principal do sistema de áudio
 * Gerencia todos os aspectos sonoros da aplicação
 */
class AudioSystem {
    /**
     * Construtor da classe AudioSystem
     * Inicializa as propriedades básicas do sistema
     */
    constructor() {
        this.audioContext = null;           // Contexto de áudio Web Audio API
        this.masterVolume = 0.3;            // Volume principal (0.0 a 1.0)
        this.isEnabled = true;              // Estado do sistema de áudio
        this.sounds = {};                   // Cache de sons pré-carregados
        this.ambientSound = null;           // Referência do som ambiente
        this.masterGain = null;             // Nó de ganho principal
        
        // Inicializar o sistema
        this.init();
    }

    /**
     * Inicialização assíncrona do sistema de áudio
     * Configura o contexto de áudio e carrega os sons
     */
    async init() {
        try {
            // Criar contexto de áudio (compatibilidade cross-browser)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Criar nó de ganho principal para controle de volume
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);
            
            // Pré-carregar todos os sons
            this.preloadSounds();
            
            // Configurar controles de interface
            this.setupAudioControls();
            
            console.log('Sistema de áudio inicializado com sucesso');
        } catch (error) {
            console.warn('Erro ao inicializar sistema de áudio:', error);
            this.isEnabled = false;
        }
    }

    /* ===========================
       GERAÇÃO DE SONS SINTÉTICOS
       =========================== */

    /**
     * Cria um som de clique suave usando oscilador
     * @param {number} frequency - Frequência em Hz (padrão: 800)
     * @param {number} duration - Duração em segundos (padrão: 0.1)
     * @param {string} type - Tipo de onda (padrão: 'sine')
     * @returns {Object} Referências do oscilador e ganho
     */
    createClickSound(frequency = 800, duration = 0.1, type = 'sine') {
        // Verificar se o sistema está ativo
        if (!this.audioContext || !this.isEnabled) return;

        // Criar oscilador e nó de ganho
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Conectar os nós
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Configurar oscilador
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        // Envelope ADSR (Attack, Decay, Sustain, Release) para som suave
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);      // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + duration * 0.3); // Decay
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);     // Release
        
        // Iniciar e parar o oscilador
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return { oscillator, gainNode };
    }

    /**
     * Cria um som de hover mais sutil e rápido
     * @param {number} frequency - Frequência em Hz (padrão: 600)
     * @param {number} duration - Duração em segundos (padrão: 0.05)
     * @returns {Object} Referências do oscilador e ganho
     */
    createHoverSound(frequency = 600, duration = 0.05) {
        if (!this.audioContext || !this.isEnabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Configuração para som mais suave
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Envelope mais rápido e sutil
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return { oscillator, gainNode };
    }

    /**
     * Cria um som de sucesso com acorde harmônico
     * Usado quando o formulário é enviado com sucesso
     */
    createSuccessSound() {
        if (!this.audioContext || !this.isEnabled) return;

        // Frequências do acorde C maior (Dó, Mi, Sol)
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        // Tocar cada nota com delay para criar arpejo
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createClickSound(freq, 0.2, 'sine');
            }, index * 100);
        });
    }

    /**
     * Cria um som de erro com frequência descendente
     * Usado para indicar erros de validação
     */
    createErrorSound() {
        if (!this.audioContext || !this.isEnabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Frequência descendente para indicar erro
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
        oscillator.type = 'sawtooth'; // Som mais áspero para erro
        
        // Envelope para som de erro
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    /* ===========================
       SOM AMBIENTE
       =========================== */

    /**
     * Cria um som ambiente sutil usando ruído rosa
     * Proporciona uma atmosfera relaxante de fundo
     * @returns {Object} Referências dos nós de áudio
     */
    createAmbientSound() {
        if (!this.audioContext || !this.isEnabled) return;

        // Criar buffer para 2 segundos de áudio
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Gerar ruído rosa (mais natural que ruído branco)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            
            // Filtros para converter ruído branco em rosa
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            
            // Combinar todos os filtros
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.01;
            b6 = white * 0.115926;
        }
        
        // Criar nós de áudio
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        // Configurar source
        source.buffer = buffer;
        source.loop = true; // Loop infinito
        
        // Configurar filtro passa-baixa para suavizar
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 200;
        filterNode.Q.value = 1;
        
        // Volume muito baixo para não incomodar
        gainNode.gain.value = 0.02;
        
        // Conectar os nós
        source.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Armazenar referências
        this.ambientSound = { source, gainNode, filterNode };
        
        return this.ambientSound;
    }

    /* ===========================
       GERENCIAMENTO DE SONS
       =========================== */

    /**
     * Pré-carrega todos os sons em um objeto para acesso rápido
     * Melhora a performance evitando criação dinâmica
     */
    preloadSounds() {
        this.sounds = {
            // Sons de interface
            buttonClick: () => this.createClickSound(800, 0.1),
            buttonHover: () => this.createHoverSound(600, 0.05),
            navClick: () => this.createClickSound(1000, 0.08),
            
            // Sons de modal
            modalOpen: () => this.createClickSound(400, 0.2, 'triangle'),
            modalClose: () => this.createClickSound(300, 0.15, 'triangle'),
            
            // Sons de formulário
            formSuccess: () => this.createSuccessSound(),
            formError: () => this.createErrorSound(),
            
            // Sons especiais
            logoHover: () => this.createHoverSound(800, 0.08)
        };
    }

    /**
     * Toca um som específico pelo nome
     * @param {string} soundName - Nome do som a ser tocado
     */
    playSound(soundName) {
        if (!this.isEnabled || !this.sounds[soundName]) return;
        
        try {
            // Retomar contexto se suspenso (política de autoplay)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Executar a função do som
            this.sounds[soundName]();
        } catch (error) {
            console.warn('Erro ao tocar som:', error);
        }
    }

    /**
     * Inicia o som ambiente de fundo
     */
    startAmbientSound() {
        if (!this.isEnabled || this.ambientSound) return;
        
        try {
            // Retomar contexto se necessário
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Criar e iniciar som ambiente
            const ambient = this.createAmbientSound();
            if (ambient) {
                ambient.source.start();
            }
        } catch (error) {
            console.warn('Erro ao iniciar som ambiente:', error);
        }
    }

    /**
     * Para o som ambiente
     */
    stopAmbientSound() {
        if (this.ambientSound && this.ambientSound.source) {
            try {
                this.ambientSound.source.stop();
                this.ambientSound = null;
            } catch (error) {
                console.warn('Erro ao parar som ambiente:', error);
            }
        }
    }

    /* ===========================
       CONTROLES DE INTERFACE
       =========================== */

    /**
     * Configura o botão de controle de áudio na interface
     */
    setupAudioControls() {
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            // Atualizar ícone baseado no estado atual
            this.updateAudioToggleIcon(audioToggle);
            
            // Adicionar evento de clique
            audioToggle.addEventListener('click', () => {
                this.toggleAudio();
                this.updateAudioToggleIcon(audioToggle);
            });
            
            // Adicionar eventos de som para o próprio botão
            audioToggle.addEventListener('mouseenter', () => {
                if (this.isEnabled) {
                    this.playSound('buttonHover');
                }
            });
            
            audioToggle.addEventListener('click', () => {
                if (this.isEnabled) {
                    this.playSound('buttonClick');
                }
            });
        }
    }

    /**
     * Atualiza o ícone e tooltip do botão de áudio
     * @param {HTMLElement} audioToggle - Elemento do botão
     */
    updateAudioToggleIcon(audioToggle) {
        audioToggle.innerHTML = this.isEnabled ? '🔊' : '🔇';
        audioToggle.title = this.isEnabled ? 'Desativar sons' : 'Ativar sons';
    }

    /**
     * Alterna o estado do sistema de áudio
     */
    toggleAudio() {
        this.isEnabled = !this.isEnabled;
        
        // Parar som ambiente se desabilitado
        if (!this.isEnabled) {
            this.stopAmbientSound();
        }
        
        // Salvar preferência no localStorage
        localStorage.setItem('audioEnabled', this.isEnabled);
    }

    /* ===========================
       CONFIGURAÇÕES E PREFERÊNCIAS
       =========================== */

    /**
     * Define o volume principal do sistema
     * @param {number} volume - Volume de 0.0 a 1.0
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
        // Salvar no localStorage
        localStorage.setItem('audioVolume', this.masterVolume);
    }

    /**
     * Carrega preferências salvas do localStorage
     */
    loadPreferences() {
        const savedEnabled = localStorage.getItem('audioEnabled');
        const savedVolume = localStorage.getItem('audioVolume');
        
        // Carregar estado habilitado/desabilitado
        if (savedEnabled !== null) {
            this.isEnabled = savedEnabled === 'true';
        }
        
        // Carregar volume salvo
        if (savedVolume !== null) {
            this.setMasterVolume(parseFloat(savedVolume));
        }
    }

    /* ===========================
       ANEXAÇÃO DE EVENTOS
       =========================== */

    /**
     * Anexa eventos de som a todos os elementos da interface
     * Deve ser chamado após o DOM estar carregado
     */
    attachSoundEvents() {
        // Botões principais da página
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => this.playSound('buttonHover'));
            button.addEventListener('click', () => this.playSound('buttonClick'));
        });

        // Botões de navegação
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('mouseenter', () => this.playSound('buttonHover'));
            button.addEventListener('click', () => this.playSound('navClick'));
        });

        // Links de navegação
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => this.playSound('buttonHover'));
            link.addEventListener('click', () => this.playSound('navClick'));
        });

        // Botão de controle de tema
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('mouseenter', () => this.playSound('buttonHover'));
            themeToggle.addEventListener('click', () => this.playSound('buttonClick'));
        }

        // Logo com som especial
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('mouseenter', () => this.playSound('logoHover'));
        }

        // Eventos do modal
        this.attachModalSoundEvents();

        // Eventos do formulário
        this.attachFormSoundEvents();

        // Iniciar som ambiente após um delay
        setTimeout(() => {
            if (this.isEnabled) {
                this.startAmbientSound();
            }
        }, 2000);
    }

    /**
     * Anexa eventos de som específicos do modal
     */
    attachModalSoundEvents() {
        const contactBtn = document.getElementById('contact-btn');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-btn');

        if (contactBtn) {
            contactBtn.addEventListener('click', () => this.playSound('modalOpen'));
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.playSound('modalClose'));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.playSound('modalClose'));
        }
    }

    /**
     * Anexa eventos de som específicos do formulário
     */
    attachFormSoundEvents() {
        // Botões do formulário
        const formButtons = document.querySelectorAll('.btn-cancel, .btn-submit');
        formButtons.forEach(button => {
            button.addEventListener('mouseenter', () => this.playSound('buttonHover'));
        });

        // Eventos customizados de sucesso e erro
        document.addEventListener('formSuccess', () => this.playSound('formSuccess'));
        document.addEventListener('formError', () => this.playSound('formError'));
    }

    /* ===========================
       LIMPEZA E DESTRUIÇÃO
       =========================== */

    /**
     * Destrói o sistema de áudio e limpa recursos
     * Usado quando a página é fechada ou o sistema não é mais necessário
     */
    destroy() {
        // Parar som ambiente
        this.stopAmbientSound();
        
        // Fechar contexto de áudio
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Remover botão de controle se existir
        const audioToggle = document.querySelector('.audio-toggle');
        if (audioToggle) {
            audioToggle.remove();
        }
        
        // Limpar referências
        this.sounds = {};
        this.audioContext = null;
        this.masterGain = null;
    }
}

/* ===========================
   EXPORTAÇÃO GLOBAL
   =========================== */

// Tornar a classe disponível globalmente para uso em outros scripts
window.AudioSystem = AudioSystem;

