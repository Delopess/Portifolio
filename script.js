// Animação sidebar - versão suavizada
const closeMenuButtons = document.querySelectorAll("#Close-menu");
const container = document.querySelector(".container");
const menuTransitionTime = 300; // ms - deve corresponder ao CSS

closeMenuButtons.forEach(button => {
    button.addEventListener("click", () => {
        container.classList.toggle("show-menu");
        
        // Força repaint para garantir que a animação ocorra
        void container.offsetWidth;
    });
});

// Debounce otimizado para animações
function debounce(func, wait = 16, immediate = false) { // 16ms ≈ 60fps
    let timeout;
    return function(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (immediate && !timeout) {
            func.apply(context, args);
        }
    };
}

// Configurações de animação suave
const ANIMATION_SETTINGS = {
    class: "animate",
    threshold: 0.2, // 20% do elemento visível
    rootMargin: "0px 0px -50px 0px", // reduz a área de ativação
    delayIncrement: 50 // ms entre animações sequenciais
};

// Animação scroll suavizada com Intersection Observer
function initSmoothScrollAnimation() {
    const animationTargets = document.querySelectorAll("[data-anime]");
    
    if (!animationTargets.length) return;

    // Verifica suporte a Intersection Observer e requestAnimationFrame
    if ('IntersectionObserver' in window && 'requestAnimationFrame' in window) {
        let lastAnimationTime = 0;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Agenda animação com tempo espaçado para suavidade
                    const delay = index * ANIMATION_SETTINGS.delayIncrement;
                    const animateTime = performance.now();
                    
                    if (animateTime - lastAnimationTime > 16) { // ≈60fps
                        requestAnimationFrame(() => {
                            setTimeout(() => {
                                entry.target.classList.add(ANIMATION_SETTINGS.class);
                                lastAnimationTime = performance.now();
                            }, delay);
                        });
                    }
                } else {
                    requestAnimationFrame(() => {
                        entry.target.classList.remove(ANIMATION_SETTINGS.class);
                    });
                }
            });
        }, {
            threshold: ANIMATION_SETTINGS.threshold,
            rootMargin: ANIMATION_SETTINGS.rootMargin
        });
        
        animationTargets.forEach(target => observer.observe(target));
    } else {
        // Fallback suavizado para browsers antigos
        const animateElements = () => {
            const windowTop = window.pageYOffset + (window.innerHeight * 0.75);
            
            requestAnimationFrame(() => {
                animationTargets.forEach((element, index) => {
                    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
                    const shouldAnimate = windowTop > elementTop;
                    
                    if (shouldAnimate) {
                        setTimeout(() => {
                            element.classList.add(ANIMATION_SETTINGS.class);
                        }, index * ANIMATION_SETTINGS.delayIncrement);
                    } else {
                        element.classList.remove(ANIMATION_SETTINGS.class);
                    }
                });
            });
        };
        
        animateElements(); // Animação inicial
        window.addEventListener('scroll', debounce(animateElements, 16));
    }
}

// Adiciona transições suaves via JavaScript
function setupSmoothTransitions() {
    const style = document.createElement('style');
    style.textContent = `
        [data-anime] {
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            opacity: 0;
            transform: translateY(20px);
        }
        
        [data-anime].animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .container {
            transition: transform ${menuTransitionTime}ms cubic-bezier(0.4, 0, 0.2, 1);
        }
    `;
    document.head.appendChild(style);
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    setupSmoothTransitions();
    initSmoothScrollAnimation();
});