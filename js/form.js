/**
 * form.js — Formulário multi-step de captação de leads
 *
 * Fluxo:
 *   Step 1 → Nome
 *   Step 2 → Intenção (cards clicáveis, auto-avança)
 *   Step 3 → Região + botão de envio
 *   Envio  → Salva dados na sessionStorage → Redireciona para /obrigado.html
 *            (obrigado.html dispara conversão GTM + abre WhatsApp)
 */
(function () {
    'use strict';

    // =========================================================
    // UTMs e GCLID
    // =========================================================

    function salvarParametrosDaUrl() {
        var params = new URLSearchParams(window.location.search);
        ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
            .forEach(function (k) {
                var v = params.get(k);
                if (v) sessionStorage.setItem('ln_' + k, v);
            });
    }

    function getParametros() {
        var params = new URLSearchParams(window.location.search);
        var chaves = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        var r = {};
        chaves.forEach(function (k) {
            r[k] = params.get(k) || sessionStorage.getItem('ln_' + k) || '';
        });
        return r;
    }

    // =========================================================
    // Elementos DOM
    // =========================================================
    var modal        = document.getElementById('leadModal');
    var overlay      = document.getElementById('modalOverlay');
    var closeBtn     = document.getElementById('modalClose');
    var progressFill = document.getElementById('leadProgressFill');

    // Steps
    var step1El = document.getElementById('leadStep1');
    var step2El = document.getElementById('leadStep2');
    var step3El = document.getElementById('leadStep3');

    // Inputs
    var nameInput = document.getElementById('leadName');
    var cityInput = document.getElementById('leadCity');

    // Botões de navegação
    var step1Next   = document.getElementById('step1Next');
    var step2Back   = document.getElementById('step2Back');
    var step3Back   = document.getElementById('step3Back');
    var step3Submit = document.getElementById('step3Submit');

    // Erros
    var nameError = document.getElementById('nameError');
    var cityError = document.getElementById('cityError');

    if (!modal) return;

    // Dados coletados
    var dados = { nome: '', intencao: '', regiao: '', plano: '' };

    // =========================================================
    // Progresso
    // =========================================================
    var PROGRESS = ['33.33%', '66.66%', '100%'];

    function setProgress(stepIndex) {
        if (progressFill) progressFill.style.width = PROGRESS[stepIndex];
    }

    // =========================================================
    // Navegação entre steps
    // =========================================================
    var STEPS = [step1El, step2El, step3El];
    var currentStep = 0;

    function goTo(index) {
        STEPS.forEach(function (s) { if (s) s.classList.remove('active'); });
        if (STEPS[index]) STEPS[index].classList.add('active');
        currentStep = index;
        setProgress(index);

        // Foco no input do step (acessibilidade)
        setTimeout(function () {
            if (index === 0 && nameInput) nameInput.focus();
            if (index === 2 && cityInput) cityInput.focus();
        }, 80);
    }

    // =========================================================
    // Abrir / Fechar modal
    // =========================================================
    function abrirModal(plano) {
        dados = { nome: '', intencao: '', regiao: '', plano: plano || '' };
        if (nameInput) nameInput.value = '';
        if (cityInput) cityInput.value = '';
        limparErros();
        goTo(0);
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }

    function fecharModal() {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    if (overlay) overlay.addEventListener('click', fecharModal);
    if (closeBtn) closeBtn.addEventListener('click', fecharModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) fecharModal();
    });

    // =========================================================
    // Interceptar cliques nos botões CTA
    // =========================================================
    document.querySelectorAll('.btn-contratar').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var card = btn.closest('.pricing-card');
            var plano = '';
            if (card) {
                var h3    = card.querySelector('h3');
                var speed = card.querySelector('.plan-speed');
                var price = card.querySelector('.card-price .amount');
                if (h3)    plano += h3.textContent.trim();
                if (speed) plano += ' – ' + speed.textContent.trim().replace(/\s+/g, ' ');
                if (price) plano += ' (' + price.textContent.trim() + '/mês)';
            }
            abrirModal(plano);
        });
    });

    // =========================================================
    // Validação
    // =========================================================
    function limparErros() {
        if (nameError) nameError.textContent = '';
        if (cityError) cityError.textContent = '';
        if (nameInput) nameInput.classList.remove('error');
        if (cityInput) cityInput.classList.remove('error');
    }

    // =========================================================
    // Step 1 → Próximo
    // =========================================================
    if (step1Next) {
        step1Next.addEventListener('click', function () {
            var nome = nameInput ? nameInput.value.trim() : '';
            if (!nome || nome.length < 2) {
                if (nameInput) nameInput.classList.add('error');
                if (nameError) nameError.textContent = 'Por favor, informe seu nome.';
                if (nameInput) nameInput.focus();
                return;
            }
            dados.nome = nome;
            if (nameInput) nameInput.classList.remove('error');
            if (nameError) nameError.textContent = '';
            goTo(1);
        });

        // Avança com Enter no campo nome
        if (nameInput) {
            nameInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); step1Next.click(); }
            });
        }
    }

    // =========================================================
    // Step 2 → Cards de opção (auto-avança)
    // =========================================================
    document.querySelectorAll('.lead-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
            dados.intencao = btn.getAttribute('data-value') || '';
            goTo(2);
        });
    });

    if (step2Back) step2Back.addEventListener('click', function () { goTo(0); });

    // =========================================================
    // Step 3 → Voltar / Enviar
    // =========================================================
    if (step3Back) step3Back.addEventListener('click', function () { goTo(1); });

    if (step3Submit) {
        step3Submit.addEventListener('click', function () {
            var regiao = cityInput ? cityInput.value.trim() : '';
            if (!regiao || regiao.length < 2) {
                if (cityInput) cityInput.classList.add('error');
                if (cityError) cityError.textContent = 'Por favor, informe sua cidade ou bairro.';
                if (cityInput) cityInput.focus();
                return;
            }
            dados.regiao = regiao;
            if (cityInput) cityInput.classList.remove('error');
            if (cityError) cityError.textContent = '';
            enviar();
        });

        // Avança com Enter no campo região
        if (cityInput) {
            cityInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); step3Submit.click(); }
            });
        }
    }

    // =========================================================
    // Envio — Dispara GTM, Salva no Supabase e Abre WhatsApp
    // =========================================================
    function enviar() {
        var p = getParametros();
        var step3Submit = document.getElementById('step3Submit');

        // Muda o texto do botão para dar um feedback visual ao cliente de que está carregando
        if (step3Submit) {
            step3Submit.textContent = 'Iniciando atendimento...';
            step3Submit.disabled = true;
        }

        // 1. Monta a mensagem e o link do WhatsApp
        var WHATSAPP = '556932368140';
        var msg = 'Olá, vi seu anúncio no Site. Me chamo ' + (dados.nome || 'um interessado');
        msg += ', estou buscando por ' + (dados.intencao || 'internet');
        msg += ' e moro em ' + (dados.regiao || 'Rondônia') + '.';
        if (dados.plano) msg += '\n\nPlano de interesse: ' + dados.plano;

        var url = 'https://api.whatsapp.com/send/?phone=' + WHATSAPP + '&text=' + encodeURIComponent(msg);

        // 2. Dispara evento de conversão via GTM
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'lead_conversion' });

        // 3. Salva os dados no banco Supabase
        try {
            var sb = supabase.createClient(
                'https://wxhbzdmmekeditxerqhd.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4aGJ6ZG1tZWtlZGl0eGVycWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDEzNjYsImV4cCI6MjA5MDIxNzM2Nn0.xq8jVwIjDfZjIx_QsHx2rAdJJmGl236JqYRVr4xbDHg'
            );

            var rawSource   = p.utm_source || '';
            var rawMedium   = p.utm_medium || '';
            var rawGclid    = p.gclid || '';
            var finalSource, finalMedium;

            if (rawSource) {
                finalSource = rawSource;
                finalMedium = rawMedium || null;
            } else if (rawGclid) {
                finalSource = 'google';
                finalMedium = 'cpc';
            } else {
                finalSource = 'direct';
                finalMedium = null;
            }

            sb.from('leads').insert([{
                nome:         dados.nome,
                intencao:     dados.intencao,
                regiao:       dados.regiao,
                plano:        dados.plano,
                utm_source:   finalSource,
                utm_medium:   finalMedium,
                utm_campaign: p.utm_campaign || null,
                utm_term:     p.utm_term || null,
                utm_content:  p.utm_content || null,
                gclid:        rawGclid || null
            }]).then(function (res) {
                if (res.error) console.warn('[Supabase] Erro ao salvar lead:', res.error.message);
            });
        } catch (e) {
            console.warn('[Supabase] Falha na inicialização do Supabase:', e);
        }

        // 4. Aguarda pouco mais de 1 segundo (para o GTM registrar) e abre o WhatsApp
        setTimeout(function () {
            window.open(url, '_blank', 'noopener,noreferrer');
            fecharModal();
            
            // Restaura o botão caso o cliente volte para a aba do site
            if (step3Submit) {
                step3Submit.textContent = 'Enviar';
                step3Submit.disabled = false;
            }
        }, 1200);
    }

    // =========================================================
    // Inicialização
    // =========================================================
    salvarParametrosDaUrl();

})();
