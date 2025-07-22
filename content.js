// --- UPDATED with Final, Robust Placement Logic ---

let injectionTimeout = null;

// --- SVG Icons ---
const ICONS = {
    main: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 8.5a3 3 0 1 0-6 0m6 7a3 3 0 1 0-6 0m-7-3.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    fail: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    no_change: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
};

// --- Inject all necessary CSS ---
const style = document.createElement('style');
style.textContent = `
    /* --- Main container for the UI, placed outside the form --- */
    .syntax-ai-ui-host {
        display: flex;
        justify-content: flex-end;
        padding: 0 10px 8px;
        margin: 0 auto;
        max-width: 48rem; /* Match common chat UI widths */
    }
    .syntax-ai-container { 
        position: relative; 
        z-index: 1000; 
        display: flex; 
        align-items: flex-end; 
        gap: 8px; 
    }
    .syntax-ai-main-button { 
        padding: 6px 10px; 
        background-color: rgba(142, 45, 226, 0.8); /* Slightly less transparent */
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        transition: all 0.2s ease-in-out;
        height: 32px;
        backdrop-filter: blur(2px);
    }
    .syntax-ai-main-button:hover { 
        background-color: rgba(142, 45, 226, 1); 
        transform: translateY(-2px); 
        box-shadow: 0 4px 12px rgba(142, 45, 226, 0.4); 
    }
    .syntax-ai-main-button:disabled { cursor: wait; transform: translateY(0); box-shadow: none; }
    @keyframes rgb-glow {
        0% { box-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000; } 25% { box-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00; } 50% { box-shadow: 0 0 5px #0000ff, 0 0 10px #0000ff; } 75% { box-shadow: 0 0 5px #ffff00, 0 0 10px #ffff00; } 100% { box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff; }
    }
    .syntax-ai-main-button.loading { animation: rgb-glow 2s infinite linear alternate; }
    .syntax-ai-main-button.success { background-color: #2ecc71 !important; box-shadow: 0 0 10px #2ecc71 !important; animation: none; }
    .syntax-ai-main-button.fail { background-color: #e74c3c !important; box-shadow: 0 0 10px #e74c3c !important; animation: none; }
    .syntax-ai-main-button.no_change { background-color: #95a5a6 !important; box-shadow: 0 0 8px #95a5a6 !important; animation: none; }
    .syntax-ai-suggestion-wrapper { 
        position: absolute; 
        bottom: calc(100% + 8px);
        right: 0;
        display: flex; 
        opacity: 0; 
        transform: translateY(10px); 
        visibility: hidden; 
        transition: opacity 0.2s ease, transform 0.2s ease; 
        background-color: #2c2c2c; 
        border-radius: 6px; 
        padding: 4px; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 1001;
    }
    .syntax-ai-suggestion-wrapper.visible { opacity: 1; transform: translateY(0); visibility: visible; }
    #syntax-ai-suggestion-input { background-color: #3f3f3f; border: none; border-radius: 4px; color: #e0e0e0; padding: 6px 10px; font-size: 12px; width: 200px; outline: none; }
    #syntax-ai-confirm-btn { background-color: #4a00e0; color: white; border: none; border-radius: 4px; padding: 0 12px; margin-left: 4px; cursor: pointer; font-size: 12px; font-weight: 500; }
`;
document.head.appendChild(style);


// --- Main Observer ---
const observer = new MutationObserver(() => {
    // Check if our UI already exists. If it does, we don't need to do anything.
    if (document.querySelector('.syntax-ai-ui-host')) {
        return;
    }

    const selectors = ['textarea[data-id="root"]', '.ql-editor.textarea', 'div.ProseMirror[contenteditable="true"]', 'div[role="textbox"][contenteditable="true"]'];
    let targetElement = selectors.map(s => document.querySelector(s)).find(el => el);

    if (targetElement) {
        clearTimeout(injectionTimeout);
        injectionTimeout = setTimeout(() => {
            const injectionAnchor = findInjectionAnchor(targetElement);
            if (injectionAnchor) {
                injectUI(injectionAnchor, targetElement);
            }
        }, 300);
    }
});
observer.observe(document.body, { childList: true, subtree: true });


// --- UPDATED: More robust function to find the injection anchor ---
function findInjectionAnchor(targetElement) {
    const hostname = window.location.hostname;

    // Strategy for ChatGPT
    if (hostname.includes('chatgpt.com')) {
        const form = targetElement.closest('form');
        if (form) return form;
    }

    // Strategy for Claude.ai
    if (hostname.includes('claude.ai')) {
        // This is a stable parent element outside the main input area on Claude
        const anchor = targetElement.closest('div[data-slate-editor="true"]')?.parentElement?.parentElement;
        if (anchor) return anchor;
    }
    
    // Strategy for Gemini
    if (hostname.includes('gemini.google.com')) {
        // This selector reliably finds the main container for the input area
        const anchor = document.querySelector('main .input-area');
        if (anchor) return anchor;
    }

    // Generic Fallback Strategy for other sites
    return targetElement.closest('form') || targetElement.parentElement;
}


// --- UI Injection ---
function injectUI(injectionAnchor, targetElement) {
    const uiHost = document.createElement('div');
    uiHost.className = 'syntax-ai-ui-host';
    
    const container = document.createElement('div');
    container.className = 'syntax-ai-container';
    
    const suggestionWrapper = document.createElement('div');
    suggestionWrapper.className = 'syntax-ai-suggestion-wrapper';
    suggestionWrapper.innerHTML = `
        <input type="text" id="syntax-ai-suggestion-input" placeholder="Optional: add a suggestion...">
        <button id="syntax-ai-confirm-btn">Enhance</button>
    `;

    const button = document.createElement('button');
    button.className = 'syntax-ai-main-button';
    button.innerHTML = ICONS.main;

    container.appendChild(suggestionWrapper);
    container.appendChild(button);
    uiHost.appendChild(container);

    // Place the UI before the anchor element (i.e., on top of the chat box)
    injectionAnchor.insertAdjacentElement('beforebegin', uiHost);

    // --- Event Listeners ---
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!button.disabled) {
            suggestionWrapper.classList.toggle('visible');
        }
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            suggestionWrapper.classList.remove('visible');
        }
    });

    document.getElementById('syntax-ai-confirm-btn').addEventListener('click', (e) => {
        e.stopPropagation();

        const originalPrompt = (targetElement.tagName === 'DIV' ? targetElement.textContent : targetElement.value);
        const userSuggestion = document.getElementById('syntax-ai-suggestion-input').value;

        if (!originalPrompt.trim() || button.disabled) return;

        button.disabled = true;
        button.classList.add('loading');
        suggestionWrapper.classList.remove('visible');

        const resetButton = () => {
            button.disabled = false;
            button.classList.remove('loading', 'success', 'fail', 'no_change');
            button.innerHTML = ICONS.main;
            button.title = ''; // Clear tooltip
        };

        try {
            chrome.runtime.sendMessage({ action: "enhancePrompt", prompt: originalPrompt, suggestion: userSuggestion }, (response) => {
                button.classList.remove('loading');

                if (chrome.runtime.lastError || response.status === 'error') {
                    console.error("SYNTAX AI Error:", chrome.runtime.lastError?.message || response.text);
                    button.classList.add('fail');
                    button.innerHTML = ICONS.fail;
                    button.title = response.text;
                } else if (response.status === 'success') {
                    setNativeValue(targetElement, response.text);
                    targetElement.dispatchEvent(new Event('input', { bubbles: true }));
                    button.classList.add('success');
                    button.innerHTML = ICONS.success;
                } else if (response.status === 'no_change') {
                    button.classList.add('no_change');
                    button.innerHTML = ICONS.no_change;
                    button.title = response.text; // Show the reasoning in a tooltip
                }
                setTimeout(resetButton, 2500);
            });
        } catch (error) {
            console.error("SYNTAX AI: Could not send message.", error);
            button.classList.add('fail');
            setTimeout(resetButton, 2000);
        }
    });
}

// --- Helper function to set value ---
function setNativeValue(element, value) {
    if (['DIV', 'SPAN'].includes(element.tagName)) {
        element.textContent = value;
        return;
    }
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
        valueSetter.call(element, value);
    } else {
        element.value = value;
    }
}
