/**
 * Toolbar Component for Black and White Board
 * Handles UI interactions and controls
 */

export class ToolbarComponent {
  /**
   * Create a new Toolbar component
   * @param {Object} app - The main application instance
   */
  constructor(app) {
    this.app = app;
    this.init();
  }
  
  /**
   * Initialize the toolbar component
   */
  init() {
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for toolbar interactions
   */
  setupEventListeners() {
    // Color selection
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.handleColorSelection(button);
      });
    });
    
    // Whiteboard name input
    const nameInput = document.getElementById('whiteboard-name');
    if (nameInput) {
      nameInput.addEventListener('change', () => {
        this.app.updateWhiteboardName(nameInput.value);
      });
    }
    
    // Undo button
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        this.app.undo();
      });
    }
    
    // Redo button
    const redoBtn = document.getElementById('redo-btn');
    if (redoBtn) {
      redoBtn.addEventListener('click', () => {
        this.app.redo();
      });
    }
    
    // Save button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.app.saveWhiteboard();
      });
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.app.exportWhiteboard();
      });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+Z for Undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        this.app.undo();
      }
      
      // Ctrl+Y or Ctrl+Shift+Z for Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        this.app.redo();
      }
      
      // Ctrl+S for Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.app.saveWhiteboard();
      }
    });
  }
  
  /**
   * Handle color selection
   * @param {HTMLElement} selectedButton - The selected color button
   */
  handleColorSelection(selectedButton) {
    // Remove active class from all color buttons
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    // Add active class to the selected button
    selectedButton.classList.add('active');
    
    // Set the current color in the app
    const color = selectedButton.getAttribute('data-color');
    this.app.setColor(color);
  }
}
