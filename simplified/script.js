/**
 * Simple Colab Ghost Text
 * 
 * This script provides ghost text suggestions in Google Colab notebooks.
 * It's a simplified version extracted from a more complex codebase for learning purposes.
 */

(function() {
  "use strict";

  // Get the extension ID from the URL parameters
  const extensionId = new URLSearchParams(document.currentScript.src.split("?")[1]).get("id");

  // Notify the extension that the script loaded successfully
  chrome.runtime.sendMessage(extensionId, {
    type: "success"
  });

  // Class to represent a text range in the editor
  class TextRange {
    constructor(startPos, endPos) {
      this.startLineNumber = startPos.lineNumber;
      this.startColumn = startPos.column;
      this.endLineNumber = endPos.lineNumber;
      this.endColumn = endPos.column;
    }
  }

  // Constants for editor platforms
  const EditorPlatform = {
    UNSPECIFIED: 0,
    COLAB: 1,
    CUSTOM: 2
  };

  // Class that provides ghost text completions
  class GhostTextProvider {
    constructor(extensionId) {
      this.extensionId = extensionId;
      this.modelUriToEditor = new Map();
      
      // Detect which platform we're on
      this.editorPlatform = EditorPlatform.UNSPECIFIED;
      if (/https:\/\/colab.research\.google\.com\/.*/.test(window.location.href)) {
        this.editorPlatform = EditorPlatform.COLAB;
      }
    }

    // Get information about the current IDE
    getIdeInfo() {
      if (this.editorPlatform === EditorPlatform.COLAB) {
        return {
          ideName: "colab",
          ideVersion: window.colabVersionTag ?? "unknown"
        };
      }
      return {
        ideName: "unknown",
        ideVersion: "unknown"
      };
    }

    // Get the language ID from the editor model
    getLanguageId(editorModel) {
      return editorModel.getLanguageIdentifier ? 
        editorModel.getLanguageIdentifier().language : 
        editorModel.getLanguageId();
    }

    // Provide inline completions for the editor
    async provideInlineCompletions(editor, cursorPosition) {
      // Get the current text in the editor
      const currentText = editor.getValue();
      
      // Check if the text matches our trigger phrase
      if (currentText.startsWith("My cat is")) {
        // Return our hardcoded ghost text suggestion
        const startPos = editor.getPositionAt(currentText.length);
        const endPos = startPos;
        
        return {
          items: [{
            insertText: " a madhouse",
            text: " a madhouse",
            range: new TextRange(startPos, endPos),
            command: {
              id: "ghostText.acceptCompletion",
              title: "Accept Completion",
              arguments: ["hardcoded-completion", undefined]
            }
          }]
        };
      }
      
      // No suggestion for other text
      return { items: [] };
    }

    // Called when an editor is added
    addEditor(editor) {
      // Enable inline suggestions
      editor.updateOptions({
        inlineSuggest: {
          enabled: true
        }
      });
      
      // Track editor instance by its URI
      const editorUri = editor.getModel()?.uri.toString();
      if (editorUri) {
        this.modelUriToEditor.set(editorUri, editor);
      }
      
      // Update tracking when editor model changes
      editor.onDidChangeModel((modelChange) => {
        const oldUri = modelChange.oldModelUrl?.toString();
        if (oldUri) {
          this.modelUriToEditor.delete(oldUri);
        }
        
        const newUri = modelChange.newModelUrl?.toString();
        if (newUri) {
          this.modelUriToEditor.set(newUri, editor);
        }
      });
    }

    // Called when a completion is accepted
    async acceptedCompletion(completionId) {
      console.log(`Completion accepted: ${completionId}`);
      // You could add telemetry or other logic here
    }
  }

  // Patch the Monaco environment to add our ghost text provider
  Object.defineProperties(window, {
    MonacoEnvironment: {
      get() {
        if (!this._ghostText_MonacoEnvironment) {
          this._ghostText_MonacoEnvironment = {
            globalAPI: true
          };
        }
        return this._ghostText_MonacoEnvironment;
      },
      set(value) {
        if (value) {
          value.globalAPI = true;
        }
        this._ghostText_MonacoEnvironment = value;
      }
    },
    monaco: {
      get() {
        return this._ghostText_monaco;
      },
      set(monacoInstance) {
        // Store the monaco instance
        this._ghostText_monaco = monacoInstance;
        
        // Create our ghost text provider
        const ghostTextProvider = new GhostTextProvider(extensionId);
        
        // Register the provider with Monaco
        if (monacoInstance?.languages?.registerInlineCompletionsProvider) {
          setTimeout(() => {
            // Register for all file types
            monacoInstance.languages.registerInlineCompletionsProvider({
              pattern: "**"
            }, ghostTextProvider);
            
            // Register command to handle accepting completions
            monacoInstance.editor.registerCommand("ghostText.acceptCompletion", (_, __, completionId, callback) => {
              if (callback) {
                callback();
              }
              ghostTextProvider.acceptedCompletion(completionId).catch(error => {
                console.error(error);
              });
            });
            
            // Add our provider to all editors
            monacoInstance.editor.onDidCreateEditor((editor) => {
              ghostTextProvider.addEditor(editor);
            });
            
            console.log("Ghost Text: Activated for Monaco editor");
          });
        }
      }
    }
  });

  // For Colab specifically, we need to handle the case where Monaco is already loaded
  if (window.monaco) {
    const originalMonaco = window.monaco;
    delete window.monaco;
    window.monaco = originalMonaco;
  }

})();
