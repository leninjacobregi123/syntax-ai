/**
 * @file options.js
 * @description Logic for the SYNTAX AI Options Page.
 * Manages user credentials (API keys) and disambiguation selection,
 * including auto-detection based on token prefixing rules.
 * @version 4.0
 */

// ── Prefix Mapping ────────────────────────────────────────────────────────────
/**
 * Prefix-to-Provider mapping array.
 * Note: Longer prefixes must be defined first to avoid false matching.
 * @type {Array<[string, string]>}
 */
const PREFIX_MAP = [
    ['sk-ant-',   'anthropic'],
    ['sk-or-',    'openrouter'],
    ['sk-proj-',  'openai'],
    ['AIza',      'gemini'],
    ['gsk_',      'groq'],
    ['pplx-',     'perplexity-api'],
    ['xai-',      'xai'],
    ['sk-',       'openai'],  // ambiguous prefix — could be OpenAI, DeepSeek, or Mistral
];

/**
 * List of ambiguous provider names that share a prefix.
 * @type {string[]}
 */
const AMBIGUOUS_PROVIDERS = ['openai'];

/**
 * Metadata configuration mapping for supported providers.
 * @typedef {Object} ProviderMeta
 * @property {string} icon - Graphical Emoji icon representation.
 * @property {string} name - Clear human-readable provider name.
 * @property {string} model - Target LLM model name.
 * @property {string} hintUrl - Link to direct API key creator console.
 * @property {string} hintLabel - Clickable label name.
 * 
 * @type {Object<string, ProviderMeta>}
 */
const PROVIDER_META = {
    gemini:          { icon: '🔵', name: 'Google Gemini',  model: 'gemini-2.0-flash',                    hintUrl: 'https://aistudio.google.com/app/apikey',           hintLabel: 'Google AI Studio' },
    openai:          { icon: '🟢', name: 'OpenAI',         model: 'GPT-4o mini',                          hintUrl: 'https://platform.openai.com/api-keys',             hintLabel: 'OpenAI Platform' },
    anthropic:       { icon: '🟠', name: 'Anthropic',      model: '⚠ CORS blocked — use OpenRouter',      hintUrl: 'https://openrouter.ai/keys',                       hintLabel: 'OpenRouter (recommended for Claude)' },
    groq:            { icon: '⚡', name: 'Groq',           model: 'LLaMA 3.3 70B',                        hintUrl: 'https://console.groq.com/keys',                    hintLabel: 'Groq Console' },
    openrouter:      { icon: '🌐', name: 'OpenRouter',     model: '100+ models incl. Claude & GPT',        hintUrl: 'https://openrouter.ai/keys',                       hintLabel: 'OpenRouter' },
    xai:             { icon: '✦',  name: 'xAI / Grok',    model: 'Grok Beta',                             hintUrl: 'https://console.x.ai/',                            hintLabel: 'xAI Console' },
    deepseek:        { icon: '🔷', name: 'DeepSeek',       model: 'deepseek-chat',                         hintUrl: 'https://platform.deepseek.com/api_keys',           hintLabel: 'DeepSeek Platform' },
    mistral:         { icon: '🔴', name: 'Mistral',        model: 'mistral-small-latest',                  hintUrl: 'https://console.mistral.ai/api-keys/',             hintLabel: 'Mistral Console' },
    'perplexity-api':{ icon: '💜', name: 'Perplexity API', model: 'Sonar Small (search-augmented)',        hintUrl: 'https://www.perplexity.ai/settings/api',           hintLabel: 'Perplexity Settings' },
};

// ── State variables ───────────────────────────────────────────────────────────
/** @type {string|null} Resolved provider (if unambiguous) */
let resolvedProvider = null;
/** @type {string} Chosen provider (if prefix is ambiguous) */
let disambigProvider = 'openai';

// ── Functions ─────────────────────────────────────────────────────────────────
/**
 * Resolves the target provider from key prefix.
 * @param {string} key - Raw API key input string.
 * @returns {string|null} Resolved provider key name or null.
 */
function detectProvider(key) {
    const cleanKey = (key || '').trim();
    for (const [prefix, id] of PREFIX_MAP) {
        if (cleanKey.startsWith(prefix)) return id;
    }
    return null;
}

/**
 * Handles DOM view state and input validations on user input change.
 * @param {string} key - Updated API key value.
 */
function onKeyChange(key) {
    const cleanKey = (key || '').trim();
    const card      = document.getElementById('detect-card');
    const icon      = document.getElementById('detect-icon');
    const title     = document.getElementById('detect-title');
    const sub       = document.getElementById('detect-sub');
    const hint      = document.getElementById('key-hint');
    const disambig  = document.getElementById('disambig');
    const saveBtn   = document.getElementById('save');

    // Handle empty state
    if (!cleanKey) {
        card.className = 'detect-card idle';
        icon.textContent  = '🔑';
        title.textContent = 'Waiting for key…';
        sub.textContent   = 'Your provider will be identified automatically.';
        hint.innerHTML    = 'Your key is stored locally in Chrome and never shared.';
        disambig.classList.remove('visible');
        saveBtn.disabled  = true;
        resolvedProvider  = null;
        return;
    }

    const detected = detectProvider(cleanKey);

    // Handle unknown prefix format
    if (!detected) {
        card.className = 'detect-card warn';
        icon.textContent  = '❓';
        title.textContent = 'Unknown key format';
        sub.textContent   = 'Key prefix not recognised. You can still save — connection will be attempted with default fallback.';
        hint.innerHTML    = 'If this is a custom or enterprise key, contact your provider for the correct base URL.';
        disambig.classList.remove('visible');
        resolvedProvider  = null;
        saveBtn.disabled  = false;
        return;
    }

    const isAmbiguous = AMBIGUOUS_PROVIDERS.includes(detected);
    const meta = PROVIDER_META[detected] || {};

    // Special Case: Anthropic API Key (CORS Blocked direct browser calls)
    if (detected === 'anthropic') {
        card.className = 'detect-card warn';
        icon.textContent  = '⚠️';
        title.textContent = `Detected: Anthropic — CORS Blocked`;
        sub.textContent   = 'Anthropic blocks direct browser API calls. Use an OpenRouter key (sk-or-…) to access Claude models instead.';
        hint.innerHTML    = `Get an OpenRouter key at <a href="https://openrouter.ai/keys" target="_blank">openrouter.ai →</a>`;
        disambig.classList.remove('visible');
        resolvedProvider  = 'anthropic';
        saveBtn.disabled  = false;
        return;
    }

    // Toggle view states based on provider prefix type
    if (isAmbiguous) {
        card.className = 'detect-card ok';
        icon.textContent  = '🔑';
        title.textContent = 'Ambiguous key prefix (sk-…)';
        sub.textContent   = 'This prefix is used by OpenAI, DeepSeek, and Mistral. Select your provider below.';
        disambig.classList.add('visible');
        
        const chosen = PROVIDER_META[disambigProvider] || PROVIDER_META['openai'];
        hint.innerHTML = `Get your key at <a href="${chosen.hintUrl}" target="_blank">${chosen.hintLabel} →</a>`;
        resolvedProvider = null;
        saveBtn.disabled = false;
    } else {
        card.className = 'detect-card ok';
        icon.textContent  = meta.icon || '✅';
        title.textContent = `✓ Detected: ${meta.name}`;
        sub.textContent   = `Will use model: ${meta.model}`;
        hint.innerHTML    = `Get your key at <a href="${meta.hintUrl}" target="_blank">${meta.hintLabel} →</a>`;
        disambig.classList.remove('visible');
        resolvedProvider  = detected;
        saveBtn.disabled  = false;
    }
}

/**
 * Returns final chosen provider.
 * @returns {string} Target provider key.
 */
function getFinalProvider() {
    return resolvedProvider || disambigProvider || 'openai';
}

/**
 * Restores initial user configuration values from Chrome Sync Storage on load.
 */
function restoreOptions() {
    chrome.storage.sync.get({ apiKey: '', geminiApiKey: '', provider: '' }, (items) => {
        const key = items.apiKey || items.geminiApiKey || '';
        if (key) {
            document.getElementById('apiKey').value = key;
            onKeyChange(key);
        }
        if (items.provider) {
            disambigProvider = items.provider;
            document.querySelectorAll('.disambig-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.disambig === items.provider);
            });
        }
    });
}

/**
 * Persists current input values to Chrome Sync Storage.
 */
function saveOptions() {
    const key = document.getElementById('apiKey').value.trim();
    const status = document.getElementById('status');
    if (!key) return;

    const provider = getFinalProvider();
    const meta     = PROVIDER_META[provider] || {};

    chrome.storage.sync.set({ apiKey: key, provider }, () => {
        status.textContent = `✓ Saved${meta.name ? ` — using ${meta.name}` : ''}.`;
        status.className = 'ok';
        status.style.opacity = 1;
        setTimeout(() => { status.style.opacity = 0; }, 3000);
    });
}

/**
 * Toggles input mask password/text visibility.
 */
function toggleVisibility() {
    const input  = document.getElementById('apiKey');
    const icon   = document.getElementById('eye-icon');
    const hidden = input.type === 'password';
    input.type   = hidden ? 'text' : 'password';
    icon.innerHTML = hidden
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
        : `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`;
}

// ── Bind Listeners ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();

    let debounce;
    document.getElementById('apiKey').addEventListener('input', e => {
        clearTimeout(debounce);
        debounce = setTimeout(() => onKeyChange(e.target.value), 250);
    });

    document.querySelectorAll('.disambig-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            disambigProvider = btn.dataset.disambig;
            document.querySelectorAll('.disambig-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const meta = PROVIDER_META[disambigProvider] || {};
            document.getElementById('key-hint').innerHTML =
                `Get your key at <a href="${meta.hintUrl}" target="_blank">${meta.hintLabel} →</a>`;
        });
    });

    document.getElementById('save').addEventListener('click', saveOptions);
    document.getElementById('toggleVisibility').addEventListener('click', toggleVisibility);
    document.getElementById('apiKey').addEventListener('keydown', e => {
        if (e.key === 'Enter') saveOptions();
    });
});
