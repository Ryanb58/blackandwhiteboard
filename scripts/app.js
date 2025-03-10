/**
 * Main application entry point for Black and White Board
 */

import { CanvasComponent } from './components/canvas.js';
import { ToolbarComponent } from './components/toolbar.js';

class App {
  constructor() {
    this.currentColor = 'black';
    this.drawingHistory = [];
    this.redoStack = [];
    this.isDrawing = false;
    this.whiteboardName = 'Untitled Whiteboard';
    
    // Initialize components
    this.canvas = new CanvasComponent(this);
    this.toolbar = new ToolbarComponent(this);
    
    // Initialize the application
    this.init();
  }
  
  /**
   * Initialize the application
   */
  init() {
    // Set initial state
    this.updateWhiteboardName(this.whiteboardName);
    this.updateUndoRedoState();
    
    // Log initialization
    console.log('Black and White Board initialized');
  }
  
  /**
   * Set the current drawing color
   * @param {string} color - The color to set
   */
  setColor(color) {
    this.currentColor = color;
    console.log(`Color set to: ${color}`);
  }
  
  /**
   * Add a drawing command to history
   * @param {Object} command - The drawing command to add
   */
  addToHistory(command) {
    this.drawingHistory.push(command);
    this.redoStack = []; // Clear redo stack when new drawing occurs
    this.updateUndoRedoState();
  }
  
  /**
   * Undo the last drawing action
   */
  undo() {
    if (this.drawingHistory.length === 0) return;
    
    const command = this.drawingHistory.pop();
    this.redoStack.push(command);
    this.updateUndoRedoState();
    this.canvas.redraw();
    
    console.log('Undo action performed');
  }
  
  /**
   * Redo the last undone action
   */
  redo() {
    if (this.redoStack.length === 0) return;
    
    const command = this.redoStack.pop();
    this.drawingHistory.push(command);
    this.updateUndoRedoState();
    this.canvas.redraw();
    
    console.log('Redo action performed');
  }
  
  /**
   * Update the enabled state of undo/redo buttons
   */
  updateUndoRedoState() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) {
      undoBtn.disabled = this.drawingHistory.length === 0;
    }
    
    if (redoBtn) {
      redoBtn.disabled = this.redoStack.length === 0;
    }
  }
  
  /**
   * Update the whiteboard name
   * @param {string} name - The new name for the whiteboard
   */
  updateWhiteboardName(name) {
    this.whiteboardName = name;
    const nameInput = document.getElementById('whiteboard-name');
    if (nameInput) {
      nameInput.value = name;
    }
  }
  
  /**
   * Save the current whiteboard to OPFS
   * Note: This is a placeholder for the actual OPFS implementation
   */
  saveWhiteboard() {
    console.log(`Saving whiteboard: ${this.whiteboardName}`);
    // TODO: Implement OPFS storage
    alert(`Whiteboard "${this.whiteboardName}" saved (placeholder)`);
  }
  
  /**
   * Export the current whiteboard as SVG
   * Note: This is a placeholder for the actual SVG export implementation
   */
  exportWhiteboard() {
    console.log(`Exporting whiteboard: ${this.whiteboardName}`);
    // TODO: Implement SVG export
    alert(`Whiteboard "${this.whiteboardName}" exported as SVG (placeholder)`);
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
