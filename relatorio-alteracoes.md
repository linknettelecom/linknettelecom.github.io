# Relatório de Alterações — LinkNet Telecomunicações
**Site:** www.linknettelecom.net.br | **Repositório:** linknettelecom.github.io
**Período:** Março 2026

---

## 1. Rastreamento e Conversões

- **GTM instalado** (`GTM-564SBN4L`) no `<head>` e `<body>` de todas as páginas
- **Conversão do Google Ads** migrada do código inline (disparava em todo carregamento) para evento `lead_conversion` via `dataLayer`, disparado apenas na página de obrigado após envio do formulário
- **Captura de UTMs e GCLID** implementada em `form.js`: os parâmetros são lidos da URL e salvos em `sessionStorage` com prefixo `ln_`, persistindo entre páginas

---

## 2. Formulário de Captação de Leads (Modal Multi-Step)

Substituiu o botão de WhatsApp direto por um fluxo de 3 etapas:

- **Passo 1:** Nome do lead
- **Passo 2:** Intenção (cards clicáveis: Contratar / Fazer Upgrade / Tirar dúvidas)
- **Passo 3:** Região/cidade

Ao final, os dados são salvos em `sessionStorage` e o usuário é redirecionado para `/obrigado.html`.

Todos os botões "Contratar" do site abrem o mesmo modal, que detecta automaticamente qual plano foi clicado.

---

## 3. Página de Obrigado (`/obrigado.html`)

Nova página criada com:

- Disparo do evento de conversão (`lead_conversion`) via GTM
- Montagem automática da mensagem de WhatsApp com nome, intenção e região do lead
- Abertura automática do WhatsApp após 1,8 segundos
- Meta tag `noindex, nofollow` (não indexável pelo Google)
- Estrutura preparada para futura integração com Supabase

---

## 4. Google Maps sem API Key

A integração via Google Maps JS API (que exigia uma API key exposta no HTML) foi substituída por um `<iframe>` simples. O mapa muda dinamicamente ao clicar em cada unidade no acordeão, sem custo nem risco de segurança.

---

## 5. Botão Flutuante de WhatsApp

Adicionado botão fixo no canto inferior direito com animação de pulso, que abre o modal de captação (não direciona direto ao WhatsApp).

---

## 6. SEO Local — Schema.org

Adicionado bloco `JSON-LD` com marcação `LocalBusiness` contendo as 7 unidades da LinkNet, melhorando a elegibilidade para resultados ricos no Google.

---

## 7. Correções Gerais

| Item | Antes | Depois |
|---|---|---|
| Links do footer | Âncoras quebradas (`#`, `#servicos`) | Corrigidos (`#servicos-adicionais`, `#contato`) |
| Links externos | Sem `rel` de segurança | `rel="noopener noreferrer"` adicionado |
| Copyright | 2024 | 2025 |
| Alt text do logo | `"en blanco"` (espanhol) | `"em branco"` |
| Nova Mutum | Sem endereço | Nota de atendimento pela unidade Jaci Paraná |
| Badge de destaque | Ausente | "Popular" no Plano Advanced |
| Meta tags sociais | Ausentes | Open Graph + Twitter Card adicionados |

---

## 8. Otimizações Mobile

- **Cards de planos:** empilham verticalmente (antes transbordavam horizontalmente)
- **Seção de unidades (mapa):** sidebar e iframe empilham em coluna (antes causava scroll horizontal)
- **Hero row:** em telas menores que 480px, caixa de preço e botão CTA empilham verticalmente

---

## Pendências

- **Supabase:** integração para salvar leads aguarda credenciais do cliente
- **n8n / Offline Conversion:** automação de conversões offline via GCLID → Google Ads API (planejado para após Supabase)
