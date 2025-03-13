# Simple Colab Ghost Text

A minimal Chrome extension that provides ghost text suggestions in Google Colab notebooks. This extension is designed as a learning resource for building Chrome extensions that interact with web-based code editors.

## Features

- Provides a ghost text suggestion when a user types "My cat is " in a Colab cell
- The suggestion will be " a madhouse"
- Focused only on Google Colab integration
- Simple, human-readable code structure

## How It Works

This extension uses the following components:

1. **manifest.json**: Defines the extension metadata, permissions, and resources
2. **serviceWorker.js**: Handles background tasks and communication
3. **contentScript.js**: Injects the main script into the page
4. **script.js**: Contains the core logic for providing ghost text suggestions

The extension works by:

1. Detecting when the user is on a Google Colab page
2. Injecting code that hooks into Monaco editor (the editor used by Colab)
3. Monitoring text input in code cells
4. Providing ghost text suggestions when specific text patterns are detected

## Architecture

- **Content Script**: Runs in the context of the web page and injects our main script
- **Service Worker**: Handles background tasks and messaging
- **Main Script**: Contains the logic for detecting text and providing suggestions

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed and active

## Testing

1. Open Google Colab (https://colab.research.google.com/)
2. Create a new notebook
3. In a code cell, type "My cat is "
4. You should see a ghost text suggestion " a madhouse"

## Learning from this Code

This extension demonstrates:

- How to inject scripts into web pages
- How to interact with the Monaco editor
- How to provide ghost text suggestions
- Basic Chrome extension architecture

The code is intentionally kept simple and well-commented to serve as a learning resource.

## Credits

This extension was created as a simplified version of a more complex codebase for educational purposes.
