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
    // Envio — salva na sessionStorage e redireciona para /obrigado
    // =========================================================
    function enviar() {
        var p = getParametros();

        // Salvar dados do lead na sessão (lidos pela obrigado.html)
        sessionStorage.setItem('ln_lead_nome',     dados.nome);
        sessionStorage.setItem('ln_lead_intencao', dados.intencao);
        sessionStorage.setItem('ln_lead_regiao',   dados.regiao);
        sessionStorage.setItem('ln_lead_plano',    dados.plano);
        sessionStorage.setItem('ln_lead_gclid',    p.gclid);
        sessionStorage.setItem('ln_lead_utm_source',   p.utm_source);
        sessionStorage.setItem('ln_lead_utm_medium',   p.utm_medium);
        sessionStorage.setItem('ln_lead_utm_campaign', p.utm_campaign);
        sessionStorage.setItem('ln_lead_utm_content',  p.utm_content);
        sessionStorage.setItem('ln_lead_utm_term',     p.utm_term);
        sessionStorage.setItem('ln_lead_ts', new Date().toISOString());

        fecharModal();
        window.location.href = '/obrigado.html';
    }

    // =========================================================
    // Inicialização
    // =========================================================
    salvarParametrosDaUrl();

})();
