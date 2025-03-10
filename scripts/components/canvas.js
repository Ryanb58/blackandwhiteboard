/**
 * Canvas Component for Black and White Board
 * Handles drawing functionality and canvas interactions
 */

export class CanvasComponent {
  /**
   * Create a new Canvas component
   * @param {Object} app - The main application instance
   */
  constructor(app) {
    this.app = app;
    this.canvas = document.getElementById('drawing-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    
    // Canvas transformation for infinite canvas (future implementation)
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;
    
    this.init();
  }
  
  /**
   * Initialize the canvas component
   */
  init() {
    this.setupCanvas();
    this.setupEventListeners();
  }
  
  /**
   * Set up the canvas dimensions and properties
   */
  setupCanvas() {
    // Set canvas dimensions to match container
    this.resizeCanvas();
    
    // Set default canvas properties
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = 2;
    
    // Handle window resize
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  /**
   * Resize the canvas to match its container
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    
    // Redraw canvas content after resize
    this.redraw();
  }
  
  /**
   * Set up event listeners for drawing
   */
  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());
    
    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.startDrawing(mouseEvent);
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.draw(mouseEvent);
    });
    
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
  }
  
  /**
   * Start drawing on the canvas
   * @param {Event} e - The mouse or touch event
   */
  startDrawing(e) {
    this.isDrawing = true;
    
    // Get the correct coordinates relative to the canvas
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
    
    // Create a new drawing command
    this.currentPath = {
      type: 'path',
      color: this.app.currentColor,
      points: [{ x: this.lastX, y: this.lastY }],
      lineWidth: this.ctx.lineWidth
    };
  }
  
  /**
   * Draw on the canvas as the mouse/touch moves
   * @param {Event} e - The mouse or touch event
   */
  draw(e) {
    if (!this.isDrawing) return;
    
    // Get the correct coordinates relative to the canvas
    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // Draw the line
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.app.currentColor;
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();
    
    // Add the point to the current path
    this.currentPath.points.push({ x: currentX, y: currentY });
    
    // Update last position
    this.lastX = currentX;
    this.lastY = currentY;
  }
  
  /**
   * Stop drawing on the canvas
   */
  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      
      // Add the completed path to history if it has points
      if (this.currentPath && this.currentPath.points.length > 1) {
        this.app.addToHistory(this.currentPath);
      }
      
      this.currentPath = null;
    }
  }
  
  /**
   * Redraw the canvas based on the drawing history
   */
  redraw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Redraw all paths from history
    for (const command of this.app.drawingHistory) {
      if (command.type === 'path') {
        this.drawPath(command);
      }
    }
  }
  
  /**
   * Draw a path from a command
   * @param {Object} command - The path command to draw
   */
  drawPath(command) {
    if (command.points.length < 2) return;
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = command.color;
    this.ctx.lineWidth = command.lineWidth || 2;
    
    // Move to the first point
    this.ctx.moveTo(command.points[0].x, command.points[0].y);
    
    // Draw lines to each subsequent point
    for (let i = 1; i < command.points.length; i++) {
      this.ctx.lineTo(command.points[i].x, command.points[i].y);
    }
    
    this.ctx.stroke();
  }
  
  /**
   * Generate SVG from the drawing history
   * Note: This is a placeholder for the actual SVG generation implementation
   * @returns {string} The SVG representation of the drawing
   */
  generateSVG() {
    // This is a placeholder for the actual SVG generation
    // In a real implementation, this would convert the drawing history to SVG paths
    
    const svgWidth = this.canvas.width;
    const svgHeight = this.canvas.height;
    
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add a background rectangle
    svg += `<rect width="100%" height="100%" fill="white"/>`;
    
    // Convert each path in the drawing history to an SVG path
    for (const command of this.app.drawingHistory) {
      if (command.type === 'path' && command.points.length >= 2) {
        svg += `<path d="`;
        
        // Start at the first point
        svg += `M${command.points[0].x},${command.points[0].y} `;
        
        // Add line segments to each subsequent point
        for (let i = 1; i < command.points.length; i++) {
          svg += `L${command.points[i].x},${command.points[i].y} `;
        }
        
        svg += `" stroke="${command.color}" stroke-width="${command.lineWidth || 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
    }
    
    svg += `</svg>`;
    return svg;
  }
}
