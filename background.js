/**
 * @file background.js
 * @description Universal Multi-Provider Background Worker for SYNTAX AI.
 * Handles secure execution of Strategist and Executor cognitive agent pipelines,
 * stores local configuration state, and acts as a sandboxed proxy to prevent CORS issues.
 * @version 4.0
 */

// ── Provider Config Registry ──────────────────────────────────────────────────
/**
 * @typedef {Object} ProviderConfig
 * @property {string} name - Friendly display name of the LLM provider.
 * @property {'gemini'|'anthropic'|'openai-compat'} type - Underlying API scheme.
 * @property {string} model - Target model identifier.
 * @property {string} url - Base API endpoint URL (if compat provider).
 */

/** @type {Object<string, ProviderConfig>} */
const PROVIDERS = {
    gemini:          { name: 'Google Gemini',  type: 'gemini',        model: 'gemini-2.0-flash',                    url: '' },
    openai:          { name: 'OpenAI',         type: 'openai-compat', model: 'gpt-4o-mini',                        url: 'https://api.openai.com/v1' },
    anthropic:       { name: 'Anthropic',      type: 'anthropic',     model: 'claude-3-haiku-20240307',             url: '' },
    groq:            { name: 'Groq',           type: 'openai-compat', model: 'llama-3.3-70b-versatile',            url: 'https://api.groq.com/openai/v1' },
    openrouter:      { name: 'OpenRouter',     type: 'openai-compat', model: 'openai/gpt-4o-mini',                 url: 'https://openrouter.ai/api/v1' },
    xai:             { name: 'xAI / Grok',     type: 'openai-compat', model: 'grok-beta',                          url: 'https://api.x.ai/v1' },
    deepseek:        { name: 'DeepSeek',       type: 'openai-compat', model: 'deepseek-chat',                      url: 'https://api.deepseek.com/v1' },
    mistral:         { name: 'Mistral',        type: 'openai-compat', model: 'mistral-small-latest',               url: 'https://api.mistral.ai/v1' },
    'perplexity-api':{ name: 'Perplexity API', type: 'openai-compat', model: 'llama-3.1-sonar-small-128k-online', url: 'https://api.perplexity.ai' },
};

// ── Prefix Auto-Detection Registry ────────────────────────────────────────────
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
    ['sk-',       'openai'],  // fallback for generic OpenAI/compatible keys
];

/**
 * Auto-detects the LLM provider based on the format/prefix of the API key.
 * @param {string} key - Raw API key token.
 * @returns {string|null} The resolved provider key, or null if unrecognized.
 */
function detectProviderFromKey(key) {
    const cleanKey = (key || '').trim();
    for (const [prefix, id] of PREFIX_MAP) {
        if (cleanKey.startsWith(prefix)) return id;
    }
    return null;
}

// ── Runtime Message Listeners ─────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const loggerPrefix = '[Syntax AI Background]';
    
    if (request.action === 'enhancePrompt') {
        enhanceText(request.prompt, request.suggestion)
            .then(sendResponse)
            .catch(err => {
                console.error(`${loggerPrefix} Enhancement execution failed:`, err);
                sendResponse({ status: 'error', text: err.message });
            });
        return true; // Keep message port open for asynchronous response
    }
    
    if (request.action === 'detectProvider') {
        const detected = detectProviderFromKey(request.key);
        sendResponse({ provider: detected });
    }
});

// ── Helper Utilities ──────────────────────────────────────────────────────────
/**
 * Safely extracts the first valid JSON block from a raw string.
 * @param {string} text - Raw model response text.
 * @returns {string|null} Extracted JSON substring, or null if no valid block found.
 */
function extractJson(text) {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : null;
}

// ── API Call Implementations ──────────────────────────────────────────────────
/**
 * Executes a native Google Gemini API payload request.
 * @param {string} apiKey - Gemini API Key.
 * @param {string} prompt - Raw instructions.
 * @returns {Promise<string>} Enhanced prompt response.
 */
async function callGemini(apiKey, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    });
    if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

/**
 * Executes a native Anthropic API payload request.
 * @param {string} apiKey - Anthropic API Key.
 * @param {string} prompt - Raw instructions.
 * @returns {Promise<string>} Enhanced prompt response.
 */
async function callAnthropic(apiKey, prompt) {
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 2048,
                messages: [{ role: 'user', content: prompt }],
            }),
        });
        if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
        const data = await res.json();
        return data.content?.[0]?.text?.trim() || '';
    } catch (err) {
        // Intercept browser-side Anthropic CORS blocks and instruct the user on how to resolve.
        const isNetworkOrCorsError = err.message === 'Failed to fetch' || 
                                     err.message.includes('CORS') || 
                                     err.message.includes('NetworkError');
        if (isNetworkOrCorsError) {
            throw new Error(
                'Anthropic blocks direct calls from browser extensions due to CORS policy. ' +
                'To use Claude models, switch to an OpenRouter key instead — ' +
                'it proxies Anthropic models securely and supports browser extension requests.'
            );
        }
        throw err;
    }
}

/**
 * Executes a standard OpenAI-Compatible chat completion request.
 * @param {string} apiKey - Target provider API key.
 * @param {string} prompt - Structured instructions.
 * @param {string} baseUrl - API endpoint origin URL.
 * @param {string} model - Target model identifier.
 * @returns {Promise<string>} Enhanced prompt response.
 */
async function callOpenAICompat(apiKey, prompt, baseUrl, model) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        }),
    });
    if (!res.ok) throw new Error(`${baseUrl} error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
}

/**
 * Unified dispatch router that maps a provider to its native HTTP request wrapper.
 * @param {string} apiKey - API key configuration.
 * @param {string} provider - Resolved target provider name.
 * @param {string} prompt - Raw instruction payload.
 * @returns {Promise<string>} Finished LLM response payload.
 */
async function makeApiCall(apiKey, provider, prompt) {
    const cfg = PROVIDERS[provider];
    if (!cfg) throw new Error(`Unknown provider configuration: "${provider}"`);

    if (cfg.type === 'gemini')        return callGemini(apiKey, prompt);
    if (cfg.type === 'anthropic')     return callAnthropic(apiKey, prompt);
    if (cfg.type === 'openai-compat') return callOpenAICompat(apiKey, prompt, cfg.url, cfg.model);
    throw new Error(`Unsupported provider protocol scheme: ${cfg.type}`);
}

// ── Agentic Cognitive Pipeline ───────────────────────────────────────────────
/**
 * Enhances prompt text using a dual-agent Strategist and Executor process.
 * @param {string} prompt - Original prompt string written by the user.
 * @param {string} [userSuggestion] - Optional specific instructions to guide enhancement.
 * @returns {Promise<{status: 'success'|'no_change'|'error', text: string}>} Result envelope.
 */
async function enhanceText(prompt, userSuggestion = '') {
    // 1. Fetch credentials with migration checking
    const stored = await chrome.storage.sync.get(['apiKey', 'geminiApiKey', 'provider']);
    const apiKey = stored.apiKey || stored.geminiApiKey || '';
    const savedProvider = stored.provider || '';
    
    if (!apiKey) {
        return { 
            status: 'error', 
            text: 'API key not configured. Please paste your key in the Setup popup or open options.' 
        };
    }

    // 2. Resolve provider dynamically based on prefix ambiguity rules
    const detectedProvider = detectProviderFromKey(apiKey);
    const AMBIGUOUS = ['openai'];
    const provider =
        (detectedProvider && !AMBIGUOUS.includes(detectedProvider))
            ? detectedProvider
            : (savedProvider || detectedProvider || 'openai');

    // 3. STEP 1: Cognitive Strategist Execution
    const strategistPrompt = `You are an expert AI Prompt Engineering Strategist. Analyze the user's prompt and decide the single best enhancement strategy.
Your response MUST be ONLY a valid JSON object.

User Prompt: "${prompt}"
User Suggestion: "${userSuggestion || 'None'}"

Strategies:
- "Directive": Make clearer, concise, unambiguous.
- "Exploratory": Add detail, angles, encourage broader exploration.
- "Contextual": Generate necessary background context first.
- "Chain_of_Thought": Ask for step-by-step reasoning.
- "Reflective": Evaluate, compare, apply criteria.
- "Sequential": Break into ordered steps.
- "Zero_Shot_Correction": Basic grammar/spelling fix only.

Respond with this exact JSON schema:
{"is_enhancement_needed":boolean,"reasoning":"brief explanation","chosen_strategy":"strategy name","enhancement_goal":"detailed actionable goal"}`;

    let strategy;
    try {
        const raw = await makeApiCall(apiKey, provider, strategistPrompt);
        const json = extractJson(raw);
        if (!json) throw new Error('No valid JSON extracted from Strategist response');
        strategy = JSON.parse(json);
    } catch (e) {
        console.warn('[Syntax AI Background] Strategist phase failed, falling back to spelling check:', e);
        strategy = { 
            is_enhancement_needed: true, 
            chosen_strategy: 'Zero_Shot_Correction', 
            enhancement_goal: 'Perform a basic grammar and clarity check.' 
        };
    }

    // Short-circuit if prompt is evaluated as already optimal
    if (!strategy.is_enhancement_needed) {
        return { status: 'no_change', text: `No enhancement needed: ${strategy.reasoning}` };
    }

    // 4. STEP 2: Rewrite Executor Execution
    const baseInstruction = `You are an expert prompt rewriter. Rewrite the 'Original User Prompt' to meet the 'Goal'. Output ONLY the rewritten prompt — no preambles, explanations, markdown, or quotes.`;
    let executionPrompt;

    if (strategy.chosen_strategy === 'Chain_of_Thought') {
        executionPrompt = `${baseInstruction}\nThink step-by-step, then output the rewritten prompt after the exact phrase "Final Prompt:".\nGoal: ${strategy.enhancement_goal}\nOriginal User Prompt: --- ${prompt}`;
    } else if (strategy.chosen_strategy === 'Contextual') {
        const knowledge = await makeApiCall(apiKey, provider,
            `Generate 3-5 essential facts that provide context for this prompt: "${prompt}"`);
        executionPrompt = `${baseInstruction}\nContext: ${knowledge}\nGoal: ${strategy.enhancement_goal}\nOriginal User Prompt: --- ${prompt}`;
    } else {
        executionPrompt = `${baseInstruction}\nGoal: ${strategy.enhancement_goal}\nOriginal User Prompt: --- ${prompt}`;
    }

    let enhanced = await makeApiCall(apiKey, provider, executionPrompt);

    // Clean up Executor formatting artifacts
    if (strategy.chosen_strategy === 'Chain_of_Thought') {
        const idx = enhanced.lastIndexOf('Final Prompt:');
        if (idx !== -1) enhanced = enhanced.substring(idx + 'Final Prompt:'.length);
    }

    enhanced = enhanced
        .replace(/^Here is the enhanced prompt:\s*/i, '')
        .replace(/^Sure, here'?s the revised prompt:\s*/i, '')
        .replace(/^Certainly.*?:\s*/i, '')
        .replace(/```[\w]*/g, '')
        .replace(/```/g, '')
        .replace(/^["']|["']$/g, '')
        .trim();

    if (!enhanced) throw new Error('Model executor returned an empty response.');
    return { status: 'success', text: enhanced };
}