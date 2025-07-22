document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    
    // Criar uma versão mobile do menu
    function createMobileMenu() {
        // Verificar se já existe um menu mobile
        let mobileMenu = document.querySelector('.mobile-nav-menu');
        if (!mobileMenu) {
            // Criar o menu mobile
            mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-nav-menu';
            mobileMenu.innerHTML = `
                <a href="#">Home</a>
                <a href="#">Projects</a>
                <a href="#">About</a>
                <a href="#" id="mobile-contact-btn">Contact</a>
            `;
            document.body.appendChild(mobileMenu);
            
            // Conectar o botão Contact mobile ao modal
            const mobileContactBtn = mobileMenu.querySelector('#mobile-contact-btn');
            if (mobileContactBtn) {
                mobileContactBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Fechar o menu mobile primeiro
                    hamburgerMenu.classList.remove('open');
                    mobileMenu.classList.remove('open');
                    document.body.style.overflow = 'auto';
                    
                    // Abrir o modal de contato
                    const contactModal = document.getElementById('contact-modal');
                    if (contactModal) {
                        contactModal.classList.add('show');
                        contactModal.style.display = 'flex';
                    }
                });
            }
        }
        return mobileMenu;
    }

    if (hamburgerMenu) {
        const mobileMenu = createMobileMenu();
        
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('open');
            mobileMenu.classList.toggle('open');
            
            // Prevenir scroll do body quando menu estiver aberto
            if (mobileMenu.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });

        // Fechar o menu ao clicar em um link (exceto Contact que já tem seu próprio handler)
        mobileMenu.querySelectorAll('a:not(#mobile-contact-btn)').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('open');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = 'auto';
            });
        });
        
        // Fechar menu ao clicar fora dele
        document.addEventListener('click', (e) => {
            if (!hamburgerMenu.contains(e.target) && !mobileMenu.contains(e.target)) {
                hamburgerMenu.classList.remove('open');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = 'auto';
            }
        });
    }
});


