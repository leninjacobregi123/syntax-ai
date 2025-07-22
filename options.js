// Function to save the API key to chrome.storage
function saveOptions() {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({
        geminiApiKey: apiKey
    }, () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'API Key saved successfully!';
        status.style.opacity = 1;
        setTimeout(() => {
            status.style.opacity = 0;
        }, 2000);
    });
}

// Function to restore the saved API key when the options page is opened
function restoreOptions() {
    chrome.storage.sync.get({
        geminiApiKey: '' // Default to an empty string if not set
    }, (items) => {
        document.getElementById('apiKey').value = items.geminiApiKey;
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
