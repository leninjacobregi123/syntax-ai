// --- UPDATED with Advanced Autonomous Strategy Selection ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "enhancePrompt") {
        const { prompt, suggestion } = request;
        
        enhanceTextWithGemini(prompt, suggestion)
            .then(responseObject => {
                sendResponse(responseObject);
            })
            .catch(error => {
                console.error("SYNTAX AI Error:", error);
                sendResponse({ status: 'error', text: error.message });
            });
            
        return true; // Indicate async response
    }
});

// --- Helper function to extract a JSON object from a string ---
function extractJsonFromString(text) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return jsonMatch[0];
    }
    return null; // Return null if no JSON object is found
}

// Helper function for making API calls
async function makeApiCall(apiKey, prompt) {
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "";
}


async function enhanceTextWithGemini(prompt, userSuggestion = '') {
    const data = await chrome.storage.sync.get('geminiApiKey');
    const apiKey = data.geminiApiKey;

    if (!apiKey) {
        return { status: 'error', text: "API key not found. Please set it in the extension options." };
    }

    // --- STEP 1: The "Strategist" Call with Expanded Techniques ---
    // UPDATED: The strategist now has a much richer set of tools to choose from.
    const strategistPrompt = `
        You are an expert AI Prompt Engineering Strategist. Your task is to analyze the user's prompt and an optional user suggestion, then decide on the single best enhancement strategy.
        Your response MUST be ONLY a single, valid JSON object, starting with { and ending with }.

        Analyze the following:
        - User's Prompt: "${prompt}"
        - User's Suggestion: "${userSuggestion || 'None'}"

        Here are the available strategies and when to use them:
        - "Directive": For straightforward requests. Goal is to make the prompt clearer, more concise, and unambiguous.
        - "Exploratory": For open-ended or creative prompts. Goal is to add detail, suggest angles, and encourage broader exploration.
        - "Contextual": When the prompt needs more background info to be effective. The goal will involve generating this context first.
        - "Chain_of_Thought": For prompts requiring logic, math, or step-by-step reasoning. Goal is to rephrase the prompt to ask for the reasoning process first.
        - "Reflective": For prompts that involve evaluation, comparison, or critique. Goal is to structure the prompt to ask the AI to first consider criteria, then apply them.
        - "Sequential": For complex tasks that can be broken down into a clear sequence of smaller steps. Goal is to outline these steps in the new prompt.
        - "Zero_Shot_Correction": Use this ONLY for basic spelling/grammar fixes if the prompt is already well-structured.

        Your JSON output must have this exact structure:
        {
          "is_enhancement_needed": boolean,
          "reasoning": "A brief explanation for your decision and strategy choice.",
          "chosen_strategy": "one of the strategies listed above",
          "enhancement_goal": "A detailed, actionable goal for the next AI model to perform the enhancement, based on the chosen strategy."
        }
    `;

    let strategyDecision;
    try {
        const rawDecision = await makeApiCall(apiKey, strategistPrompt);
        const cleanJsonString = extractJsonFromString(rawDecision);
        if (!cleanJsonString) {
            throw new Error("Strategist response did not contain a valid JSON object.");
        }
        strategyDecision = JSON.parse(cleanJsonString);
    } catch (e) {
        console.error("Failed to get a valid strategy decision:", e);
        strategyDecision = { is_enhancement_needed: true, chosen_strategy: 'Zero_Shot_Correction', enhancement_goal: 'Perform a basic grammar and clarity check.' };
    }

    if (!strategyDecision.is_enhancement_needed) {
        return { status: 'no_change', text: `No enhancement needed: ${strategyDecision.reasoning}` };
    }


    // --- STEP 2: The "Execution" Call ---
    let executionPrompt = "";
    // --- MODIFIED: Stricter instructions to prevent conversational replies or questions ---
    const baseInstruction = `You are an expert prompt rewriter. Your sole function is to rewrite the 'Original User Prompt' to meet the specified 'Goal'. Your output MUST be ONLY the rewritten prompt text and nothing else.

    **CRITICAL INSTRUCTIONS:**
    - **DO NOT** ask the user for more information or clarification. Your goal is to provide a complete, enhanced prompt based on the information you have.
    - **DO NOT** include any conversational preambles (e.g., "Here is the enhanced prompt:").
    - **DO NOT** provide any explanations about the changes made.
    - **DO NOT** use any markdown formatting (like \`\`\`) or enclose the output in quotes.

    Your response MUST be the rewritten prompt, suitable for direct use.`;

    switch (strategyDecision.chosen_strategy) {
        case 'Chain_of_Thought':
            // --- MODIFIED: Hardened prompt to ensure the final output is clean and not a question ---
            executionPrompt = `Your task is to rewrite the 'Original User Prompt' to meet the 'Goal' by thinking step-by-step.
First, write down your reasoning.
Then, on a new line, provide the final, rewritten prompt prefixed with the exact phrase "Final Prompt:".

**CRITICAL RULE FOR THE FINAL PROMPT:** The text after "Final Prompt:" must be the complete, rewritten prompt, ready for immediate use. It MUST NOT ask any questions to the user.

**Goal:** ${strategyDecision.enhancement_goal}
**Original User Prompt:** --- ${prompt}`;
            break;
        case 'Contextual':
            const knowledgeGenPrompt = `Based on the user's prompt ("${prompt}"), generate 3-5 essential facts or key points that would provide necessary context for a large language model.`;
            const knowledge = await makeApiCall(apiKey, knowledgeGenPrompt);
            executionPrompt = `${baseInstruction}\n\nUse the following key points as context:\n${knowledge}\n\n**Goal:** ${strategyDecision.enhancement_goal}\n**Original User Prompt:** --- ${prompt}`;
            break;
        default:
            // For Directive, Exploratory, Reflective, Sequential, and Zero_Shot_Correction,
            // the goal from the strategist is descriptive enough to guide the execution.
            executionPrompt = `${baseInstruction}\n\n**Goal:** ${strategyDecision.enhancement_goal}\n**Original User Prompt:** --- ${prompt}`;
            break;
    }

    let enhancedText = await makeApiCall(apiKey, executionPrompt);
    
    // --- Post-Processing and Cleaning ---
    if (strategyDecision.chosen_strategy === 'Chain_of_Thought') {
        const finalPromptIndex = enhancedText.lastIndexOf('Final Prompt:');
        if (finalPromptIndex !== -1) {
            enhancedText = enhancedText.substring(finalPromptIndex + 'Final Prompt:'.length);
        }
    }
    
    enhancedText = enhancedText
        .replace(/^Here is the enhanced prompt:\s*/i, '')
        .replace(/^Sure, here's the revised prompt:\s*/i, '')
        .replace(/^Certainly, here is the enhanced prompt:\s*/i, '')
        .replace(/```(json|javascript|text)?/g, '')
        .replace(/^["']|["']$/g, '')
        .trim();


    if (!enhancedText) {
        throw new Error("The execution model returned an empty prompt after cleaning.");
    }

    return { status: 'success', text: enhancedText };
}