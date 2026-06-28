# Syntax AI 🚀

An enterprise-grade, privacy-first Chrome Extension that enhances LLM prompt quality in real-time. Sitting directly inside platforms like **ChatGPT**, **Claude**, **Google Gemini**, and **Perplexity**, Syntax AI intercepts your drafts, runs a two-stage agentic enhancement cycle, and injects highly optimized, context-aware prompts back into the DOM.

---

## 🏗 System Architecture

Syntax AI is designed around a decoupled, local-first event-driven architecture. By keeping credential management and API dispatching in the background service worker, it prevents DOM-based injection vulnerabilities and maintains compliance with modern browser sandboxing standards.

```mermaid
graph TD
    User([User Prompt Input]) -->|Trigger Enhance| CS[Content Script]
    CS -->|Query Keys| Storage[(Chrome Sync Storage)]
    Storage -->|API Key Status| CS
    
    subgraph Extension Sandbox
        CS -->|chrome.runtime.sendMessage| BG[Background Service Worker]
        BG -->|Fetch Key/Provider| Storage
    end
    
    subgraph Multi-Provider Dispatcher
        BG -->|Direct API Call| Gemini[Google Gemini API]
        BG -->|Direct API Call| OpenAI[OpenAI API]
        BG -->|Direct API Call| OpenRouter[OpenRouter / Claude API]
        BG -->|Direct API Call| Other[Other Compat APIs]
    end
    
    Gemini & OpenAI & OpenRouter & Other -->|LLM Prompt Response| BG
    BG -->|chrome.runtime.sendMessage Response| CS
    CS -->|Update DOM| InputArea[AI Platform TextArea]
```

### Key Components
1. **Content Script (`content.js`)**: Coordinates DOM injection, monitors site styling to apply adaptive dark/light themes, captures user input from active textboxes, and provides an inline configuration panel when credentials are missing.
2. **Background Worker (`background.js`)**: A service worker running in an isolated context. Manages the core orchestrator pipeline, formats instructions for LLM interfaces, and securely handles outgoing CORS requests.
3. **Storage (`chrome.storage.sync`)**: Safely stores API tokens locally on the user's browser. Credentials are encrypted and sync across user devices via Chrome Sync profiles.

---

## 🔄 Agentic Rewrite Pipeline

Instead of applying a static template, Syntax AI leverages a two-phase LLM dispatcher loop to understand intent and rewrite the prompt contextually.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Input Area
    participant CS as Content Script
    participant BG as Background Worker
    participant Storage as Sync Storage
    participant LLM as Target LLM API

    User->>CS: Click Enhance Button
    CS->>Storage: Get apiKey & provider
    Storage-->>CS: Return key configuration
    alt No API Key Found
        CS-->>User: Open Inline Setup Popup
    else API Key Exists
        CS->>BG: send({action: "enhancePrompt", prompt})
        BG->>Storage: Fetch key & configurations
        Storage-->>BG: Return credentials
        Note over BG, LLM: Step 1: Strategist Phase
        BG->>LLM: Analyze prompt & determine strategy
        LLM-->>BG: Return strategy (JSON)
        Note over BG, LLM: Step 2: Execution Phase
        BG->>LLM: Rewrite prompt using strategy & context
        LLM-->>BG: Return enhanced prompt text
        BG-->>CS: Send enhancement response
        CS->>User: Replace input text & dispatch event
    end
```

### The Two-Stage Pipeline
1. **The Strategist Phase**: Analyzes your raw draft and determines which cognitive prompt engineering strategy will yield the best results (e.g., *Chain-of-Thought*, *Contextual Expansion*, *Directive*, etc.).
2. **The Execution Phase**: Rewrites the prompt based on the Strategist's plan, injecting necessary preambles, structuring rules, and cleansing markdown wrappers before updating your page.

---

## 📂 Project Directory Structure

```text
syntax-ai/
├── icons/                  # High-resolution branding assets
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json           # Chrome MV3 configuration and entry definitions
├── background.js           # Background service worker & API dispatcher
├── content.js              # Injectable DOM controller & styling
├── options.html            # Web-accessible settings UI
└── options.js              # Options page logic and prefix detection
```

---

## 🛠 Installation & Local Setup

Syntax AI is loaded directly into the browser as an unpacked developer extension:

1. **Clone/Download** this repository to your local machine.
2. Open Google Chrome and navigate to the Extensions page: `chrome://extensions`.
3. Toggle the **Developer mode** switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the `syntax-ai` directory containing `manifest.json`.

---

## 💡 How to Use

Once loaded, the extension dynamically integrates into ChatGPT, Claude, Gemini, and Perplexity:

1. **One-Click Enhancement**: Type your raw message in the platform input field. Click the injected **Enhance** chip button. If configured, your text will automatically transform into an optimized prompt.
2. **Settings and Hints**: Click the **Gear icon** next to the Enhance button. You can add specific instructions (e.g. *"make it more technical"*, *"write in python"*) to guide the enhancement.
3. **No-Setup Setup**: If you haven't added an API Key, clicking the **Enhance** button will immediately open a beautiful, local setup dialog to paste your key. Provider detection happens automatically based on the prefix of your token.

---

## 🔒 Security & Privacy Commitments

- **Zero Middleware**: Syntax AI communicates directly with your chosen LLM endpoint. Your keys, prompts, and preferences never touch a middleman server.
- **Local Credential Storage**: All API keys are saved directly into your browser's sandboxed storage (`chrome.storage.sync`).
- **Permissions**: Request scopes are limited to `storage` (for key persistence) and `clipboardWrite` (for fallback outputs), alongside target host permissions for the supported AI web platforms.
