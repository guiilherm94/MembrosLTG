# 🗄️ DesignGO Database v2.0 - Infoprodutos + Sistemas

## 📚 ÍNDICE DE COMPONENTES

```
PALETTES/           → Paletas de cores por contexto
  ├── infoproduto/  → Paletas para e-books, cursos, planilhas
  ├── fintech/      → Sistemas financeiros
  ├── ecommerce/    → Lojas online
  ├── health/       → Saúde e bem-estar
  ├── tech/         → Tecnologia e SaaS
  ├── creative/     → Agências e portfolios
  └── luxury/       → Premium e exclusivo

COMPONENTS/         → Componentes individuais prontos
  ├── infoproduto/  → Específicos para vendas de info
  ├── buttons/      → Botões diversos
  ├── cards/        → Cards (feature, pricing, testimonial)
  ├── forms/        → Formulários
  ├── navigation/   → Navbars
  └── footer/       → Rodapés

TEMPLATES/          → Seções completas prontas
  ├── hero/         → Hero sections
  ├── benefits/     → Seções de benefícios
  ├── proof/        → Provas visuais/sociais
  ├── for-who/      → Para quem é
  ├── offer/        → Ofertas e bundles
  ├── social-proof/ → Depoimentos
  ├── pricing/      → Preços e comparações
  ├── guarantee/    → Garantias
  ├── urgency/      → Urgência e escassez
  ├── faq/          → Perguntas frequentes
  ├── creator/      → Sobre o criador
  ├── features/     → Features de sistema
  ├── stats/        → Estatísticas
  ├── cta/          → Call-to-actions
  ├── upsell/       → Templates upsell
  └── downsell/     → Templates downsell

ANIMATIONS/         → Animações CSS prontas
```

---

# 🎨 PALETTES/

## infoproduto/high-conversion

**Quando usar:** E-books, planilhas, cursos, checklists de alta conversão

```css
/* Primary Colors - URGÊNCIA */
--primary-600: #ea580c;  /* orange-600 - CTA principal */
--primary-700: #c2410c;  /* orange-700 - CTA hover */
--primary-900: #7c2d12;  /* orange-900 - Elementos escuros */

/* Accent Colors - URGÊNCIA MÁXIMA */
--accent-500: #dc2626;   /* red-600 - Escassez/Urgência */
--accent-600: #b91c1c;   /* red-700 - Hover urgência */

/* Success - VALOR/BÔNUS */
--success-400: #fbbf24;  /* amber-400 - Valor/Gold */
--success-500: #f59e0b;  /* amber-500 - Destaque */
--success-600: #10b981;  /* emerald-500 - Garantia */

/* Background Dark */
--bg-dark-base: #0f172a;           /* slate-950 */
--bg-dark-overlay-start: #0f172a/80;
--bg-dark-overlay-via: #1e293b/60;
--bg-dark-overlay-end: #0f172a/80;
--blur-primary: #ea580c/25;        /* Laranja mais intenso */
--blur-accent: #dc2626/20;         /* Vermelho */
--blur-tertiary: #fbbf24/15;       /* Dourado */

/* Background Light */
--bg-light: #ffffff;
--bg-light-alt: #fff7ed;  /* orange-50 */

/* Text on Dark */
--text-dark-primary: #ffffff;
--text-dark-body: #e2e8f0;         /* gray-200 */
--text-dark-accent: #fb923c;       /* orange-400 */
--text-dark-urgency: #fca5a5;      /* red-300 */

/* Text on Light */
--text-light-primary: #111827;     /* gray-900 */
--text-light-body: #374151;        /* gray-700 */
--text-light-accent: #ea580c;      /* orange-600 */
--text-light-urgency: #dc2626;     /* red-600 */
```

## infoproduto/trust-blue

**Quando usar:** Cursos profissionais, infoprodutos de confiança/educação

```css
--primary-600: #2563eb;  /* blue-600 */
--primary-700: #1d4ed8;  /* blue-700 */

--accent-500: #10b981;   /* emerald-500 - Garantia/Confiança */
--accent-600: #059669;   /* emerald-600 */

--bg-dark-base: #0f172a;
--blur-primary: #2563eb/20;
--blur-accent: #10b981/15;

--bg-light: #ffffff;
--bg-light-alt: #eff6ff;  /* blue-50 */

--text-dark-primary: #ffffff;
--text-dark-body: #e2e8f0;
--text-dark-accent: #60a5fa;

--text-light-primary: #111827;
--text-light-body: #374151;
--text-light-accent: #1d4ed8;
```

## fintech/trust-green

```css
/* [MANTIDO DO v1.0] */
--primary-600: #059669;
--primary-700: #047857;
--accent-400: #2dd4bf;
--accent-500: #14b8a6;
/* ... resto igual */
```

## ecommerce/energy-orange

```css
/* [MANTIDO DO v1.0] */
--primary-600: #ea580c;
--primary-700: #c2410c;
/* ... resto igual */
```

## health/fresh-teal

```css
/* [MANTIDO DO v1.0] */
--primary-600: #0d9488;
--primary-700: #0f766e;
/* ... resto igual */
```

## tech/tech-blue

```css
/* [MANTIDO DO v1.0] */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
/* ... resto igual */
```

## tech/modern-slate

```css
/* [MANTIDO DO v1.0] */
--primary-600: #475569;
--primary-700: #334155;
/* ... resto igual */
```

## creative/bold-gradient

```css
/* [MANTIDO DO v1.0] */
--primary-600: #db2777;
--primary-700: #be185d;
/* ... resto igual */
```

## luxury/luxury-dark

```css
/* [MANTIDO DO v1.0] */
--primary-600: #1e293b;
--primary-700: #0f172a;
/* ... resto igual */
```

---

# 🧱 COMPONENTS/

## infoproduto/countdown-timer

```html
<div class="bg-red-600 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-4 shadow-lg">
    <i data-lucide="clock" class="w-5 h-5"></i>
    <span class="font-bold text-lg">OFERTA EXPIRA EM:</span>
    <div class="flex gap-2">
        <div class="bg-red-700 px-3 py-1 rounded">
            <span class="font-black text-xl" id="hours">00</span>
            <span class="text-xs block">HORAS</span>
        </div>
        <div class="bg-red-700 px-3 py-1 rounded">
            <span class="font-black text-xl" id="minutes">00</span>
            <span class="text-xs block">MIN</span>
        </div>
        <div class="bg-red-700 px-3 py-1 rounded">
            <span class="font-black text-xl" id="seconds">00</span>
            <span class="text-xs block">SEG</span>
        </div>
    </div>
</div>

<script>
// Contador regressivo de 24h
let timeLeft = 24 * 60 * 60; // 24 horas em segundos
setInterval(() => {
    if (timeLeft <= 0) return;
    timeLeft--;
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    document.getElementById('hours').textContent = String(h).padStart(2, '0');
    document.getElementById('minutes').textContent = String(m).padStart(2, '0');
    document.getElementById('seconds').textContent = String(s).padStart(2, '0');
}, 1000);
</script>
```

## infoproduto/guarantee-badge-7days

```html
<div class="flex items-center justify-center">
    <div class="relative">
        <!-- Selo de Garantia -->
        <div class="w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
            <div class="text-center">
                <i data-lucide="shield-check" class="w-12 h-12 text-white mx-auto mb-1"></i>
                <span class="text-white font-black text-xs">GARANTIA</span>
                <span class="text-white font-black text-2xl block">7 DIAS</span>
            </div>
        </div>
        <!-- Glow animado -->
        <div class="absolute inset-0 rounded-full bg-emerald-400 opacity-30 blur-xl animate-pulse-glow"></div>
    </div>
</div>

<div class="text-center mt-6 max-w-2xl mx-auto">
    <h3 class="text-2xl font-bold text-gray-900 mb-4">
        100% Garantido ou Seu Dinheiro de Volta
    </h3>
    <p class="text-gray-700 leading-relaxed">
        Você tem <strong>7 dias</strong> para testar [PRODUTO]. Se não gostar por qualquer motivo, devolvemos 100% do seu investimento. Sem perguntas, sem burocracia.
    </p>
</div>
```

## infoproduto/bonus-card

```html
<div class="group bg-white p-6 rounded-xl border-2 border-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
    <!-- Header com Ícone -->
    <div class="flex items-center gap-4 mb-4">
        <div class="relative">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
                <i data-lucide="gift" class="w-7 h-7 text-white"></i>
            </div>
            <div class="absolute inset-0 rounded-full bg-orange-400 opacity-30 blur-lg animate-pulse-glow"></div>
        </div>
        <div>
            <span class="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-1">
                BÔNUS #1
            </span>
            <h3 class="font-bold text-gray-900 text-lg">Nome do Bônus</h3>
        </div>
    </div>
    
    <!-- Descrição -->
    <p class="text-gray-700 mb-4 leading-relaxed">
        Descrição completa do que é esse bônus e como ele complementa o produto principal.
    </p>
    
    <!-- Valor -->
    <div class="flex items-center gap-3">
        <span class="text-gray-500 line-through text-lg">De: R$ 197</span>
        <span class="text-2xl font-black text-orange-600">GRÁTIS HOJE</span>
    </div>
</div>
```

## infoproduto/price-breakdown

```html
<div class="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border border-gray-200 shadow-lg">
    <!-- Preço Riscado -->
    <div class="text-center mb-6">
        <span class="text-gray-500 line-through text-2xl block mb-2">De: R$ 497</span>
        <span class="text-red-600 font-bold text-lg">⚡ 80% DE DESCONTO</span>
    </div>
    
    <!-- Preço Principal -->
    <div class="text-center mb-6">
        <span class="text-gray-700 text-xl mb-2 block">Por apenas:</span>
        <div class="flex items-baseline justify-center gap-2">
            <span class="text-gray-700 text-2xl">R$</span>
            <span class="text-6xl font-black text-gray-900">97</span>
        </div>
    </div>
    
    <!-- Parcelamento -->
    <div class="text-center mb-6">
        <span class="text-gray-600">ou em até</span>
        <div class="text-2xl font-bold text-gray-900 my-2">
            12x de R$ 9,70
        </div>
        <span class="text-sm text-gray-500">sem juros no cartão</span>
    </div>
    
    <!-- CTA Principal -->
    <button class="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-xl rounded-lg shadow-2xl transition-all duration-300 animate-pulse-urgency flex items-center justify-center gap-3">
        <i data-lucide="shopping-cart" class="w-6 h-6"></i>
        QUERO GARANTIR MINHA VAGA
    </button>
    
    <!-- Garantias -->
    <div class="flex items-center justify-center gap-4 mt-4 text-sm text-gray-600">
        <div class="flex items-center gap-1">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
            <span>Garantia 7 dias</span>
        </div>
        <div class="flex items-center gap-1">
            <i data-lucide="lock" class="w-4 h-4 text-emerald-600"></i>
            <span>Compra segura</span>
        </div>
    </div>
</div>
```

## infoproduto/social-proof-print

```html
<div class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-white font-bold text-lg">
            JK
        </div>
        <div>
            <h4 class="font-bold text-gray-900">João Kennedy</h4>
            <p class="text-sm text-gray-600">Cliente verificado ✓</p>
        </div>
    </div>
    
    <!-- Rating -->
    <div class="flex gap-1 mb-3">
        <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
        <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
    </div>
    
    <!-- Depoimento -->
    <p class="text-gray-700 italic leading-relaxed mb-4">
        "Comprei ontem e já comecei a aplicar. Os resultados apareceram no mesmo dia! Vale cada centavo."
    </p>
    
    <!-- Data -->
    <span class="text-xs text-gray-500">Há 2 dias</span>
</div>
```

## infoproduto/cta-pulsing

```html
<button class="group w-full py-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-2xl rounded-xl shadow-2xl transition-all duration-300 animate-pulse-urgency flex items-center justify-center gap-3">
    <i data-lucide="zap" class="w-8 h-8 group-hover:scale-110 transition-transform"></i>
    SIM! QUERO MINHA TRANSFORMAÇÃO AGORA
    <i data-lucide="arrow-right" class="w-8 h-8 group-hover:translate-x-2 transition-transform"></i>
</button>

<p class="text-center text-sm text-gray-600 mt-4">
    🔒 Compra 100% segura • ✓ Acesso imediato após pagamento
</p>
```

## infoproduto/scarcity-banner

```html
<div class="bg-red-600 text-white py-4 px-6 text-center">
    <div class="flex items-center justify-center gap-3 flex-wrap">
        <i data-lucide="alert-circle" class="w-6 h-6"></i>
        <span class="font-bold text-lg">⚠️ ÚLTIMAS VAGAS!</span>
        <span>Apenas <strong class="text-2xl">23 vagas</strong> restantes neste preço</span>
        <i data-lucide="users" class="w-6 h-6"></i>
    </div>
</div>
```

## infoproduto/for-who-card

```html
<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500 transition-all duration-300 text-center">
    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
        <i data-lucide="store" class="w-8 h-8 text-white"></i>
    </div>
    <h3 class="font-bold text-gray-900 text-lg">
        Loja Online
    </h3>
</div>
```

## infoproduto/mockup-showcase

```html
<div class="relative max-w-4xl mx-auto">
    <!-- Mockup Container com Glow -->
    <div class="relative z-10 bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl border border-gray-200">
        <!-- Placeholder para Screenshot/Mockup -->
        <div class="aspect-video bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
            <div class="text-center">
                <i data-lucide="file-text" class="w-24 h-24 text-orange-600 mx-auto mb-4"></i>
                <p class="text-2xl font-bold text-gray-700">Preview do [Produto]</p>
            </div>
        </div>
    </div>
    
    <!-- Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 opacity-20 blur-3xl"></div>
</div>
```

---

## buttons/primary-dark-bg (MANTIDO)

```html
<button class="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
    Começar Agora
    <i data-lucide="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
</button>
```

## cards/feature-card (MANTIDO)

```html
<!-- [CÓDIGO COMPLETO MANTIDO DO v1.0] -->
```

## cards/pricing-card (MANTIDO)

```html
<!-- [CÓDIGO COMPLETO MANTIDO DO v1.0] -->
```

## cards/testimonial-card (MANTIDO)

```html
<!-- [CÓDIGO COMPLETO MANTIDO DO v1.0] -->
```

## cards/stats-card (MANTIDO)

```html
<!-- [CÓDIGO COMPLETO MANTIDO DO v1.0] -->
```

## navigation/navbar-sticky (MANTIDO)

```html
<!-- [CÓDIGO COMPLETO MANTIDO DO v1.0] -->
```

## footer/default-footer (MANTIDO)

```html
<!-- [CÓDIGO COMPLETO MANTIDO DO v1.0] -->
```

## footer/infoproduto-footer

```html
<footer class="bg-gray-900 text-gray-300 py-12 px-6">
    <div class="max-w-4xl mx-auto text-center">
        <!-- Nome do Produto -->
        <h3 class="text-2xl font-bold text-white mb-6">[Nome do Produto]</h3>
        
        <!-- Contato -->
        <div class="mb-8">
            <p class="text-gray-400 mb-2">Suporte e Atendimento:</p>
            <a href="mailto:contato@exemplo.com" class="text-orange-400 hover:text-orange-300 font-semibold">
                contato@exemplo.com
            </a>
            <p class="text-sm text-gray-500 mt-2">
                Horário: Segunda a Sexta, 9h às 18h
            </p>
        </div>
        
        <!-- Links de Política -->
        <div class="flex justify-center gap-6 text-sm mb-8">
            <a href="#" class="text-gray-400 hover:text-white transition">Termos de Uso</a>
            <a href="#" class="text-gray-400 hover:text-white transition">Política de Privacidade</a>
            <a href="#" class="text-gray-400 hover:text-white transition">Política de Reembolso</a>
        </div>
        
        <!-- Copyright -->
        <p class="text-sm text-gray-500">
            © 2025 [Nome do Produto]. Todos os direitos reservados.
        </p>
    </div>
</footer>
```

---

# 📄 TEMPLATES/

## hero/infoproduto-slt

```html
<section class="relative overflow-hidden bg-slate-950 pt-32 pb-20 px-6">
    <!-- Blur Circles - LARANJA + VERMELHO -->
    <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/25 rounded-full blur-3xl animate-pulse-glow"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse-glow" style="animation-delay: 1.5s;"></div>
        <div class="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl animate-pulse-glow" style="animation-delay: 3s;"></div>
    </div>
    
    <!-- Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/80"></div>

    <!-- Content -->
    <div class="relative z-10 max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- Esquerda: Copy -->
            <div>
                <!-- Headline -->
                <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
                    [DOR/DESEJO] + <span class="text-orange-400">[SOLUÇÃO]</span>
                </h1>

                <!-- Subheadline -->
                <p class="text-xl sm:text-2xl text-gray-200 leading-relaxed mb-8">
                    Copy persuasiva falando sobre o produto e a solução que ele oferece. Gere identificação e exclusividade.
                </p>

                <!-- CTA com gancho -->
                <button class="group px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-xl rounded-lg shadow-2xl transition-all duration-300 animate-pulse-urgency flex items-center justify-center gap-3 mb-6">
                    <i data-lucide="zap" class="w-6 h-6"></i>
                    QUERO MINHA TRANSFORMAÇÃO AGORA
                    <i data-lucide="arrow-right" class="w-6 h-6 group-hover:translate-x-2 transition-transform"></i>
                </button>

                <!-- Social Proof Rápido -->
                <div class="flex items-center gap-4 text-sm text-gray-300">
                    <div class="flex gap-1">
                        <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
                    </div>
                    <span class="font-semibold">+3.482 pessoas já transformaram suas vidas</span>
                </div>
            </div>

            <!-- Direita: Mockup -->
            <div class="relative">
                <div class="relative z-10 bg-white p-4 rounded-2xl shadow-2xl">
                    <div class="aspect-[3/4] bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                        <i data-lucide="file-text" class="w-32 h-32 text-orange-600"></i>
                    </div>
                </div>
                <div class="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 opacity-30 blur-3xl"></div>
            </div>
        </div>
    </div>
</section>
```

## benefits/cards-6-benefits-3-objections

```html
<section class="py-20 px-6 bg-white">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
            <h2 class="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
                [Produto] É a Solução Garantida Para...
            </h2>
        </div>

        <!-- Grid: 6 Desejos + 3 Objeções -->
        <div class="grid md:grid-cols-3 gap-6">
            <!-- Benefício/Desejo 1 -->
            <div class="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl border-2 border-orange-200 hover:border-orange-500 transition-all duration-300 hover:translate-y-[-4px] shadow-md hover:shadow-xl">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center mb-4">
                    <i data-lucide="trending-up" class="w-6 h-6 text-white"></i>
                </div>
                <h3 class="font-bold text-gray-900 text-lg mb-2">Desejo Principal #1</h3>
                <p class="text-gray-700">Benefício específico que atende esse desejo</p>
            </div>

            <!-- Repetir para mais 5 desejos -->
            <!-- ... -->

            <!-- Quebra de Objeção 1 -->
            <div class="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border-2 border-emerald-200 hover:border-emerald-500 transition-all duration-300 hover:translate-y-[-4px] shadow-md hover:shadow-xl">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center mb-4">
                    <i data-lucide="shield-check" class="w-6 h-6 text-white"></i>
                </div>
                <h3 class="font-bold text-gray-900 text-lg mb-2">Sem [Objeção]</h3>
                <p class="text-gray-700">Quebra da objeção principal</p>
            </div>

            <!-- Repetir para mais 2 objeções -->
            <!-- ... -->
        </div>
    </div>
</section>
```

## proof/video-showcase

```html
<section class="py-20 px-6 bg-slate-50">
    <div class="max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- Esquerda: Vídeo/Imagens -->
            <div class="relative">
                <!-- Video Player (placeholder) -->
                <div class="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                    <div class="aspect-video flex items-center justify-center">
                        <div class="text-center">
                            <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-600 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                <i data-lucide="play" class="w-10 h-10 text-white"></i>
                            </div>
                            <p class="text-white font-bold">Veja o [Produto] por dentro</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Direita: Funcionalidades Técnicas -->
            <div>
                <h2 class="text-4xl font-black text-gray-900 mb-8">
                    Como o [Produto] Te Ajuda
                </h2>
                
                <ul class="space-y-4 mb-6">
                    <li class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <i data-lucide="check" class="w-5 h-5 text-white"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-900 mb-1">Funcionalidade Técnica 1</h4>
                            <p class="text-gray-700">Descrição de como funciona tecnicamente</p>
                        </div>
                    </li>
                    <!-- Repetir para mais 4-5 funcionalidades -->
                </ul>

                <!-- Copy de Identificação -->
                <p class="text-gray-700 leading-relaxed italic">
                    "Copy persuasiva gerando identificação e criando senso de exclusividade."
                </p>
            </div>
        </div>
    </div>
</section>
```

## for-who/grid-cards

```html
<section class="py-20 px-6 bg-white">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
            <h2 class="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
                Para Quem É o [Produto]?
            </h2>
        </div>

        <!-- Grid 3x2 -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <!-- Card 1 -->
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500 transition-all duration-300 text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                    <i data-lucide="store" class="w-8 h-8 text-white"></i>
                </div>
                <h3 class="font-bold text-gray-900">Loja Online</h3>
            </div>

            <!-- Repetir para mais 5 públicos -->
            <!-- Exemplos: Salão de Beleza, Lanchonete, Freelancer, etc. -->
        </div>
    </div>
</section>
```

## offer/complete-bundle

```html
<section class="py-20 px-6 bg-slate-50">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
            <h2 class="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                O Que Você Recebe Comprando Hoje
            </h2>
            <p class="text-xl text-gray-600">Plano Master - Tudo que você precisa para [transformação]</p>
        </div>

        <!-- Bundle Cards -->
        <div class="space-y-6">
            <!-- Produto Principal -->
            <div class="bg-white p-8 rounded-xl border-2 border-orange-500 shadow-lg">
                <div class="flex items-start gap-6">
                    <div class="relative flex-shrink-0">
                        <div class="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
                            <i data-lucide="file-text" class="w-10 h-10 text-white"></i>
                        </div>
                        <div class="absolute inset-0 rounded-xl bg-orange-400 opacity-30 blur-lg animate-pulse-glow"></div>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold text-gray-900 mb-2">[Nome do Produto Principal]</h3>
                        <p class="text-gray-700 mb-4 leading-relaxed">
                            Descrição completa do produto principal e todos os benefícios que ele oferece.
                        </p>
                        <div class="flex items-center gap-3">
                            <span class="text-gray-500 line-through text-xl">De: R$ 497</span>
                            <span class="text-3xl font-black text-orange-600">Incluído</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bônus 1 -->
            <div class="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-md">
                <div class="flex items-start gap-6">
                    <div class="flex-shrink-0">
                        <div class="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                            <i data-lucide="gift" class="w-10 h-10 text-white"></i>
                        </div>
                    </div>
                    <div class="flex-1">
                        <span class="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                            BÔNUS #1
                        </span>
                        <h3 class="text-2xl font-bold text-gray-900 mb-2">[Nome do Bônus 1]</h3>
                        <p class="text-gray-700 mb-4 leading-relaxed">
                            Descrição do bônus e como ele complementa o produto principal.
                        </p>
                        <div class="flex items-center gap-3">
                            <span class="text-gray-500 line-through text-xl">De: R$ 197</span>
                            <span class="text-2xl font-black text-amber-600">GRÁTIS</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bônus 2, 3, etc. (repetir estrutura) -->
        </div>

        <!-- Valor Total -->
        <div class="mt-12 bg-gradient-to-br from-gray-900 to-slate-900 p-8 rounded-xl text-white text-center">
            <p class="text-xl mb-2">Valor Total dos Bônus:</p>
            <p class="text-4xl font-black line-through text-gray-400 mb-4">R$ 1.491</p>
            <p class="text-2xl mb-2">Você paga apenas:</p>
            <p class="text-6xl font-black text-orange-400">R$ 97</p>
            <p class="text-xl text-gray-300 mt-4">ou 12x de R$ 9,70 sem juros</p>
        </div>
    </div>
</section>
```

## social-proof/testimonial-prints

```html
<section class="py-20 px-6 bg-white">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
            <h2 class="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
                Veja O Que Nossos Clientes Estão Dizendo
            </h2>
            <p class="text-xl text-gray-600">Resultados reais de pessoas reais</p>
        </div>

        <!-- Grid de Depoimentos -->
        <div class="grid md:grid-cols-3 gap-6">
            <!-- Depoimento 1 (print estilo) -->
            <div class="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-md border border-gray-200">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-white font-bold">
                        MC
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900">Maria Clara</h4>
                        <p class="text-xs text-gray-600">Cliente verificado ✓</p>
                    </div>
                </div>
                <div class="flex gap-1 mb-3">
                    <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400"></i>
                </div>
                <p class="text-gray-700 italic leading-relaxed">
                    "Comprei ontem e já vi resultados! Valeu cada centavo."
                </p>
                <span class="text-xs text-gray-500 mt-3 block">Há 2 dias</span>
            </div>

            <!-- Repetir para 6-9 depoimentos -->
        </div>
    </div>
</section>
```

## pricing/comparison-offer

```html
<section class="py-20 px-6 bg-slate-50">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
            <h2 class="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                Tenha [Benefício] Hoje Por Menos Que Um Café
            </h2>
            <p class="text-xl text-gray-600">Você receberá tudo direto no seu e-mail após a compra</p>
        </div>

        <!-- Comparação -->
        <div class="grid md:grid-cols-2 gap-8">
            <!-- Oferta Completa (Destaque) -->
            <div class="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border-4 border-orange-500 shadow-2xl relative">
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span class="bg-orange-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                        MAIS VENDIDO
                    </span>
                </div>
                
                <h3 class="text-3xl font-black text-gray-900 mb-4 text-center mt-4">Oferta Completa</h3>
                
                <ul class="space-y-3 mb-8">
                    <li class="flex items-start gap-3">
                        <i data-lucide="check" class="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0"></i>
                        <span class="text-gray-800">Produto Principal</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <i data-lucide="check" class="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0"></i>
                        <span class="text-gray-800">Bônus #1</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <i data-lucide="check" class="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0"></i>
                        <span class="text-gray-800">Bônus #2</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <i data-lucide="check" class="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0"></i>
                        <span class="text-gray-800">Suporte VIP</span>
                    </li>
                </ul>
                
                <div class="text-center mb-6">
                    <span class="text-gray-500 line-through text-2xl block">R$ 497</span>
                    <span class="text-6xl font-black text-gray-900 block">R$ 97</span>
                    <span class="text-lg text-gray-600">ou 12x de R$ 9,70</span>
                </div>
                
                <button class="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-xl rounded-lg shadow-2xl transition-all duration-300 animate-pulse-urgency">
                    GARANTIR AGORA
                </button>
            </div>

            <!-- Oferta Básica -->
            <div class="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-lg">
                <h3 class="text-3xl font-black text-gray-900 mb-4 text-center">Oferta Básica</h3>
                
                <ul class="space-y-3 mb-8">
                    <li class="flex items-start gap-3">
                        <i data-lucide="check" class="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0"></i>
                        <span class="text-gray-800">Produto Principal</span>
                    </li>
                    <li class="flex items-start gap-3 opacity-40">
                        <i data-lucide="x" class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"></i>
                        <span class="text-gray-600 line-through">Bônus #1</span>
                    </li>
                    <li class="flex items-start gap-3 opacity-40">
                        <i data-lucide="x" class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"></i>
                        <span class="text-gray-600 line-through">Bônus #2</span>
                    </li>
                    <li class="flex items-start gap-3 opacity-40">
                        <i data-lucide="x" class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"></i>
                        <span class="text-gray-600 line-through">Suporte VIP</span>
                    </li>
                </ul>
                
                <div class="text-center mb-6">
                    <span class="text-5xl font-black text-gray-900 block">R$ 67</span>
                    <span class="text-lg text-gray-600">ou 10x de R$ 6,70</span>
                </div>
                
                <button class="w-full py-5 border-2 border-gray-300 text-gray-900 hover:bg-gray-50 font-bold text-lg rounded-lg transition-all duration-300">
                    Escolher Básico
                </button>
            </div>
        </div>
    </div>
</section>
```

## guarantee/7-days-badge

```html
<section class="py-20 px-6 bg-white">
    <div class="max-w-4xl mx-auto">
        <div class="bg-gradient-to-br from-emerald-50 to-white p-12 rounded-2xl border-2 border-emerald-500 shadow-xl text-center">
            <!-- Selo -->
            <div class="flex justify-center mb-8">
                <div class="relative">
                    <div class="w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                        <div class="text-center">
                            <i data-lucide="shield-check" class="w-12 h-12 text-white mx-auto mb-1"></i>
                            <span class="text-white font-black text-xs">GARANTIA</span>
                            <span class="text-white font-black text-2xl block">7 DIAS</span>
                        </div>
                    </div>
                    <div class="absolute inset-0 rounded-full bg-emerald-400 opacity-30 blur-xl animate-pulse-glow"></div>
                </div>
            </div>

            <!-- Texto -->
            <h2 class="text-4xl font-black text-gray-900 mb-6">
                100% Garantido ou Seu Dinheiro de Volta
            </h2>
            <p class="text-xl text-gray-700 leading-relaxed mb-8">
                Você tem <strong>7 dias completos</strong> para testar o [Produto]. Se não gostar por QUALQUER motivo, basta enviar um email e devolvemos <strong>100% do seu investimento</strong>. Sem perguntas, sem burocracia, sem complicação.
            </p>
            <p class="text-lg text-gray-600 italic">
                O risco é TODO NOSSO. Você só tem a ganhar!
            </p>
        </div>
    </div>
</section>
```

## urgency/final-cta

```html
<section class="relative overflow-hidden bg-slate-950 py-20 px-6">
    <!-- Blur Effects -->
    <div class="absolute inset-0">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/25 rounded-full blur-3xl animate-pulse-glow"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse-glow" style="animation-delay: 1.5s;"></div>
    </div>
    
    <!-- Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/80"></div>
    
    <!-- Content -->
    <div class="relative z-10 max-w-4xl mx-auto text-center">
        <!-- Urgency Copy -->
        <h2 class="text-4xl sm:text-5xl font-black text-white mb-8 leading-tight">
            Não Perca Mais Essa Oportunidade de <span class="text-orange-400">[Transformação Desejada]</span>
        </h2>
        
        <p class="text-2xl text-gray-200 mb-12 leading-relaxed">
            As <strong class="text-red-400">[dores atuais]</strong> precisam ficar no passado e o <strong class="text-orange-400">[Produto]</strong> te ajudará com isso.
        </p>

        <!-- CTA Pulsing -->
        <button class="group mx-auto px-12 py-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-2xl rounded-xl shadow-2xl transition-all duration-300 animate-pulse-urgency flex items-center justify-center gap-4">
            <i data-lucide="zap" class="w-8 h-8"></i>
            QUERO MINHA [TRANSFORMAÇÃO] AGORA!
            <i data-lucide="arrow-right" class="w-8 h-8 group-hover:translate-x-2 transition-transform"></i>
        </button>

        <!-- Micro Garantias -->
        <div class="flex items-center justify-center gap-6 mt-8 text-sm text-gray-300">
            <div class="flex items-center gap-2">
                <i data-lucide="shield-check" class="w-5 h-5 text-emerald-400"></i>
                <span>Garantia 7 dias</span>
            </div>
            <div class="flex items-center gap-2">
                <i data-lucide="lock" class="w-5 h-5 text-emerald-400"></i>
                <span>Compra 100% segura</span>
            </div>
            <div class="flex items-center gap-2">
                <i data-lucide="mail" class="w-5 h-5 text-emerald-400"></i>
                <span>Acesso imediato</span>
            </div>
        </div>
    </div>
</section>
```

## faq/objections-desires

```html
<section class="py-20 px-6 bg-slate-50">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
            <h2 class="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
                Perguntas Frequentes
            </h2>
            <p class="text-xl text-gray-600">Tire todas as suas dúvidas</p>
        </div>

        <!-- FAQ Items (Accordion style) -->
        <div class="space-y-4">
            <!-- FAQ 1 - Objeção Principal -->
            <details class="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <summary class="flex items-center justify-between cursor-pointer">
                    <h3 class="font-bold text-gray-900 text-lg">❓ [Objeção Principal convertida em pergunta]</h3>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform"></i>
                </summary>
                <div class="mt-4 pt-4 border-t border-gray-100">
                    <p class="text-gray-700 leading-relaxed">
                        Resposta quebrando a objeção e gerando desejo. [Copy persuasiva]
                    </p>
                </div>
            </details>

            <!-- FAQ 2 - Gatilho de Desejo -->
            <details class="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <summary class="flex items-center justify-between cursor-pointer">
                    <h3 class="font-bold text-gray-900 text-lg">💎 [Pergunta que gera desejo]</h3>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform"></i>
                </summary>
                <div class="mt-4 pt-4 border-t border-gray-100">
                    <p class="text-gray-700 leading-relaxed">
                        Resposta gerando ainda mais desejo pelo produto. [Copy persuasiva]
                    </p>
                </div>
            </details>

            <!-- Repetir para 6-8 FAQs alternando objeções e gatilhos -->
        </div>
    </div>
</section>
```

## creator/about-section

```html
<section class="py-20 px-6 bg-white">
    <div class="max-w-4xl mx-auto">
        <div class="flex flex-col md:flex-row gap-12 items-center">
            <!-- Foto -->
            <div class="flex-shrink-0">
                <div class="w-48 h-48 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-2xl border-4 border-white text-white text-6xl font-black">
                    JD
                </div>
            </div>

            <!-- Sobre -->
            <div>
                <h2 class="text-4xl font-black text-gray-900 mb-4">
                    Sobre o Criador
                </h2>
                <h3 class="text-2xl font-bold text-gray-700 mb-6">
                    [Nome do Criador]
                </h3>
                <p class="text-gray-700 leading-relaxed mb-4">
                    [História de origem, jornada, experiência. Como chegou onde está e por que criou o produto.]
                </p>
                <p class="text-gray-700 leading-relaxed mb-4">
                    [Credenciais, resultados, autoridade no assunto.]
                </p>
                <p class="text-gray-700 leading-relaxed font-semibold">
                    "[Frase de impacto ou missão do criador]"
                </p>
            </div>
        </div>
    </div>
</section>
```

---

## TEMPLATES/upsell/

### upsell/hero-special-offer

```html
<section class="relative overflow-hidden bg-slate-950 py-20 px-6">
    <div class="absolute inset-0">
        <div class="absolute w-96 h-96 bg-orange-600/25 blur-3xl animate-pulse-glow"></div>
    </div>
    <div class="absolute inset-0 bg-gradient-to-br from-slate-950/80 to-slate-900/80"></div>
    
    <div class="relative z-10 max-w-4xl mx-auto text-center">
        <h1 class="text-5xl sm:text-6xl font-black text-white mb-6">
            ⏰ ESPERE! Oferta Especial Por Tempo Limitado
        </h1>
        <p class="text-2xl text-gray-200 mb-8">
            Antes de continuar, veja esta oportunidade única de maximizar seus resultados
        </p>
    </div>
</section>
```

### upsell/comparison-with-without

```html
<section class="py-20 px-6 bg-white">
    <div class="max-w-5xl mx-auto">
        <div class="grid md:grid-cols-2 gap-8">
            <!-- SEM Upsell -->
            <div class="bg-gray-100 p-8 rounded-xl">
                <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Sem o [Upsell]</h3>
                <ul class="space-y-3">
                    <li class="flex items-start gap-3">
                        <i data-lucide="x" class="w-5 h-5 text-red-600 mt-1"></i>
                        <span class="text-gray-700">Limitação/Problema 1</span>
                    </li>
                    <!-- Mais limitações -->
                </ul>
            </div>

            <!-- COM Upsell -->
            <div class="bg-gradient-to-br from-orange-50 to-white p-8 rounded-xl border-2 border-orange-500">
                <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Com o [Upsell]</h3>
                <ul class="space-y-3">
                    <li class="flex items-start gap-3">
                        <i data-lucide="check" class="w-5 h-5 text-emerald-600 mt-1"></i>
                        <span class="text-gray-900 font-semibold">Benefício/Solução 1</span>
                    </li>
                    <!-- Mais benefícios -->
                </ul>
            </div>
        </div>
    </div>
</section>
```

---

## TEMPLATES/downsell/

### downsell/hero-empathetic

```html
<section class="py-20 px-6 bg-slate-50">
    <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
            Entendo Sua Situação... 💙
        </h1>
        <p class="text-xl text-gray-700 leading-relaxed mb-8">
            Sei que o investimento pode parecer alto agora. Por isso, preparei uma alternativa especial para você ainda conseguir [benefício principal] por um valor mais acessível.
        </p>
    </div>
</section>
```

### downsell/alternative-offer

```html
<section class="py-20 px-6 bg-white">
    <div class="max-w-3xl mx-auto">
        <div class="bg-gradient-to-br from-blue-50 to-white p-10 rounded-2xl border-2 border-blue-500 shadow-xl text-center">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Oferta Alternativa Especial</h2>
            
            <div class="mb-8">
                <span class="text-5xl font-black text-gray-900">R$ 47</span>
                <span class="text-xl text-gray-600 block mt-2">ou 6x de R$ 7,83</span>
            </div>

            <p class="text-lg text-gray-700 mb-8">
                Versão simplificada com o essencial para você começar sua transformação hoje mesmo.
            </p>

            <button class="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xl rounded-lg">
                ACEITAR OFERTA ESPECIAL
            </button>
        </div>
    </div>
</section>
```

---

# 🎬 ANIMATIONS/

## pulse-glow (MANTIDO)

```css
@keyframes pulse-glow {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.4; }
}
.animate-pulse-glow {
    animation: pulse-glow 3s ease-in-out infinite;
}
```

## float (MANTIDO)

```css
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}
.animate-float {
    animation: float 3s ease-in-out infinite;
}
```

## scale-pulse (MANTIDO)

```css
@keyframes scale-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
.animate-scale-pulse {
    animation: scale-pulse 2s ease-in-out infinite;
}
```

## rotate-slow (MANTIDO)

```css
@keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.animate-rotate-slow {
    animation: rotate-slow 20s linear infinite;
}
```

## pulse-urgency (NOVO - Infoproduto)

```css
@keyframes pulse-urgency {
    0%, 100% { 
        transform: scale(1); 
        box-shadow: 0 4px 20px rgba(255, 107, 0, 0.4); 
    }
    50% { 
        transform: scale(1.03); 
        box-shadow: 0 8px 30px rgba(255, 107, 0, 0.6); 
    }
}
.animate-pulse-urgency {
    animation: pulse-urgency 1.5s ease-in-out infinite;
}
```

**Uso:** CTAs de urgência em infoprodutos

---

# 🔍 ÍNDICE DE BUSCA RÁPIDA

## Por Tipo de Página:

### INFOPRODUTO (Estrutura SLT - 12 Seções):
```
1. TEMPLATES/hero/infoproduto-slt
2. TEMPLATES/benefits/cards-6-benefits-3-objections
3. TEMPLATES/proof/video-showcase
4. TEMPLATES/for-who/grid-cards
5. TEMPLATES/offer/complete-bundle
6. TEMPLATES/social-proof/testimonial-prints
7. TEMPLATES/pricing/comparison-offer
8. TEMPLATES/guarantee/7-days-badge
9. TEMPLATES/urgency/final-cta
10. TEMPLATES/faq/objections-desires
11. TEMPLATES/creator/about-section
12. COMPONENTS/footer/infoproduto-footer
```

### SISTEMA/SaaS (Estrutura Standard):
```
COMPONENTS/navigation/navbar-sticky
TEMPLATES/hero/dark-background (ou light)
TEMPLATES/stats/4-columns
TEMPLATES/features/grid-3-columns
TEMPLATES/pricing/3-tier-cards
TEMPLATES/social-proof/testimonial-prints
TEMPLATES/cta/centered-dark-bg
COMPONENTS/footer/default-footer
```

### UPSELL:
```
TEMPLATES/upsell/hero-special-offer
TEMPLATES/upsell/comparison-with-without
TEMPLATES/offer/complete-bundle (adaptado)
```

### DOWNSELL:
```
TEMPLATES/downsell/hero-empathetic
TEMPLATES/downsell/alternative-offer
```

## Por Contexto/Paleta:

### Infoproduto:
- PALETTES/infoproduto/high-conversion (laranja + vermelho)
- PALETTES/infoproduto/trust-blue (azul + verde)

### Sistema:
- PALETTES/fintech/trust-green
- PALETTES/tech/tech-blue
- PALETTES/health/fresh-teal
- [todas as outras mantidas]

---

**DesignGO Database v2.0** - Infoprodutos + Sistemas + Upsell/Downsell! 🎨✨
