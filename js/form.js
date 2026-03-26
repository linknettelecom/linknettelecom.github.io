/**
 * form.js — Lógica do formulário de captação de leads
 *
 * Responsabilidades:
 *  1. Ler e persistir UTMs + GCLID da URL na sessão
 *  2. Interceptar cliques em .btn-contratar e abrir o modal
 *  3. Identificar o plano clicado automaticamente
 *  4. Validar o formulário
 *  5. Disparar trackConversion() (Google Ads) ao enviar
 *  6. Redirecionar ao WhatsApp com mensagem pré-montada
 */
(function () {
    'use strict';

    const WHATSAPP_NUMBER = '556932368140';

    // =========================================================
    // 1. UTMs e GCLID
    // =========================================================

    /**
     * Lê os parâmetros de rastreamento da URL e os persiste
     * no sessionStorage para não perdê-los em navegações internas.
     */
    function salvarParametrosDaUrl() {
        var params = new URLSearchParams(window.location.search);
        var chaves = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        chaves.forEach(function (chave) {
            var valor = params.get(chave);
            if (valor) {
                sessionStorage.setItem('ln_' + chave, valor);
            }
        });
    }

    /**
     * Retorna todos os parâmetros de rastreamento,
     * priorizando a URL atual e caindo no sessionStorage como fallback.
     */
    function getParametros() {
        var params = new URLSearchParams(window.location.search);
        var chaves = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        var resultado = {};
        chaves.forEach(function (chave) {
            resultado[chave] = params.get(chave) || sessionStorage.getItem('ln_' + chave) || '';
        });
        return resultado;
    }

    // =========================================================
    // 2. Referências ao DOM
    // =========================================================
    var modal      = document.getElementById('leadModal');
    var overlay    = document.getElementById('modalOverlay');
    var closeBtn   = document.getElementById('modalClose');
    var form       = document.getElementById('leadForm');

    if (!modal || !form) {
        // Modal não encontrado no DOM — sair silenciosamente
        return;
    }

    // =========================================================
    // 3. Abrir / Fechar modal
    // =========================================================

    var planoAtual = '';

    function abrirModal(plano) {
        planoAtual = plano || '';
        document.getElementById('leadPlan').value = planoAtual;

        // Preencher campos ocultos com os parâmetros capturados
        var p = getParametros();
        document.getElementById('leadGclid').value       = p.gclid;
        document.getElementById('leadUtmSource').value   = p.utm_source;
        document.getElementById('leadUtmMedium').value   = p.utm_medium;
        document.getElementById('leadUtmCampaign').value = p.utm_campaign;
        document.getElementById('leadUtmContent').value  = p.utm_content;
        document.getElementById('leadUtmTerm').value     = p.utm_term;

        modal.classList.add('active');
        document.body.classList.add('modal-open');

        // Foca no primeiro campo para acessibilidade
        setTimeout(function () {
            var primeiroInput = document.getElementById('leadName');
            if (primeiroInput) primeiroInput.focus();
        }, 120);
    }

    function fecharModal() {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        form.reset();
        limparErros();
    }

    // Fechar ao clicar no overlay
    if (overlay) overlay.addEventListener('click', fecharModal);

    // Fechar ao clicar no X
    if (closeBtn) closeBtn.addEventListener('click', fecharModal);

    // Fechar com a tecla ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            fecharModal();
        }
    });

    // =========================================================
    // 4. Interceptar cliques nos botões .btn-contratar
    // =========================================================

    document.querySelectorAll('.btn-contratar').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            // Tentar identificar o plano pelo card pai
            var card = btn.closest('.pricing-card');
            var nomePlano = '';

            if (card) {
                var h3    = card.querySelector('h3');
                var speed = card.querySelector('.plan-speed');
                var price = card.querySelector('.card-price .amount');

                if (h3)    nomePlano += h3.textContent.trim();
                if (speed) nomePlano += ' – ' + speed.textContent.trim().replace(/\s+/g, ' ');
                if (price) nomePlano += ' (' + price.textContent.trim() + '/mês)';
            }

            abrirModal(nomePlano);
        });
    });

    // =========================================================
    // 5. Validação do formulário
    // =========================================================

    function limparErros() {
        document.querySelectorAll('.field-error').forEach(function (el) {
            el.textContent = '';
        });
        document.querySelectorAll('.lead-form input, .lead-form select').forEach(function (el) {
            el.classList.remove('error');
        });
    }

    function mostrarErro(campoId, erroId, mensagem) {
        var campo = document.getElementById(campoId);
        var erro  = document.getElementById(erroId);
        if (campo) campo.classList.add('error');
        if (erro)  erro.textContent = mensagem;
    }

    function validar() {
        limparErros();
        var valido = true;

        var nome    = document.getElementById('leadName').value.trim();
        var cidade  = document.getElementById('leadCity').value.trim();
        var intento = document.getElementById('leadIntent').value;

        if (!nome || nome.length < 2) {
            mostrarErro('leadName', 'nameError', 'Por favor, informe seu nome completo.');
            valido = false;
        }
        if (!cidade || cidade.length < 2) {
            mostrarErro('leadCity', 'cityError', 'Por favor, informe sua cidade ou bairro.');
            valido = false;
        }
        if (!intento) {
            mostrarErro('leadIntent', 'intentError', 'Por favor, selecione uma opção.');
            valido = false;
        }

        return valido;
    }

    // =========================================================
    // 6. Submit — montar mensagem e redirecionar ao WhatsApp
    // =========================================================

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validar()) return;

        var nome    = document.getElementById('leadName').value.trim();
        var cidade  = document.getElementById('leadCity').value.trim();
        var intento = document.getElementById('leadIntent').value;
        var plano   = document.getElementById('leadPlan').value;
        var p       = getParametros();

        // --- Montar mensagem ---
        var msg = 'Olá! Vim pelo site da LinkNet e gostaria de mais informações.\n\n';
        msg += '*Nome:* '          + nome   + '\n';
        msg += '*Cidade / Bairro:* ' + cidade + '\n';
        msg += '*Interesse:* '      + intento + '\n';
        if (plano) {
            msg += '*Plano de interesse:* ' + plano + '\n';
        }

        // --- Disparar conversão via GTM dataLayer ---
        // O GTM escuta o evento 'lead_conversion' e dispara a tag do Google Ads.
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'lead_conversion' });

        // --- Redirecionar ao WhatsApp ---
        var url = 'https://api.whatsapp.com/send/?phone=' + WHATSAPP_NUMBER
                + '&text=' + encodeURIComponent(msg);

        fecharModal();
        window.open(url, '_blank', 'noopener,noreferrer');
    });

    // =========================================================
    // Inicialização
    // =========================================================
    salvarParametrosDaUrl();

})();
