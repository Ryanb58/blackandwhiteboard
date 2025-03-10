/**
 * Main application entry point for Black and White Board
 */

import { CanvasComponent } from './components/canvas.js';
import { ToolbarComponent } from './components/toolbar.js';
import { FileBrowserComponent } from './components/fileBrowser.js';
import { StorageManager } from './storage/storageManager.js';
import toastManager from './utils/toastManager.js';

class App {
  constructor() {
    this.currentColor = 'black';
    this.currentTool = 'pen'; // Default tool is pen
    this.drawingHistory = [];
    this.redoStack = [];
    this.isDrawing = false;
    this.whiteboardName = 'Untitled Whiteboard';
    this.currentWhiteboardId = null;
    
    // Initialize storage manager
    this.storageManager = new StorageManager();
    
    // Initialize components
    this.canvas = new CanvasComponent(this);
    this.toolbar = new ToolbarComponent(this);
    this.fileBrowser = new FileBrowserComponent(this);
    
    // Initialize the application
    this.init();
  }
  
  /**
   * Initialize the application
   */
  async init() {
    try {
      // Initialize storage manager
      await this.storageManager.initialize();
      
      // Initialize file browser
      await this.fileBrowser.initialize();
      
      // Set initial state
      this.updateWhiteboardName(this.whiteboardName);
      this.updateUndoRedoState();
      
      // Log initialization
      console.log('Black and White Board initialized');
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }
  
  /**
   * Set the current drawing color
   * @param {string} color - The color to set
   */
  setColor(color) {
    this.currentColor = color;
    // When selecting a color, switch to pen tool
    if (this.currentTool === 'eraser') {
      this.setTool('pen');
      this.toolbar.updateToolState();
    }
    console.log(`Color set to: ${color}`);
  }
  
  /**
   * Set the current drawing tool
   * @param {string} tool - The tool to set ('pen' or 'eraser')
   */
  setTool(tool) {
    this.currentTool = tool;
    console.log(`Tool set to: ${tool}`);
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
   */
  async saveWhiteboard() {
    try {
      // Generate SVG content
      const svgContent = this.canvas.generateSVG();
      
      // Save to storage
      const id = await this.storageManager.saveWhiteboard(
        this.whiteboardName,
        svgContent,
        this.currentWhiteboardId
      );
      
      // Update current whiteboard ID
      this.currentWhiteboardId = id;
      
      // Show success notification
      toastManager.success(`Whiteboard "${this.whiteboardName}" saved successfully`);
      
      console.log(`Whiteboard "${this.whiteboardName}" saved with ID: ${id}`);
    } catch (error) {
      console.error('Failed to save whiteboard:', error);
      toastManager.error('Failed to save whiteboard. Please try again.');
    }
  }
  
  /**
   * Export the current whiteboard as SVG
   */
  exportWhiteboard() {
    try {
      // Generate SVG content
      const svgContent = this.canvas.generateSVG();
      
      // Create a blob from the SVG content
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.whiteboardName}.svg`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success notification
      toastManager.success(`Whiteboard exported as "${this.whiteboardName}.svg"`);
      
      console.log(`Whiteboard "${this.whiteboardName}" exported as SVG`);
    } catch (error) {
      console.error('Failed to export whiteboard:', error);
      toastManager.error('Failed to export whiteboard. Please try again.');
    }
  }
  
  /**
   * Show the file browser
   */
  showFileBrowser() {
    this.fileBrowser.showModal();
  }
  
  /**
   * Open a whiteboard
   * @param {string} id - The ID of the whiteboard to open
   * @param {string} content - The SVG content of the whiteboard
   * @param {string} name - The name of the whiteboard
   */
  async openWhiteboard(id, content, name) {
    try {
      // Parse SVG content to drawing commands
      this.drawingHistory = this.parseSVGToCommands(content);
      this.redoStack = [];
      
      // Update whiteboard name and ID
      this.currentWhiteboardId = id;
      this.updateWhiteboardName(name);
      
      // Redraw canvas
      this.canvas.redraw();
      
      // Update UI
      this.updateUndoRedoState();
      
      // Show success notification
      toastManager.info(`Opened whiteboard: "${name}"`);
      
      console.log(`Opened whiteboard: ${name}`);
    } catch (error) {
      console.error('Failed to open whiteboard:', error);
      toastManager.error('Failed to open whiteboard. Please try again.');
    }
  }
  
  /**
   * Create a new whiteboard
   */
  createNewWhiteboard() {
    // Clear canvas and history
    this.drawingHistory = [];
    this.redoStack = [];
    this.currentWhiteboardId = null;
    
    // Reset whiteboard name
    this.updateWhiteboardName('Untitled Whiteboard');
    
    // Redraw canvas
    this.canvas.redraw();
    
    // Update UI
    this.updateUndoRedoState();
    
    // Show notification
    toastManager.info('New whiteboard created');
    
    console.log('Created new whiteboard');
  }
  
  /**
   * Parse SVG content to drawing commands
   * @param {string} svgContent - The SVG content to parse
   * @returns {Array} Array of drawing commands
   */
  parseSVGToCommands(svgContent) {
    // This is a simplified implementation
    // In a real implementation, we would parse the SVG paths to drawing commands
    
    const commands = [];
    
    try {
      // Create a DOM parser
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      
      // Get all path elements
      const paths = svgDoc.querySelectorAll('path');
      
      // Convert each path to a drawing command
      paths.forEach(path => {
        const d = path.getAttribute('d');
        const stroke = path.getAttribute('stroke');
        const strokeWidth = parseFloat(path.getAttribute('stroke-width') || '2');
        
        // Skip if no path data
        if (!d) return;
        
        // Parse path data to extract points
        const points = this.parsePathData(d);
        
        // Create drawing command
        if (points.length >= 2) {
          commands.push({
            type: 'path',
            tool: 'pen', // Assume all paths are pen strokes
            color: stroke,
            points: points,
            lineWidth: strokeWidth
          });
        }
      });
    } catch (error) {
      console.error('Failed to parse SVG:', error);
    }
    
    return commands;
  }
  
  /**
   * Parse SVG path data to extract points
   * @param {string} d - The path data string
   * @returns {Array} Array of points
   */
  parsePathData(d) {
    const points = [];
    
    // Simple parsing of M and L commands
    // This is a simplified implementation
    const parts = d.trim().split(/\s+/);
    
    let currentX = 0;
    let currentY = 0;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === 'M' || part === 'L') {
        // Move or line command, followed by coordinates
        if (i + 2 < parts.length) {
          const x = parseFloat(parts[i + 1]);
          const y = parseFloat(parts[i + 2]);
          
          if (!isNaN(x) && !isNaN(y)) {
            points.push({ x, y });
            currentX = x;
            currentY = y;
          }
          
          i += 2; // Skip the coordinates
        }
      } else if (part.startsWith('M') || part.startsWith('L')) {
        // Combined command and coordinates (e.g., M100,100)
        const coords = part.substring(1).split(',');
        if (coords.length === 2) {
          const x = parseFloat(coords[0]);
          const y = parseFloat(coords[1]);
          
          if (!isNaN(x) && !isNaN(y)) {
            points.push({ x, y });
            currentX = x;
            currentY = y;
          }
        }
      }
    }
    
    return points;
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
