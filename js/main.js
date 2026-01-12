document.addEventListener('DOMContentLoaded', function () {

    // --- Lógica para el Header Adaptable al Scroll ---
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Lógica para Animaciones al Desplazarse (Scroll) ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // --- Lógica para las Pestañas Verticales ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPanelId = button.getAttribute('aria-controls');
            const targetPanel = document.getElementById(targetPanelId);
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            targetPanel.classList.add('active');
        });
    });

    // --- Lógica del menú móvil ---
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (navToggle) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('active');
        });
    }

    // --- Lógica del acordeón del mapa ---
    const accordionItems = document.querySelectorAll('.accordion-item');
    function closeAllAccordions() {
        accordionItems.forEach(item => {
            item.querySelector('.accordion-header').classList.remove('active');
            item.querySelector('.accordion-content').style.maxHeight = null;
        });
    }
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        header.addEventListener('click', () => {
            const isActive = header.classList.contains('active');
            closeAllAccordions();
            if (!isActive) {
                header.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
                const lat = parseFloat(item.getAttribute('data-lat'));
                const lng = parseFloat(item.getAttribute('data-lng'));
                if (window.map) {
                    map.setCenter({ lat, lng });
                    map.setZoom(19);
                    if (window.innerWidth > 992) {
                        setTimeout(() => { map.panBy(-200, 0); }, 50);
                    }
                }
            }
        });
    });
});


// ------- LÓGICA DE GOOGLE MAPS -------
let map;

const locations = [
    { lat: -8.75861490943112, lng: -63.901736050868585, title: 'Porto Velho' },
    { lat: -9.710443818199323, lng: -64.53161394476314, title: 'União Bandeirantes' },
    { lat: -9.257549542880978, lng: -64.4087398966081, title: 'Jaci Paraná' },
    { lat: -10.430380, lng: -62.473627, title: 'Jaru' },
    { lat: -10.414480862625098, lng: -65.33144535390771, title: 'Nova Mamoré' },
    { lat: -10.780280005321504, lng: -65.33301796161155, title: 'Guajará-Mirim' },
    { lat: -10.374554528836622, lng: -64.80597021222648, title: 'Nova Dimensão' },
];

async function initMap() {
    const initialPosition = { lat: -9.76, lng: -64.90 };

    // Note: O 'mapStyle' antigo foi removido das opções abaixo 
    // porque estilos personalizados não se aplicam ao modo Satélite.

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: initialPosition,
        disableDefaultUI: true,
        zoomControl: true,
        // --- AS DUAS LINHAS ABAIXO ATIVAM O SATÉLITE ---
        mapTypeId: 'satellite', 
        heading: 0,
        tilt: 0 // Garante que o mapa fique plano (sem visão 3D/inclinação)
    });

    locations.forEach(location => {
        new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            icon: {
                url: 'assets/images/logo-completo.png',
                scaledSize: new google.maps.Size(90, 28),
                anchor: new google.maps.Point(45, 28)
            },
            label: {
                text: location.title,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px',
                className: 'map-marker-label'
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const MOBILE_QUERY = '(max-width: 720px)';
    const mm = window.matchMedia(MOBILE_QUERY);

    const section = document.querySelector('#servicos-adicionais');
    if (!section) return;

    const grid = section.querySelector('.extras-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.extra-card'));
    if (cards.length === 0) return;

    let tabs = null;
    let view = null;
    let activeIndex = 0;
    let mounted = false;

    function getIconAndTitle(card) {
        const icon = card.querySelector('.card-icon i');
        const title = card.querySelector('h3');
        return {
            iconClass: icon ? icon.className : 'fa-solid fa-circle',
            title: title ? title.textContent.trim() : 'Serviço'
        };
    }

    function renderActive(index) {
        activeIndex = index;
        // actualizar estado de pestañas
        tabs.querySelectorAll('.extras-tab').forEach((t, i) => {
            const sel = i === index;
            t.setAttribute('aria-selected', sel ? 'true' : 'false');
            t.setAttribute('tabindex', sel ? '0' : '-1');
        });
        // render panel
        view.innerHTML = '';
        const clone = cards[index].cloneNode(true);
        view.appendChild(clone);
    }

    function mountMobileUI() {
        if (mounted) return;
        mounted = true;

        tabs = document.createElement('div');
        tabs.className = 'extras-tabs';
        tabs.setAttribute('role', 'tablist');
        tabs.setAttribute('aria-label', 'Serviços adicionais');

        view = document.createElement('div');
        view.className = 'extras-view';
        view.setAttribute('role', 'region');
        view.setAttribute('aria-live', 'polite');

        cards.forEach((card, idx) => {
            const { iconClass, title } = getIconAndTitle(card);
            const tab = document.createElement('button');
            tab.className = 'extras-tab';
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
            tab.setAttribute('tabindex', idx === 0 ? '0' : '-1');
            tab.dataset.index = String(idx);
            tab.innerHTML = `<i class="${iconClass}"></i><span>${title}</span>`;
            tabs.appendChild(tab);
        });

        tabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.extras-tab');
            if (!btn) return;
            const i = Number(btn.dataset.index || 0);
            renderActive(i);
        });

        tabs.addEventListener('keydown', (e) => {
            const KEY_LEFT = 37, KEY_RIGHT = 39, KEY_HOME = 36, KEY_END = 35, KEY_ENTER = 13, KEY_SPACE = 32;
            const buttons = Array.from(tabs.querySelectorAll('.extras-tab'));
            const current = buttons.findIndex(b => b.getAttribute('aria-selected') === 'true');
            if (current < 0) return;

            let next = current;
            if (e.keyCode === KEY_RIGHT) next = (current + 1) % buttons.length;
            if (e.keyCode === KEY_LEFT) next = (current - 1 + buttons.length) % buttons.length;
            if (e.keyCode === KEY_HOME) next = 0;
            if (e.keyCode === KEY_END) next = buttons.length - 1;

            if ([KEY_LEFT, KEY_RIGHT, KEY_HOME, KEY_END].includes(e.keyCode)) {
                e.preventDefault();
                buttons[next].focus();
                renderActive(next);
            }

            if (e.keyCode === KEY_ENTER || e.keyCode === KEY_SPACE) {
                e.preventDefault();
                renderActive(current);
            }
        });

        grid.parentNode.insertBefore(tabs, grid);
        grid.parentNode.insertBefore(view, grid);
        renderActive(0);
    }

    function unmountMobileUI() {
        if (!mounted) return;
        mounted = false;
        if (tabs && tabs.parentNode) tabs.parentNode.removeChild(tabs);
        if (view && view.parentNode) view.parentNode.removeChild(view);
        tabs = null;
        view = null;
    }

    // Inicial según breakpoint
    if (mm.matches) mountMobileUI(); else unmountMobileUI();
    // Escucha cambios de tamaño/orientación
    mm.addEventListener ? mm.addEventListener('change', (e) => {
        if (e.matches) mountMobileUI(); else unmountMobileUI();
    }) : mm.addListener((e) => { // fallback
        if (e.matches) mountMobileUI(); else unmountMobileUI();
    });
});


