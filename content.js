// === SYNTAX AI v4.0 — Material Design 3 + Adaptive Theming ===

let injectionTimeout = null;

// ── 1. Load Roboto from Google Fonts ────────────────────────────────────────
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
document.head.appendChild(fontLink);

// ── 2. Brand + Surface Tokens ───────────────────────────────────────────────
const BRAND = {
    primary:    '#1CE8A0',  // Electric jade — unique brand colour
    primaryDim: '#00C87A',  // Deeper jade for hover
    onPrimary:  '#00311E',  // Dark text on primary
    error:      '#F28B82',
    success:    '#81C995',
    noChange:   '#8AB4F8',
};

const SURFACE = {
    dark: {
        bg:          'rgba(20, 20, 26, 0.90)',
        card:        'rgba(30, 32, 40, 0.97)',
        onBg:        'rgba(230, 232, 235, 0.92)',
        muted:       'rgba(180, 185, 200, 0.55)',
        inputBg:     'rgba(255, 255, 255, 0.06)',
        inputBorder: 'rgba(255, 255, 255, 0.14)',
        outline:     'rgba(28, 232, 160, 0.28)',
        divider:     'rgba(255, 255, 255, 0.08)',
    },
    light: {
        bg:          'rgba(255, 255, 255, 0.92)',
        card:        'rgba(246, 250, 248, 0.98)',
        onBg:        'rgba(15, 20, 18, 0.90)',
        muted:       'rgba(60, 70, 65, 0.55)',
        inputBg:     'rgba(0, 0, 0, 0.04)',
        inputBorder: 'rgba(0, 0, 0, 0.16)',
        outline:     'rgba(0, 180, 120, 0.32)',
        divider:     'rgba(0, 0, 0, 0.07)',
    },
};

// ── 3. SVG Icons ─────────────────────────────────────────────────────────────
const ICONS = {
    main:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    fail:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    spark:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/></svg>`,
    info:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
    gear:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
};

// ── 3b. Key-prefix detection (mirrors options.js logic) ──────────────────────
const SAI_PREFIX_MAP = [
    ['sk-ant-',   'anthropic'],
    ['sk-or-',    'openrouter'],
    ['sk-proj-',  'openai'],
    ['AIza',      'gemini'],
    ['gsk_',      'groq'],
    ['pplx-',     'perplexity-api'],
    ['xai-',      'xai'],
    ['sk-',       'openai'],
];
const SAI_PROVIDER_NAMES = {
    gemini: 'Google Gemini', openai: 'OpenAI', anthropic: 'Anthropic (CORS!)',
    groq: 'Groq', openrouter: 'OpenRouter', xai: 'xAI / Grok',
    deepseek: 'DeepSeek', mistral: 'Mistral', 'perplexity-api': 'Perplexity API',
};
function detectKeyProvider(key) {
    key = (key || '').trim();
    for (const [prefix, id] of SAI_PREFIX_MAP) {
        if (key.startsWith(prefix)) return id;
    }
    return null;
}

// ── 4. Theme Detection ────────────────────────────────────────────────────────
function detectTheme() {
    const els = [document.body, document.documentElement];
    for (const el of els) {
        const bg = window.getComputedStyle(el).backgroundColor;
        const rgb = bg.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
            const lum = (0.299 * +rgb[0] + 0.587 * +rgb[1] + 0.114 * +rgb[2]) / 255;
            if (lum < 0.45) return 'dark';
            if (lum > 0.65) return 'light';
        }
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function buildVars(theme) {
    const s = SURFACE[theme];
    return [
        `--sai-primary: ${BRAND.primary}`,
        `--sai-primary-dim: ${BRAND.primaryDim}`,
        `--sai-on-primary: ${BRAND.onPrimary}`,
        `--sai-error: ${BRAND.error}`,
        `--sai-success: ${BRAND.success}`,
        `--sai-no-change: ${BRAND.noChange}`,
        `--sai-bg: ${s.bg}`,
        `--sai-card: ${s.card}`,
        `--sai-on-bg: ${s.onBg}`,
        `--sai-muted: ${s.muted}`,
        `--sai-input-bg: ${s.inputBg}`,
        `--sai-input-border: ${s.inputBorder}`,
        `--sai-outline: ${s.outline}`,
        `--sai-divider: ${s.divider}`,
    ].join(';');
}

// ── 5. Inject CSS ─────────────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
/* ── Outer host row ── */
.sai-host {
    display: flex;
    justify-content: flex-end;
    padding: 6px 14px 10px;
    margin: 0 auto;
    max-width: 48rem;
    font-family: 'Roboto', system-ui, -apple-system, sans-serif;
}

/* ── Perplexity override: button appears below the search box ── */
.sai-host--perplexity {
    justify-content: flex-end;
    padding: 8px 0 0;
    margin: 0 auto;
    max-width: 100%;   /* inherit the search box width from its parent */
    width: 100%;
    box-sizing: border-box;
}

/* ── Relative container ── */
.sai-container { position: relative; display: inline-flex; align-items: center; }

/* ── Main chip button group (M3 tonal chip) ── */
.sai-btn-group {
    display: inline-flex;
    align-items: center;
    height: 36px;
    border-radius: 100px;
    border: 1.5px solid var(--sai-outline);
    background: var(--sai-bg);
    color: var(--sai-primary);
    font-family: inherit;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 1px 4px rgba(0,0,0,0.14), 0 0 0 0 var(--sai-outline);
    transition: background 0.2s, box-shadow 0.25s, border-color 0.2s, transform 0.18s;
    position: relative;
    overflow: hidden;
    user-select: none;
    white-space: nowrap;
}
.sai-btn-group:not(.disabled):hover {
    background: var(--sai-card);
    border-color: var(--sai-primary);
    box-shadow: 0 2px 10px rgba(0,0,0,0.18), 0 0 0 3px var(--sai-outline);
    transform: translateY(-2px);
}
.sai-btn-group:not(.disabled):active { transform: translateY(0); }
.sai-btn-group.disabled { opacity: 0.65; cursor: wait; }

.sai-btn-main {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 0 12px 0 14px;
    height: 100%;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.015em;
    position: relative;
    overflow: hidden;
}
.sai-btn-main:disabled { cursor: wait; }

.sai-btn-divider {
    width: 1px;
    height: 16px;
    background: var(--sai-divider);
    flex-shrink: 0;
}

.sai-btn-settings {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    height: 100%;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.sai-btn-settings:disabled { cursor: wait; }

/* Ripple */
.sai-ripple {
    position: absolute;
    border-radius: 50%;
    width: 120px; height: 120px;
    transform: scale(0);
    opacity: 1;
    background: radial-gradient(circle, rgba(28,232,160,0.25) 0%, transparent 70%);
    animation: sai-ripple 0.55s cubic-bezier(0,0,0.2,1) forwards;
    pointer-events: none;
}
@keyframes sai-ripple { to { transform: scale(3); opacity: 0; } }

/* ── State colours ── */
@keyframes sai-pulse {
    0%,100% { box-shadow: 0 0 0 0 var(--sai-outline); }
    50%      { box-shadow: 0 0 0 5px var(--sai-outline); }
}
.sai-btn-group.loading { animation: sai-pulse 1.3s ease-in-out infinite; }
.sai-btn-group.success { color: var(--sai-success)!important; border-color: var(--sai-success)!important; animation: none; }
.sai-btn-group.fail    { color: var(--sai-error)!important;   border-color: var(--sai-error)!important;   animation: none; }
.sai-btn-group.no-change { color: var(--sai-no-change)!important; border-color: var(--sai-no-change)!important; animation: none; }

/* ── Popup card (M3 elevated surface) ── */
.sai-popup {
    position: absolute;
    bottom: calc(100% + 12px);
    right: 0;
    width: 300px;
    background: var(--sai-card);
    border: 1px solid var(--sai-divider);
    border-radius: 20px;
    padding: 18px 18px 16px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12);
    z-index: 99999;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px) scale(0.96);
    transform-origin: bottom right;
    transition: opacity 0.22s cubic-bezier(0.4,0,0.2,1),
                transform 0.22s cubic-bezier(0.4,0,0.2,1),
                visibility 0.22s;
    pointer-events: none;
}
.sai-popup.visible {
    opacity: 1; visibility: visible;
    transform: translateY(0) scale(1);
    pointer-events: all;
}

/* Popup header */
.sai-popup-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    color: var(--sai-primary);
}
.sai-popup-head span {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}
.sai-popup-sub {
    font-size: 11.5px;
    color: var(--sai-muted);
    margin-bottom: 14px;
    line-height: 1.4;
}

/* M3 text field */
.sai-field {
    position: relative;
    margin-bottom: 14px;
}
.sai-field-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: var(--sai-muted);
    letter-spacing: 0.04em;
    margin-bottom: 5px;
    text-transform: uppercase;
}
.sai-field input {
    width: 100%;
    box-sizing: border-box;
    background: var(--sai-input-bg);
    border: 1.5px solid var(--sai-input-border);
    border-radius: 10px;
    color: var(--sai-on-bg);
    padding: 9px 12px;
    font-family: inherit;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
}
.sai-field input::placeholder { color: var(--sai-muted); }
.sai-field input:focus {
    border-color: var(--sai-primary);
    box-shadow: 0 0 0 3px var(--sai-outline);
}

/* M3 filled button */
.sai-enhance-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--sai-primary) 0%, var(--sai-primary-dim) 100%);
    color: var(--sai-on-primary);
    border: none;
    border-radius: 100px;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
    box-shadow: 0 2px 8px rgba(28,232,160,0.35);
    transition: filter 0.15s, box-shadow 0.15s, transform 0.12s;
}
.sai-enhance-btn:hover {
    filter: brightness(1.08);
    box-shadow: 0 4px 18px rgba(28,232,160,0.45);
    transform: translateY(-1px);
}
.sai-enhance-btn:active { transform: translateY(0); filter: brightness(0.95); }
`;
document.head.appendChild(style);

// ── 6. Input selectors (ordered: most-specific first) ───────────────────────
const INPUT_SELECTORS = [
    // ChatGPT
    'textarea[data-id="root"]',
    // Quill-based editors
    '.ql-editor.textarea',
    // Claude / Notion / many modern editors (ProseMirror)
    'div.ProseMirror[contenteditable="true"]',
    // Perplexity & generic ARIA textboxes
    'div[role="textbox"][contenteditable="true"]',
    // Perplexity plain textarea (search bar)
    'textarea[placeholder]',
    // Generic fallback contenteditable
    'div[contenteditable="true"]',
];

function findTarget() {
    return INPUT_SELECTORS.map(s => document.querySelector(s)).find(Boolean) || null;
}

// ── 7. MutationObserver ───────────────────────────────────────────────────────
const observer = new MutationObserver(() => {
    // Guard: only skip if a sai-host is still attached to the live DOM
    if (document.body.contains(document.querySelector('.sai-host'))) return;

    const target = findTarget();
    if (target) {
        clearTimeout(injectionTimeout);
        // 500 ms — gives SPAs (Claude, Perplexity) time to finish rendering
        injectionTimeout = setTimeout(() => {
            // Re-check after delay; target may have been replaced by a new node
            const freshTarget = findTarget();
            if (!freshTarget) return;
            const result = findAnchor(freshTarget);
            if (result.anchor) injectUI(result, freshTarget);
        }, 500);
    }
});
observer.observe(document.body, { childList: true, subtree: true });

// ── 8. Find anchor ────────────────────────────────────────────────────────────
//
// Returns { anchor, position } where position is the insertAdjacentElement arg.
//
// Strategy per host:
//   ChatGPT    → closest <form>   — insert BEFORE it (above input area)
//   Claude     → walk up to a composer wrapper — insert BEFORE it
//   Gemini     → .input-area inside <main> — insert BEFORE it
//   Perplexity → walk UP past the rounded search box using rect comparison,
//                then insert AFTER it (button appears below the search box)
//   Fallback   → closest <form> / parentElement — insert BEFORE
//
function findAnchor(el) {
    const h = window.location.hostname;

    if (h.includes('chatgpt.com')) {
        return { anchor: el.closest('form') || el.parentElement, position: 'beforebegin' };
    }

    if (h.includes('claude.ai')) {
        const anchor =
            el.closest('[class*="composer"]') ||
            el.closest('[class*="InputArea"]') ||
            el.closest('fieldset') ||
            el.parentElement?.parentElement?.parentElement ||
            el.parentElement;
        return { anchor, position: 'beforebegin' };
    }

    if (h.includes('gemini.google.com')) {
        const anchor = document.querySelector('main .input-area') || el.closest('form') || el.parentElement;
        return { anchor, position: 'beforebegin' };
    }

    if (h.includes('perplexity.ai')) {
        // For Perplexity we use fixed positioning (see injectUI).
        // The anchor element doesn't matter; pass el itself as a reference.
        return { anchor: el, position: 'fixed' };
    }

    // Generic fallback
    const anchor = el.closest('form') || el.parentElement?.parentElement || el.parentElement;
    return { anchor, position: 'beforebegin' };
}

// ── 9. Inject UI ──────────────────────────────────────────────────────────────
function injectUI({ anchor, position }, targetEl) {
    const theme  = detectTheme();
    const isPerp = window.location.hostname.includes('perplexity.ai');

    const host = document.createElement('div');
    host.className = isPerp ? 'sai-host sai-host--perplexity' : 'sai-host';
    host.setAttribute('style', buildVars(theme));

    const container = document.createElement('div');
    container.className = 'sai-container';

    // Popup
    const popup = document.createElement('div');
    popup.className = 'sai-popup';
    const iconUrl = chrome.runtime.getURL('icons/icon128.png');
    popup.innerHTML = `
        <div class="sai-popup-head">
            <img src="${iconUrl}" alt="SYNTAX AI" width="18" height="18" style="border-radius:4px;object-fit:contain;">
            <span>Syntax AI</span>
        </div>
        <div class="sai-popup-sub">Enhance your prompt with AI-powered rewriting.</div>
        <div class="sai-field">
            <span class="sai-field-label">Optional hint</span>
            <input type="text" id="sai-hint" placeholder="e.g. make it more concise…" autocomplete="off">
        </div>
        <button class="sai-enhance-btn" id="sai-enhance-btn">${ICONS.spark} Enhance Prompt</button>
    `;

    // Chip button group (Split button)
    const btnGroup = document.createElement('div');
    btnGroup.className = 'sai-btn-group';
    btnGroup.id = 'sai-btn-group';

    const btnMain = document.createElement('button');
    btnMain.className = 'sai-btn-main';
    btnMain.id = 'sai-main-btn';
    btnMain.title = 'SYNTAX AI – enhance this prompt';
    btnMain.innerHTML = `${ICONS.main}<span>Enhance</span>`;

    const btnDivider = document.createElement('div');
    btnDivider.className = 'sai-btn-divider';

    const btnSettings = document.createElement('button');
    btnSettings.className = 'sai-btn-settings';
    btnSettings.id = 'sai-settings-btn';
    btnSettings.title = 'SYNTAX AI options';
    btnSettings.innerHTML = ICONS.gear;

    btnGroup.appendChild(btnMain);
    btnGroup.appendChild(btnDivider);
    btnGroup.appendChild(btnSettings);

    container.appendChild(popup);
    container.appendChild(btnGroup);
    host.appendChild(container);

    if (position === 'fixed') {
        // ── Perplexity: fixed-position strategy ──────────────────────────────
        // Attach to body and compute coordinates from the input element's rect.
        // This is immune to Perplexity's complex layered DOM structure.
        function positionHost() {
            const r = targetEl.getBoundingClientRect();
            // Place button at the bottom-right of the search box, 8px below
            host.style.top   = `${r.bottom + 8}px`;
            host.style.right = `${window.innerWidth - r.right}px`;
        }

        Object.assign(host.style, {
            position:  'fixed',
            zIndex:    '999999',
            padding:   '0',
            maxWidth:  'none',
            width:     'auto',
            margin:    '0',
        });
        document.body.appendChild(host);
        positionHost();

        window.addEventListener('scroll', positionHost, { passive: true });
        window.addEventListener('resize', positionHost, { passive: true });
    } else {
        // ── All other sites: DOM injection ───────────────────────────────────
        anchor.insertAdjacentElement(position, host);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    function addRipple(e, element) {
        const r = document.createElement('span');
        r.className = 'sai-ripple';
        const rect = element.getBoundingClientRect();
        r.style.left = `${e.clientX - rect.left - 60}px`;
        r.style.top  = `${e.clientY - rect.top  - 60}px`;
        element.appendChild(r);
        r.addEventListener('animationend', () => r.remove(), { once: true });
    }

    const reset = () => {
        btnGroup.classList.remove('disabled');
        btnMain.disabled = false;
        btnSettings.disabled = false;
        btnGroup.classList.remove('loading', 'success', 'fail', 'no-change');
        btnMain.innerHTML = `${ICONS.main}<span>Enhance</span>`;
        btnMain.title = '';
    };

    // ── Run the actual enhancement ─────────────────────────────────────────────
    function runEnhance(hint = '') {
        const prompt = targetEl.tagName === 'DIV' ? targetEl.textContent : targetEl.value;
        if (!prompt.trim() || btnMain.disabled) return;

        btnMain.disabled = true;
        btnSettings.disabled = true;
        btnGroup.classList.add('disabled');
        btnMain.innerHTML = `${ICONS.main}<span>Thinking…</span>`;
        btnGroup.classList.add('loading');
        popup.classList.remove('visible');

        try {
            chrome.runtime.sendMessage({ action: 'enhancePrompt', prompt, suggestion: hint }, (res) => {
                btnGroup.classList.remove('loading');
                if (chrome.runtime.lastError || res.status === 'error') {
                    btnGroup.classList.add('fail');
                    btnMain.innerHTML = `${ICONS.fail}<span>Failed</span>`;
                    btnMain.title = res?.text || chrome.runtime.lastError?.message;
                } else if (res.status === 'success') {
                    setNativeValue(targetEl, res.text);
                    targetEl.dispatchEvent(new Event('input', { bubbles: true }));
                    btnGroup.classList.add('success');
                    btnMain.innerHTML = `${ICONS.success}<span>Done!</span>`;
                } else if (res.status === 'no_change') {
                    btnGroup.classList.add('no-change');
                    btnMain.innerHTML = `${ICONS.success}<span>No change</span>`;
                    btnMain.title = res.text;
                }
                setTimeout(reset, 2800);
            });
        } catch (err) {
            btnGroup.classList.add('fail');
            btnMain.innerHTML = `${ICONS.fail}<span>Error</span>`;
            setTimeout(reset, 2200);
        }
    }

    // ── Render normal popup (hint + Enhance button) ────────────────────────────
    function renderNormalPopup() {
        popup.innerHTML = `
            <div class="sai-popup-head">
                <img src="${iconUrl}" alt="SYNTAX AI" width="18" height="18" style="border-radius:4px;object-fit:contain;">
                <span>Syntax AI</span>
            </div>
            <div class="sai-popup-sub">Enhance your prompt with AI-powered rewriting.</div>
            <div class="sai-field">
                <span class="sai-field-label">Optional hint</span>
                <input type="text" id="sai-hint" placeholder="e.g. make it more concise…" autocomplete="off">
            </div>
            <button class="sai-enhance-btn" id="sai-enhance-btn">${ICONS.spark} Enhance Prompt</button>
        `;
        popup.querySelector('#sai-enhance-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            runEnhance(popup.querySelector('#sai-hint').value);
        });
    }

    // ── Render inline setup popup (no API key yet) ─────────────────────────────
    function renderSetupPopup() {
        popup.innerHTML = `
            <div class="sai-popup-head">
                <img src="${iconUrl}" alt="SYNTAX AI" width="18" height="18" style="border-radius:4px;object-fit:contain;">
                <span>Connect Provider</span>
            </div>
            <div class="sai-popup-sub">No API key found. Paste yours below — provider detected instantly.</div>
            <div class="sai-field">
                <span class="sai-field-label">API Key</span>
                <input type="password" id="sai-setup-key" placeholder="Paste your API key…" autocomplete="off" spellcheck="false"
                    style="letter-spacing:0.02em;">
            </div>
            <div id="sai-detect-row" style="
                display:none; align-items:center; gap:6px;
                font-size:11px; font-weight:600; letter-spacing:0.03em;
                color:var(--sai-primary); background:rgba(28,232,160,0.08);
                border:1px solid rgba(28,232,160,0.22); border-radius:8px;
                padding:6px 10px; margin-bottom:10px;
            "></div>
            <button class="sai-enhance-btn" id="sai-connect-btn" disabled
                style="opacity:0.45;cursor:not-allowed;">
                ${ICONS.spark} Save & Enhance
            </button>
        `;

        const keyInput   = popup.querySelector('#sai-setup-key');
        const detectRow  = popup.querySelector('#sai-detect-row');
        const connectBtn = popup.querySelector('#sai-connect-btn');

        // Live key detection
        keyInput.addEventListener('input', () => {
            const key      = keyInput.value.trim();
            const detected = detectKeyProvider(key);

            if (!key) {
                detectRow.style.display = 'none';
                connectBtn.disabled = true;
                connectBtn.style.opacity = '0.45';
                connectBtn.style.cursor  = 'not-allowed';
                return;
            }

            if (detected === 'anthropic') {
                detectRow.style.display = 'flex';
                detectRow.style.color   = '#F9AB00';
                detectRow.style.background = 'rgba(249,171,0,0.08)';
                detectRow.style.borderColor = 'rgba(249,171,0,0.25)';
                detectRow.textContent = '⚠ Anthropic blocks browser calls — use an OpenRouter key instead';
                connectBtn.disabled = true;
                connectBtn.style.opacity = '0.45';
                connectBtn.style.cursor  = 'not-allowed';
            } else if (detected) {
                detectRow.style.display = 'flex';
                detectRow.style.color   = 'var(--sai-primary)';
                detectRow.style.background = 'rgba(28,232,160,0.08)';
                detectRow.style.borderColor = 'rgba(28,232,160,0.22)';
                detectRow.textContent = `✓ Detected: ${SAI_PROVIDER_NAMES[detected] || detected}`;
                connectBtn.disabled = false;
                connectBtn.style.opacity = '1';
                connectBtn.style.cursor  = 'pointer';
            } else {
                detectRow.style.display = 'flex';
                detectRow.style.color   = 'var(--sai-muted)';
                detectRow.style.background = 'transparent';
                detectRow.style.borderColor = 'var(--sai-divider)';
                detectRow.textContent = '? Unknown prefix — select provider manually in Options';
                connectBtn.disabled = false;
                connectBtn.style.opacity = '1';
                connectBtn.style.cursor  = 'pointer';
            }
        });

        // Save & Enhance
        connectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const key      = keyInput.value.trim();
            const provider = detectKeyProvider(key) || '';
            if (!key) return;

            connectBtn.textContent = 'Saving…';
            connectBtn.disabled    = true;

            chrome.storage.sync.set({ apiKey: key, provider }, () => {
                // Switch back to normal popup then run enhance
                renderNormalPopup();
                popup.classList.remove('visible');
                runEnhance('');
            });
        });
    }

    // ── Main button click — enhance directly or open setup ─────────────────────
    btnMain.addEventListener('click', (e) => {
        e.stopPropagation();
        addRipple(e, btnMain);
        if (btnMain.disabled) return;

        // Check if an API key is already stored
        chrome.storage.sync.get(['apiKey', 'geminiApiKey'], (stored) => {
            const hasKey = !!((stored.apiKey || '').trim() || (stored.geminiApiKey || '').trim());
            if (hasKey) {
                // If popup is open, close it
                popup.classList.remove('visible');
                runEnhance('');
            } else {
                // No key: open setup popup
                if (popup.classList.contains('visible')) {
                    popup.classList.remove('visible');
                    return;
                }
                renderSetupPopup();
                popup.classList.add('visible');
            }
        });
    });

    // ── Settings button click — open normal or setup popup ─────────────────────
    btnSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        addRipple(e, btnSettings);
        if (btnSettings.disabled) return;

        // Check if an API key is already stored
        chrome.storage.sync.get(['apiKey', 'geminiApiKey'], (stored) => {
            const hasKey = !!((stored.apiKey || '').trim() || (stored.geminiApiKey || '').trim());
            if (popup.classList.contains('visible')) {
                popup.classList.remove('visible');
                return;
            }
            if (hasKey) {
                renderNormalPopup();
            } else {
                renderSetupPopup();
            }
            popup.classList.add('visible');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) popup.classList.remove('visible');
    });

    // ── Adaptive theme watch ──
    new MutationObserver(() => {
        host.setAttribute('style', buildVars(detectTheme()));
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
}

// ── 9. Set native value ───────────────────────────────────────────────────────
function setNativeValue(element, value) {
    if (['DIV', 'SPAN'].includes(element.tagName)) { element.textContent = value; return; }
    const vs  = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const pvs = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
    if (vs && vs !== pvs) pvs.call(element, value);
    else if (vs) vs.call(element, value);
    else element.value = value;
}
