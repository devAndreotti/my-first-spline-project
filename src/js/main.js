/* ===========================
   SCRIPT PRINCIPAL DO PROJETO SPLINE
   Autor: Ricardo Andreotti
   Descrição: Funcionalidades principais da aplicação
   =========================== */

/* ===========================
   1. UTILITÁRIOS GERAIS
   =========================== */

/**
 * Atualiza a data e hora exibida na interface
 * Formata a data em português brasileiro com informações completas
 */
function atualizarDataHora() {
    const agora = new Date();
    const opcoes = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    
    // Atualizar elemento na página
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = agora.toLocaleDateString('pt-BR', opcoes);
    }
}

/* ===========================
   2. SISTEMA DE MODAL DE CONTATO
   =========================== */

/**
 * Classe responsável por gerenciar o modal de contato
 * Inclui abertura, fechamento, validação e envio do formulário
 */
class ContactModal {
    /**
     * Construtor da classe ContactModal
     * Inicializa referências dos elementos e eventos
     */
    constructor() {
        // Referências dos elementos DOM
        this.modal = document.getElementById('contact-modal');
        this.contactBtn = document.getElementById('contact-btn');
        this.closeBtn = document.getElementById('close-modal');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.form = document.getElementById('contact-form');
        
        // Inicializar eventos
        this.initEventListeners();
    }
    
    /**
     * Inicializa todos os event listeners do modal
     */
    initEventListeners() {
        // Evento para abrir modal
        this.contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });
        
        // Eventos para fechar modal
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Fechar modal clicando fora do conteúdo
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Fechar modal com tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.closeModal();
            }
        });
        
        // Configurar validação em tempo real
        this.setupFormValidation();
        
        // Evento de submit do formulário
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    /* ===========================
       CONTROLE DE ABERTURA/FECHAMENTO
       =========================== */
    
    /**
     * Abre o modal com animação suave
     */
    openModal() {
        // Resetar o formulário sempre que abrir o modal
        this.resetForm();
        
        // Preparar modal para animação de entrada
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.style.transform = 'scale(0.7) translateY(-50px) rotateX(-10deg)';
        modalContent.style.opacity = '0';
        
        // Mostrar modal
        this.modal.style.display = 'flex';
        
        // Restaurar dados salvos do formulário
        this.loadFormData();
        
        // Forçar reflow para garantir aplicação dos estilos
        this.modal.offsetHeight;
        
        // Aplicar animação de entrada
        setTimeout(() => {
            this.modal.classList.add('show');
            // Resetar transform para permitir que o CSS tome conta
            modalContent.style.transform = '';
            modalContent.style.opacity = '';
        }, 10);
        
        // Prevenir scroll da página de fundo
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Fecha o modal com animação suave
     */
    closeModal() {
        // Salvar dados do formulário antes de fechar
        this.saveFormData();
        
        // Adicionar classe de fechamento para animação
        this.modal.classList.add('closing');
        this.modal.classList.remove('show');
        
        // Animar o conteúdo do modal para fora
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.style.transform = 'scale(0.8) translateY(50px) rotateX(10deg)';
        modalContent.style.opacity = '0';
        
        // Animar o backdrop
        this.modal.style.backdropFilter = 'blur(0px)';
        this.modal.style.background = 'rgba(0, 0, 0, 0)';
        
        // Finalizar fechamento após animação
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.modal.classList.remove('closing');
            
            // Resetar estilos para próxima abertura
            modalContent.style.transform = '';
            modalContent.style.opacity = '';
            this.modal.style.backdropFilter = '';
            this.modal.style.background = '';
        }, 500); // Tempo da animação
        
        // Restaurar scroll da página
        document.body.style.overflow = 'auto';
    }
    
    /* ===========================
       PERSISTÊNCIA DE DADOS DO FORMULÁRIO
       =========================== */
    
    /**
     * Salva os dados do formulário no localStorage
     */
    saveFormData() {
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };
        
        // Salvar apenas se houver algum dado preenchido
        if (Object.values(formData).some(value => value.trim() !== '')) {
            localStorage.setItem('spline-contact-form', JSON.stringify(formData));
        }
    }
    
    /**
     * Carrega os dados salvos do formulário do localStorage
     */
    loadFormData() {
        try {
            const savedData = localStorage.getItem('spline-contact-form');
            if (savedData) {
                const formData = JSON.parse(savedData);
                
                // Restaurar valores nos campos
                if (formData.name) document.getElementById('name').value = formData.name;
                if (formData.email) document.getElementById('email').value = formData.email;
                if (formData.phone) document.getElementById('phone').value = formData.phone;
                if (formData.message) document.getElementById('message').value = formData.message;
                
                // Aplicar validação visual aos campos preenchidos
                Object.keys(formData).forEach(fieldName => {
                    if (formData[fieldName]) {
                        const field = document.getElementById(fieldName);
                        const errorElement = document.getElementById(`${fieldName}-error`);
                        this.validateField(fieldName, formData[fieldName], errorElement, field);
                    }
                });
            }
        } catch (error) {
            console.log('Erro ao carregar dados salvos do formulário:', error);
        }
    }
    
    /**
     * Limpa os dados salvos do formulário
     */
    clearSavedFormData() {
        localStorage.removeItem('spline-contact-form');
    }
    
    /* ===========================
       SISTEMA DE VALIDAÇÃO
       =========================== */
    
    /**
     * Configura validação em tempo real para todos os campos
     */
    setupFormValidation() {
        const fields = ['name', 'email', 'phone', 'message'];
        
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const errorElement = document.getElementById(`${fieldName}-error`);
            
            // Validação durante digitação
            field.addEventListener('input', () => {
                // Aplicar formatação especial para telefone
                if (fieldName === 'phone') {
                    this.formatPhoneNumber(field);
                }
                this.validateField(fieldName, field.value, errorElement, field);
            });
            
            // Validação ao sair do campo
            field.addEventListener('blur', () => {
                this.validateField(fieldName, field.value, errorElement, field);
            });
        });
    }
    
    /**
     * Formata o número de telefone em tempo real
     * Aplica máscara brasileira: (XX) XXXXX-XXXX
     * @param {HTMLElement} field - Campo de telefone
     */
    formatPhoneNumber(field) {
        let value = field.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        
        if (value.length <= 11) {
            // Aplicar formatação brasileira
            if (value.length <= 2) {
                value = value.replace(/(\d{0,2})/, '($1');
            } else if (value.length <= 7) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            } else if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
        } else {
            // Limitar a 11 dígitos
            value = value.substring(0, 11);
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        
        field.value = value;
    }
    
    /**
     * Valida um campo específico
     * @param {string} fieldName - Nome do campo
     * @param {string} value - Valor do campo
     * @param {HTMLElement} errorElement - Elemento para mostrar erro
     * @param {HTMLElement} fieldElement - Elemento do campo
     * @returns {boolean} Se o campo é válido
     */
    validateField(fieldName, value, errorElement, fieldElement) {
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'name':
                // Validação do nome
                if (value.trim().length < 2) {
                    isValid = false;
                    errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
                    isValid = false;
                    errorMessage = 'Nome deve conter apenas letras e espaços';
                }
                break;
                
            case 'email':
                // Validação do email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value.trim())) {
                    isValid = false;
                    errorMessage = 'Por favor, insira um email válido';
                }
                break;
                
            case 'phone':
                // Validação do telefone (opcional)
                if (value.trim()) {
                    const digitsOnly = value.replace(/\D/g, '');
                    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
                        isValid = false;
                        errorMessage = 'Telefone deve ter 10 ou 11 dígitos';
                    } else if (!/^(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/.test(value.trim())) {
                        isValid = false;
                        errorMessage = 'Formato de telefone inválido';
                    }
                }
                break;
                
            case 'message':
                // Validação da mensagem
                if (value.trim().length < 10) {
                    isValid = false;
                    errorMessage = 'Mensagem deve ter pelo menos 10 caracteres';
                }
                break;
        }
        
        // Atualizar status visual do campo
        this.updateFieldStatus(fieldElement, errorElement, isValid, errorMessage);
        return isValid;
    }
    
    /**
     * Atualiza o status visual de um campo (sucesso/erro)
     * @param {HTMLElement} fieldElement - Campo a ser atualizado
     * @param {HTMLElement} errorElement - Elemento de erro
     * @param {boolean} isValid - Se o campo é válido
     * @param {string} errorMessage - Mensagem de erro
     */
    updateFieldStatus(fieldElement, errorElement, isValid, errorMessage) {
        // Remover classes anteriores
        fieldElement.classList.remove('error', 'success');
        errorElement.classList.remove('show');
        
        // Aplicar nova classe se campo não estiver vazio
        if (fieldElement.value.trim()) {
            if (isValid) {
                fieldElement.classList.add('success');
            } else {
                fieldElement.classList.add('error');
                errorElement.textContent = errorMessage;
                errorElement.classList.add('show');
            }
        }
    }
    
    /**
     * Valida todo o formulário
     * @returns {boolean} Se o formulário é válido
     */
    validateForm() {
        const fields = ['name', 'email', 'message'];
        let isFormValid = true;
        
        // Validar campos obrigatórios
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const errorElement = document.getElementById(`${fieldName}-error`);
            const isFieldValid = this.validateField(fieldName, field.value, errorElement, field);
            
            if (!isFieldValid) {
                isFormValid = false;
            }
        });
        
        // Validar telefone se preenchido (campo opcional)
        const phoneField = document.getElementById('phone');
        const phoneError = document.getElementById('phone-error');
        if (phoneField.value.trim()) {
            const isPhoneValid = this.validateField('phone', phoneField.value, phoneError, phoneField);
            if (!isPhoneValid) {
                isFormValid = false;
            }
        }
        
        return isFormValid;
    }
    
    /* ===========================
       ENVIO DO FORMULÁRIO
       =========================== */
    
    /**
     * Manipula o envio do formulário
     * @param {Event} e - Evento de submit
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validar formulário antes de enviar
        if (!this.validateForm()) {
            // Disparar eventos de erro
            document.dispatchEvent(new CustomEvent('formError'));
            
            // Tocar som de erro se sistema de áudio disponível
            if (window.audioSystem) {
                window.audioSystem.playSound('formError');
            }
            
            // Animar campos com erro
            this.animateErrorFields();
            return;
        }
        
        // Preparar interface para envio
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        
        // Mostrar estado de carregamento
        submitBtn.textContent = 'Enviando...';
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Simular envio (substituir por chamada real de API)
            await this.simulateFormSubmission();
            
            // Disparar evento de sucesso
            document.dispatchEvent(new CustomEvent('formSuccess'));
            
            // Tocar som de sucesso
            if (window.audioSystem) {
                window.audioSystem.playSound('formSuccess');
            }
            
            // Mostrar mensagem de sucesso
            this.showSuccessMessage();
            
            // Limpar dados salvos após envio bem-sucedido
            this.clearSavedFormData();
            
            // Fechar modal após sucesso
            setTimeout(() => {
                this.closeModal();
                this.resetForm(); // Adicionar esta linha para resetar o formulário
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            
            // Disparar evento de erro
            document.dispatchEvent(new CustomEvent('formError'));
            
            // Tocar som de erro
            if (window.audioSystem) {
                window.audioSystem.playSound('formError');
            }
            
            // Mostrar erro ao usuário
            alert('Erro ao enviar mensagem. Tente novamente.');
            
        } finally {
            // Restaurar botão
            submitBtn.textContent = originalText;
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
    
    /**
     * Simula o envio do formulário (substituir por implementação real)
     * @returns {Promise} Promise que resolve após delay
     */
    async simulateFormSubmission() {
        // Simular delay de rede
        return new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    /**
     * Anima campos com erro para chamar atenção
     */
    animateErrorFields() {
        const errorFields = document.querySelectorAll('.form-group input.error, .form-group textarea.error');
        errorFields.forEach(field => {
            field.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                field.style.animation = '';
            }, 500);
        });
    }
    
    /**
     * Mostra mensagem de sucesso no modal
     */
    showSuccessMessage() {
        const form = this.form;
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #51cf66; font-size: 18px; font-weight: 600;">
                ✅ Mensagem enviada com sucesso!<br>
                <span style="font-size: 14px; font-weight: 400; opacity: 0.8;">Entraremos em contato em breve.</span>
            </div>
        `;
        
        // Ocultar formulário e mostrar sucesso
        form.style.display = 'none';
        form.parentNode.appendChild(successMessage);
    }
    
    /**
     * Reseta o formulário para estado inicial
     */
    resetForm() {
        // Resetar campos
        this.form.reset();
        this.form.style.display = 'block';
        
        // Remover mensagem de sucesso se existir
        const successMessage = document.querySelector('.success-message');
        if (successMessage) {
            successMessage.remove();
        }
        
        // Resetar botão de envio
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.textContent = 'Enviar Mensagem';
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        // Remover classes de validação
        const fields = document.querySelectorAll('.form-group input, .form-group textarea');
        fields.forEach(field => {
            field.classList.remove('error', 'success');
        });
        
        // Esconder mensagens de erro
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.classList.remove('show');
        });
    }
}

/* ===========================
   3. SISTEMA DE PARTÍCULAS
   =========================== */

/**
 * Classe responsável pelo efeito de partículas flutuantes
 * Cria uma atmosfera visual agradável no fundo
 */
class ParticleSystem {
    /**
     * Construtor do sistema de partículas
     */
    constructor() {
        this.particles = [];
        this.container = null;
        this.init();
    }
    
    /**
     * Inicializa o sistema de partículas
     */
    init() {
        // Criar container de partículas
        this.container = document.createElement('div');
        this.container.className = 'particles';
        document.body.appendChild(this.container);
        
        // Criar partículas iniciais
        this.createParticles();
        
        // Iniciar animação
        this.animate();
    }
    
    /**
     * Cria as partículas iniciais
     */
    createParticles() {
        // Ajustar quantidade baseado no tamanho da tela
        const particleCount = window.innerWidth < 768 ? 20 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle();
        }
    }
    
    /**
     * Cria uma partícula individual
     */
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Posição aleatória
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Tamanho aleatório
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Timing de animação aleatório
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        
        // Adicionar ao container
        this.container.appendChild(particle);
        this.particles.push(particle);
    }
    
    /**
     * Anima o sistema de partículas
     */
    animate() {
        // Recriar partículas periodicamente para manter o efeito
        setInterval(() => {
            if (this.particles.length < 50 && window.innerWidth >= 768) {
                this.createParticle();
            }
        }, 2000);
    }
    
    /**
     * Destrói o sistema de partículas
     */
    destroy() {
        if (this.container) {
            this.container.remove();
        }
        this.particles = [];
    }
}

/* ===========================
   4. EFEITO DE DIGITAÇÃO
   =========================== */

/**
 * Classe para criar efeito de digitação em texto
 * Simula digitação caractere por caractere com loop infinito
 */
class TypingEffect {
    /**
     * Construtor do efeito de digitação
     * @param {HTMLElement} element - Elemento onde aplicar o efeito
     * @param {string} text - Texto a ser "digitado"
     * @param {number} speed - Velocidade em ms entre caracteres
     * @param {number} pauseTime - Tempo de pausa antes de reiniciar (ms)
     */
    constructor(element, text, speed = 100, pauseTime = 3000) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.pauseTime = pauseTime;
        this.index = 0;
        this.isTyping = false;
        this.start();
    }
    
    /**
     * Inicia o efeito de digitação
     */
    start() {
        this.element.textContent = '';
        this.element.classList.add('typing-effect');
        this.type();
    }
    
    /**
     * Digita o próximo caractere
     */
    type() {
        if (this.index < this.text.length) {
            this.element.textContent += this.text.charAt(this.index);
            this.index++;
            setTimeout(() => this.type(), this.speed);
        } else {
            // Pausar com cursor piscante antes de reiniciar
            setTimeout(() => {
                this.restart();
            }, this.pauseTime);
        }
    }
    
    /**
     * Reinicia o efeito de digitação (loop infinito)
     */
    restart() {
        this.index = 0;
        this.element.textContent = '';
        setTimeout(() => this.type(), 500); // Pequena pausa antes de começar novamente
    }
    
    /**
     * Para o efeito de digitação
     */
    stop() {
        this.isTyping = false;
        this.element.classList.remove('typing-effect');
    }
}

/* ===========================
   5. EFEITO RIPPLE (ONDULAÇÃO)
   =========================== */

/**
 * Classe para criar efeito ripple em botões
 * Simula ondulação ao clicar
 */
class RippleEffect {
    /**
     * Construtor do efeito ripple
     */
    constructor() {
        this.init();
    }
    
    /**
     * Inicializa o efeito em todos os botões
     */
    init() {
        const buttons = document.querySelectorAll('.btn, .nav-btn, .btn-submit, .btn-cancel, .ripple');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => this.createRipple(e, button));
        });
    }
    
    /**
     * Cria o efeito ripple em um botão
     * @param {Event} event - Evento de clique
     * @param {HTMLElement} button - Botão clicado
     */
    createRipple(event, button) {
        // Remover ripples anteriores
        const existingRipples = button.querySelectorAll('.ripple-effect');
        existingRipples.forEach(ripple => ripple.remove());
        
        // Calcular posição do clique
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Calcular tamanho baseado na distância até a borda mais distante
        const maxDistance = Math.max(
            Math.sqrt(x * x + y * y),
            Math.sqrt((rect.width - x) * (rect.width - x) + y * y),
            Math.sqrt(x * x + (rect.height - y) * (rect.height - y)),
            Math.sqrt((rect.width - x) * (rect.width - x) + (rect.height - y) * (rect.height - y))
        );
        
        const size = maxDistance * 2;
        
        // Criar elemento ripple
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x - size / 2}px;
            top: ${y - size / 2}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Adicionar ao botão
        button.appendChild(ripple);
        
        // Remover após animação
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

/* ===========================
   6. SCROLL SUAVE
   =========================== */

/**
 * Classe para implementar scroll suave em links internos
 */
class SmoothScroll {
    /**
     * Construtor do scroll suave
     */
    constructor() {
        this.init();
    }
    
    /**
     * Inicializa o scroll suave para links com âncoras
     */
    init() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

/* ===========================
   7. LAZY LOADING
   =========================== */

/**
 * Classe para implementar lazy loading de elementos
 * Melhora performance carregando elementos quando necessário
 */
class LazyLoader {
    /**
     * Construtor do lazy loader
     */
    constructor() {
        this.init();
    }
    
    /**
     * Inicializa o sistema de lazy loading
     */
    init() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadElement(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            // Observar elementos com atributo data-lazy
            const lazyElements = document.querySelectorAll('[data-lazy]');
            lazyElements.forEach(el => observer.observe(el));
        }
    }
    
    /**
     * Carrega um elemento lazy
     * @param {HTMLElement} element - Elemento a ser carregado
     */
    loadElement(element) {
        if (element.dataset.src) {
            element.src = element.dataset.src;
        }
        
        element.classList.add('loaded');
    }
}

/* ===========================
   8. GERENCIADOR DE TEMA
   =========================== */

/**
 * Classe para gerenciar alternância entre tema claro e escuro
 */
class ThemeManager {
    /**
     * Construtor do gerenciador de tema
     */
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }
    
    /**
     * Inicializa o gerenciador de tema
     */
    init() {
        this.applyTheme();
        this.setupThemeToggle();
    }
    
    /**
     * Aplica o tema atual
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
    
    /**
     * Configura o botão de alternância de tema
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // Atualizar ícone baseado no tema atual
            this.updateThemeToggleIcon(themeToggle);
            
            // Adicionar evento de clique
            themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Adicionar eventos de som
            themeToggle.addEventListener('mouseenter', () => {
                if (window.audioSystem) {
                    window.audioSystem.playSound('buttonHover');
                }
            });
            
            themeToggle.addEventListener('click', () => {
                if (window.audioSystem) {
                    window.audioSystem.playSound('buttonClick');
                }
            });
        }
    }
    
    /**
     * Atualiza o ícone do botão de tema
     * @param {HTMLElement} toggle - Botão de alternância
     */
    updateThemeToggleIcon(toggle) {
        toggle.innerHTML = this.currentTheme === 'dark' ? '🌙' : '☀️';
        toggle.title = this.currentTheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro';
    }
    
    /**
     * Alterna entre tema claro e escuro
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
        
        // Atualizar ícone
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            this.updateThemeToggleIcon(toggle);
        }
    }
}

/* ===========================
   9. MONITOR DE PERFORMANCE
   =========================== */

/**
 * Classe para monitorar performance e ajustar efeitos
 * Reduz efeitos visuais em dispositivos com baixa performance
 */
class PerformanceMonitor {
    /**
     * Construtor do monitor de performance
     */
    constructor() {
        this.init();
    }
    
    /**
     * Inicializa o monitoramento
     */
    init() {
        // Monitorar tempo de carregamento
        if (window.performance) {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            if (navigation && navigation.loadEventEnd > 3000) {
                // Se carregamento for lento, reduzir efeitos
                this.reduceEffects();
            }
        }
        
        // Detectar dispositivos com baixa performance
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            this.reduceEffects();
        }
    }
    
    /**
     * Reduz efeitos visuais para melhorar performance
     */
    reduceEffects() {
        document.body.classList.add('reduced-effects');
        
        // Remover partículas em dispositivos lentos
        const particles = document.querySelector('.particles');
        if (particles) {
            particles.remove();
        }
        
        console.log('Efeitos reduzidos para melhorar performance');
    }
}

/* ===========================
   10. INICIALIZAÇÃO PRINCIPAL
   =========================== */

/**
 * Função principal de inicialização
 * Executa quando o DOM estiver completamente carregado
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar data e hora
    atualizarDataHora();
    setInterval(atualizarDataHora, 1000); // Atualizar a cada segundo
    
    // Inicializar modal de contato
    const contactModal = new ContactModal();
    
    // Inicializar sistema de áudio
    const audioSystem = new AudioSystem();
    audioSystem.loadPreferences();
    
    // Aguardar antes de anexar eventos de som
    setTimeout(() => {
        audioSystem.attachSoundEvents();
    }, 500);
    
    // Tornar audioSystem global para acesso em outros lugares
    window.audioSystem = audioSystem;
    
    // Inicializar efeitos visuais (apenas em telas maiores e sem preferência de movimento reduzido)
    if (window.innerWidth >= 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new ParticleSystem();
    }
    
    // Efeito de digitação no título principal
    const title = document.querySelector('h1');
    if (title) {
        const originalText = title.textContent;
        setTimeout(() => {
            new TypingEffect(title, originalText, 80);
        }, 1000);
    }
    
    // Inicializar outros sistemas
    new RippleEffect();
    new SmoothScroll();
    new LazyLoader();
    new ThemeManager();
    new PerformanceMonitor();
    
    // Adicionar estilos CSS para animações dinâmicas
    addDynamicStyles();
    
    console.log('Aplicação inicializada com sucesso!');
});

/* ===========================
   11. ESTILOS DINÂMICOS
   =========================== */

/**
 * Adiciona estilos CSS dinâmicos necessários para as animações
 */
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Animação do efeito ripple */
        @keyframes ripple-animation {
            to {
                transform: scale(1);
                opacity: 0;
            }
        }
        
        /* Estilos para modo de performance reduzida */
        .reduced-effects * {
            animation: none !important;
            transition: none !important;
        }
        
        .reduced-effects .particles {
            display: none !important;
        }
        
        /* Cursor piscante para efeito de digitação */
        .typing-effect::after {
            content: '|';
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

