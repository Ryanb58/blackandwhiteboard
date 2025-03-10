/**
 * Toast Manager for Black and White Board
 * Handles toast notifications for user feedback
 */

export class ToastManager {
  /**
   * Create a new Toast Manager
   */
  constructor() {
    this.container = document.getElementById('toast-container');
    this.toasts = [];
    this.nextId = 1;
  }
  
  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - The type of toast ('success', 'error', 'info')
   * @param {number} duration - Duration in milliseconds
   * @returns {number} The ID of the toast
   */
  show(message, type = 'info', duration = 3000) {
    const id = this.nextId++;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.dataset.id = id;
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.remove(id));
    
    // Assemble toast
    toast.appendChild(messageEl);
    toast.appendChild(closeBtn);
    
    // Add to container
    this.container.appendChild(toast);
    
    // Store reference
    this.toasts.push({ id, element: toast, timeout: null });
    
    // Set timeout for auto-removal
    const timeout = setTimeout(() => {
      this.remove(id);
    }, duration);
    
    // Update timeout reference
    const index = this.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      this.toasts[index].timeout = timeout;
    }
    
    return id;
  }
  
  /**
   * Show a success toast
   * @param {string} message - The message to display
   * @param {number} duration - Duration in milliseconds
   * @returns {number} The ID of the toast
   */
  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }
  
  /**
   * Show an error toast
   * @param {string} message - The message to display
   * @param {number} duration - Duration in milliseconds
   * @returns {number} The ID of the toast
   */
  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }
  
  /**
   * Show an info toast
   * @param {string} message - The message to display
   * @param {number} duration - Duration in milliseconds
   * @returns {number} The ID of the toast
   */
  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
  
  /**
   * Remove a toast by ID
   * @param {number} id - The ID of the toast to remove
   */
  remove(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const { element, timeout } = this.toasts[index];
    
    // Clear timeout if exists
    if (timeout) {
      clearTimeout(timeout);
    }
    
    // Add removing class for animation
    element.classList.add('removing');
    
    // Remove after animation
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 300);
    
    // Remove from array
    this.toasts.splice(index, 1);
  }
  
  /**
   * Remove all toasts
   */
  removeAll() {
    // Copy array to avoid issues during iteration
    const toastsCopy = [...this.toasts];
    
    // Remove each toast
    toastsCopy.forEach(toast => {
      this.remove(toast.id);
    });
  }
}

// Create singleton instance
const toastManager = new ToastManager();
export default toastManager;
