# poc-mkdocs

POC de documentação técnica utilizando [MkDocs](https://www.mkdocs.org/) com o tema [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/). O objetivo é demonstrar como criar um site de documentação moderno, bonito e interativo, com deploy automático via GitHub Actions no GitHub Pages.

**Demo:** https://Allanhenriquee.github.io/poc-mkdocs

---

## Índice

- [Visão geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Instalação e execução local](#instalação-e-execução-local)
- [Configurando o mkdocs.yml](#configurando-o-mkdocsyml)
- [Criando páginas em Markdown](#criando-páginas-em-markdown)
- [Customizando o tema (CSS e JS)](#customizando-o-tema-css-e-js)
- [Criando uma home page personalizada](#criando-uma-home-page-personalizada)
- [Deploy automático com GitHub Actions](#deploy-automático-com-github-actions)
- [Habilitando o GitHub Pages](#habilitando-o-github-pages)
- [Recursos utilizados nesta POC](#recursos-utilizados-nesta-poc)

---

## Visão geral

O MkDocs converte arquivos Markdown em um site estático. O tema Material adiciona uma camada de UI moderna com suporte a dark/light mode, pesquisa, navegação instantânea e dezenas de extensões.

Esta POC vai além do padrão e inclui:

- Home page completamente customizada com hero section animada
- Efeito de digitação (typed text) com fade entre palavras
- Contadores animados via IntersectionObserver
- Cards com fade-in ao rolar a página
- Efeito parallax com mouse nos orbs do background
- Dark mode e light mode totalmente funcionais
- Deploy automático a cada push na branch `main`

---

## Pré-requisitos

- Python 3.8 ou superior
- pip
- Git
- Conta no GitHub

Verifique as versões instaladas:

```bash
python --version
pip --version
git --version
```

---

## Estrutura do projeto

```
poc-mkdocs/
├── .github/
│   └── workflows/
│       └── deploy-docs.yml     # Pipeline de deploy automático
├── docs/                       # Todo o conteúdo em Markdown
│   ├── index.md                # Página inicial (aponta para o template customizado)
│   ├── stylesheets/
│   │   └── extra.css           # CSS customizado do tema
│   ├── javascripts/
│   │   └── extra.js            # Animações e interatividade
│   └── (suas páginas .md)
├── overrides/
│   └── home.html               # Template HTML da home page
├── mkdocs.yml                  # Configuração principal do MkDocs
├── requirements.txt            # Dependências Python
└── README.md
```

---

## Instalação e execução local

### 1. Clone o repositório

```bash
git clone https://github.com/Allanhenriquee/poc-mkdocs.git
cd poc-mkdocs
```

### 2. Crie e ative um ambiente virtual (recomendado)

```bash
python -m venv .venv

# Linux / macOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

O `requirements.txt` deste projeto contém:

```
mkdocs-material>=9.5
```

### 4. Suba o servidor local

```bash
mkdocs serve
```

Acesse em: [http://127.0.0.1:8000](http://127.0.0.1:8000)

O servidor tem hot-reload: qualquer alteração em arquivos `.md`, `.css`, `.js` ou no `mkdocs.yml` recarrega o site automaticamente.

---

## Configurando o mkdocs.yml

O `mkdocs.yml` é o arquivo central do projeto. Abaixo o exemplo completo utilizado nesta POC com comentários explicativos:

```yaml
site_name: Plataforma de Pedidos
site_description: Documentação técnica da plataforma
site_author: Time de Engenharia
# URL final do GitHub Pages — substitua pelo seu usuário/repositório
site_url: https://SEU_USUARIO.github.io/NOME_DO_REPO

repo_name: SEU_USUARIO/NOME_DO_REPO
repo_url: https://github.com/SEU_USUARIO/NOME_DO_REPO

theme:
  name: material
  custom_dir: overrides        # Pasta para templates HTML customizados
  language: pt-BR
  font:
    text: Inter                # Fonte principal (carregada do Google Fonts)
    code: JetBrains Mono       # Fonte para blocos de código
  palette:
    # Dark mode (padrão)
    - scheme: slate
      primary: custom
      accent: cyan
      toggle:
        icon: material/brightness-4
        name: Alternar para modo claro
    # Light mode
    - scheme: default
      primary: custom
      accent: cyan
      toggle:
        icon: material/brightness-7
        name: Alternar para modo escuro
  features:
    - navigation.instant           # Navegação SPA sem reload de página
    - navigation.instant.progress  # Barra de progresso na navegação
    - navigation.tracking          # Atualiza URL ao rolar entre seções
    - navigation.tabs              # Tabs no topo para seções principais
    - navigation.tabs.sticky       # Tabs fixas ao rolar
    - navigation.sections          # Agrupa páginas em seções no sidebar
    - navigation.top               # Botão "voltar ao topo"
    - navigation.footer            # Links prev/next no rodapé
    - search.suggest               # Sugestões na busca
    - search.highlight             # Destaca termos buscados na página
    - search.share                 # Botão de compartilhar busca
    - content.code.annotate        # Anotações em blocos de código
    - content.code.copy            # Botão copiar em blocos de código
    - content.tooltips             # Tooltips em links
    - toc.follow                   # TOC acompanha o scroll
  icon:
    repo: fontawesome/brands/github
    logo: material/rocket-launch

# CSS e JS customizados
extra_css:
  - stylesheets/extra.css

extra_javascript:
  - javascripts/extra.js

plugins:
  - search:
      lang: pt

# Extensões Markdown
markdown_extensions:
  - admonition                     # Blocos de aviso/info/tip
  - pymdownx.details               # Blocos expansíveis
  - pymdownx.superfences           # Blocos de código avançados
  - pymdownx.highlight:
      anchor_linenums: true        # Link para número de linha
  - pymdownx.inlinehilite          # Highlight inline de código
  - pymdownx.tabbed:
      alternate_style: true        # Tabs dentro de páginas
  - pymdownx.emoji:
      emoji_index: !!python/name:material.extensions.emoji.twemoji
      emoji_generator: !!python/name:material.extensions.emoji.to_svg
  - tables
  - toc:
      permalink: true              # Link âncora nos títulos
  - attr_list
  - md_in_html                     # Markdown dentro de tags HTML

# Estrutura de navegação
nav:
  - Início: index.md
  - Arquitetura:
      - Visão Geral: architecture/overview.md
      - Decisões (ADR): architecture/adr-001-event-driven.md
  - API:
      - Referência: api/reference.md
  - Guias:
      - Configuração Local: guides/local-setup.md
```

---

## Criando páginas em Markdown

Cada arquivo `.md` dentro de `docs/` vira uma página. O Material suporta extensões poderosas:

### Blocos de aviso

```markdown
!!! note "Observação"
    Conteúdo da nota.

!!! warning "Atenção"
    Algo importante a saber.

!!! tip "Dica"
    Uma dica útil.
```

### Blocos de código com destaque

````markdown
```csharp title="OrderService.cs" linenums="1"
public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
{
    var order = new Order(request.CustomerId, request.Items);
    await _repository.AddAsync(order);
    return order;
}
```
````

### Tabs dentro de página

```markdown
=== "C#"
    ```csharp
    var result = await service.GetAsync(id);
    ```

=== "HTTP"
    ```http
    GET /api/orders/123
    ```
```

### Blocos expansíveis

```markdown
??? info "Detalhes adicionais"
    Conteúdo oculto por padrão, expandido ao clicar.
```

### Tabelas

```markdown
| Campo     | Tipo   | Obrigatório | Descrição          |
|-----------|--------|-------------|--------------------|
| id        | uuid   | sim         | Identificador      |
| name      | string | sim         | Nome do recurso    |
```

---

## Customizando o tema (CSS e JS)

### CSS customizado

Crie o arquivo `docs/stylesheets/extra.css`. O Material usa variáveis CSS que podem ser sobrescritas por scheme:

```css
/* Variáveis para dark mode */
[data-md-color-scheme="slate"] {
  --md-primary-fg-color: #7c3aed;
  --md-accent-fg-color: #06b6d4;
  --color-primary: #7c3aed;
  --color-accent: #06b6d4;
  --color-bg: #09090f;
}

/* Variáveis para light mode */
[data-md-color-scheme="default"] {
  --md-primary-fg-color: #7c3aed;
  --md-accent-fg-color: #0891b2;
  --color-primary: #7c3aed;
  --color-accent: #0891b2;
  --color-bg: #f8f9ff;
}
```

### JavaScript customizado

Crie `docs/javascripts/extra.js`. Para funcionar com a navegação instantânea do Material (que é uma SPA), use o observable `document$` em vez de `DOMContentLoaded`:

```js
function boot() {
  // Inicializa seus componentes aqui
  initAnimations();
}

// Compatível com navigation.instant do Material
if (typeof document$ !== 'undefined') {
  document$.subscribe(boot);  // Dispara a cada troca de página
} else {
  document.addEventListener('DOMContentLoaded', boot);
}
```

> **Importante:** Com `navigation.instant` ativo, o MkDocs Material funciona como uma SPA. O `DOMContentLoaded` só dispara na primeira carga. Sempre use `document$.subscribe()` para garantir que seus scripts rodem a cada navegação.

### Animação de fade-in ao rolar

```css
/* CSS */
.fade-in {
  opacity: 0;
  transition: opacity 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
}
```

```js
// JavaScript
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 80px 0px' });

  elements.forEach(el => observer.observe(el));
}
```

Adicione a classe `fade-in` em qualquer elemento HTML do seu template para ativar o efeito.

---

## Criando uma home page personalizada

Para criar uma home page totalmente customizada (fora do layout padrão de conteúdo Markdown):

### 1. Configure o index.md

```markdown
---
template: home.html
title: Início
hide:
  - navigation
  - toc
---
```

### 2. Crie o template `overrides/home.html`

```html
{% extends "main.html" %}

{% block tabs %}
{{ super() }}

<!-- Seu HTML customizado aqui -->
<div class="hero">
  <h1>Minha Documentação</h1>
  <p>Subtítulo da plataforma.</p>
</div>

{% endblock %}

{% block content %}{% endblock %}
{% block footer %}{{ super() }}{% endblock %}
```

O bloco `{% block tabs %}` fica logo abaixo da barra de navegação, antes do conteúdo principal — ideal para heroes e seções de destaque. O `{% block content %}{% endblock %}` vazio remove o conteúdo padrão do Markdown.

### 3. Declare o `custom_dir` no mkdocs.yml

```yaml
theme:
  name: material
  custom_dir: overrides
```

---

## Deploy automático com GitHub Actions

Crie o arquivo `.github/workflows/deploy-docs.yml`:

```yaml
name: Deploy Docs

on:
  push:
    branches:
      - main          # Dispara a cada push na main
  workflow_dispatch:  # Permite disparo manual pela UI do GitHub

permissions:
  contents: write     # Necessário para escrever na branch gh-pages

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Histórico completo necessário para o gh-deploy

      - uses: actions/setup-python@v5
        with:
          python-version: '3.x'

      - name: Install dependencies
        run: pip install mkdocs-material

      - name: Deploy to GitHub Pages
        run: mkdocs gh-deploy --force
```

O comando `mkdocs gh-deploy --force` faz o build do site e faz push do conteúdo gerado para a branch `gh-pages` do repositório automaticamente.

---

## Habilitando o GitHub Pages

Após o primeiro deploy via GitHub Actions:

1. Acesse o repositório no GitHub
2. Vá em **Settings** → **Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Selecione a branch **`gh-pages`** e a pasta **`/ (root)`**
5. Clique em **Save**

Em alguns minutos o site estará disponível em:

```
https://SEU_USUARIO.github.io/NOME_DO_REPO
```

> **Repositório privado:** O GitHub Pages em repositórios privados requer o plano **GitHub Pro** ou superior para ser público. Se quiser manter o repositório privado e a documentação acessível apenas a colaboradores, isso não é possível nativamente com GitHub Pages free — considere usar o [Cloudflare Pages](https://pages.cloudflare.com/) ou similar com autenticação.

---

## Recursos utilizados nesta POC

| Recurso | Versão | Descrição |
|---------|--------|-----------|
| [MkDocs](https://www.mkdocs.org/) | latest | Gerador de sites estáticos para documentação |
| [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) | >= 9.5 | Tema com UI moderna e extensões avançadas |
| [GitHub Actions](https://docs.github.com/en/actions) | — | Pipeline de CI/CD para deploy automático |
| [GitHub Pages](https://pages.github.com/) | — | Hospedagem gratuita de sites estáticos |
| [Inter](https://fonts.google.com/specimen/Inter) | — | Fonte principal (via Google Fonts) |
| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | — | Fonte para blocos de código |

---

## Referências

- [Documentação oficial do MkDocs](https://www.mkdocs.org/user-guide/)
- [Documentação do Material for MkDocs](https://squidfunk.github.io/mkdocs-material/getting-started/)
- [Customização de temas — Material](https://squidfunk.github.io/mkdocs-material/customization/)
- [Publishing your site — Material](https://squidfunk.github.io/mkdocs-material/publishing-your-site/)
