// Content script for Simple Colab Ghost Text extension
// This script injects the main script.js into the page

// Get the extension ID to pass to the injected script
const extensionId = chrome.runtime.id;

// Create a script element to inject our main script
function injectScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('script.js') + '?id=' + extensionId;
  script.onload = function() {
    // Clean up after injection
    this.remove();
  };
  
  // Inject the script into the page
  (document.head || document.documentElement).appendChild(script);
  
  // Notify the service worker that we've injected the script
  chrome.runtime.sendMessage({ type: 'scriptInjected' });
}

// Inject the script when the page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectScript);
} else {
  injectScript();
}

// Listen for messages from the injected script
window.addEventListener('message', function(event) {
  // Only accept messages from the same frame
  if (event.source !== window) return;
  
  // Check if the message is from our script
  if (event.data.type && event.data.type === 'FROM_GHOST_TEXT') {
    // Forward the message to the service worker
    chrome.runtime.sendMessage(event.data);
  }
}, false);
