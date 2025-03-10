/**
 * File Browser Component for Black and White Board
 * Handles UI for browsing and managing saved whiteboards
 */

export class FileBrowserComponent {
  /**
   * Create a new File Browser component
   * @param {Object} app - The main application instance
   */
  constructor(app) {
    this.app = app;
    this.storageManager = app.storageManager;
    this.modal = null;
    this.fileList = [];
    this.searchTerm = '';
    this.currentAction = null;
  }
  
  /**
   * Initialize the file browser component
   * @returns {Promise<void>}
   */
  async initialize() {
    // Create modal dialog
    this.createModal();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('File Browser component initialized');
  }
  
  /**
   * Create the modal dialog HTML structure
   */
  createModal() {
    // Create modal elements
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay';
    this.modal.style.display = 'none';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'File Browser';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-btn';
    closeButton.textContent = '×';
    closeButton.setAttribute('title', 'Close');
    closeButton.addEventListener('click', () => this.hideModal());
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Create search and action bar
    const actionBar = document.createElement('div');
    actionBar.className = 'action-bar';
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'search-input';
    searchInput.placeholder = 'Search whiteboards...';
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.renderFileList();
    });
    
    searchContainer.appendChild(searchInput);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    const newButton = document.createElement('button');
    newButton.className = 'action-btn';
    newButton.textContent = 'New Whiteboard';
    newButton.addEventListener('click', () => this.createNewWhiteboard());
    
    buttonContainer.appendChild(newButton);
    
    actionBar.appendChild(searchContainer);
    actionBar.appendChild(buttonContainer);
    
    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    const fileListContainer = document.createElement('div');
    fileListContainer.id = 'file-list-container';
    modalBody.appendChild(fileListContainer);
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(actionBar);
    modalContent.appendChild(modalBody);
    this.modal.appendChild(modalContent);
    
    // Add modal to the document
    document.body.appendChild(this.modal);
  }
  
  /**
   * Set up event listeners for file operations
   */
  setupEventListeners() {
    // Global event listener for action menu clicks
    document.addEventListener('click', (e) => {
      if (!e.target.matches('.action-menu-btn, .action-menu-item')) {
        this.closeAllActionMenus();
      }
    });
    
    // Add keyboard shortcut (Ctrl+O) to open file browser
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        this.showModal();
      }
    });
  }
  
  /**
   * Show the file browser modal
   * @returns {Promise<void>}
   */
  async showModal() {
    // Refresh the file list
    await this.refreshFileList();
    
    // Show the modal
    this.modal.style.display = 'flex';
    
    // Focus the search input
    setTimeout(() => {
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  }
  
  /**
   * Hide the file browser modal
   */
  hideModal() {
    this.modal.style.display = 'none';
    this.searchTerm = '';
    this.closeAllActionMenus();
  }
  
  /**
   * Refresh the file list from storage
   * @returns {Promise<void>}
   */
  async refreshFileList() {
    try {
      // Get updated file list from storage manager
      this.fileList = await this.storageManager.listWhiteboards();
      
      // Render the file list
      this.renderFileList();
    } catch (error) {
      console.error('Failed to refresh file list:', error);
      this.showError('Failed to load whiteboards. Please try again.');
    }
  }
  
  /**
   * Render the file list in the modal
   */
  renderFileList() {
    const container = document.getElementById('file-list-container');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Filter files based on search term
    const filteredFiles = this.searchTerm
      ? this.fileList.filter(file => file.name.toLowerCase().includes(this.searchTerm))
      : this.fileList;
    
    if (filteredFiles.length === 0) {
      // Show empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      
      const message = this.searchTerm
        ? `No whiteboards found matching "${this.searchTerm}"`
        : 'No whiteboards saved yet. Create a new whiteboard to get started.';
      
      emptyState.textContent = message;
      container.appendChild(emptyState);
      return;
    }
    
    // Create table for file list
    const table = document.createElement('table');
    table.className = 'file-list';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const nameHeader = document.createElement('th');
    nameHeader.textContent = 'Name';
    
    const dateHeader = document.createElement('th');
    dateHeader.textContent = 'Modified';
    
    const actionsHeader = document.createElement('th');
    actionsHeader.textContent = 'Actions';
    
    headerRow.appendChild(nameHeader);
    headerRow.appendChild(dateHeader);
    headerRow.appendChild(actionsHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    filteredFiles.forEach(file => {
      const row = document.createElement('tr');
      
      // Name cell
      const nameCell = document.createElement('td');
      nameCell.className = 'file-name';
      nameCell.textContent = file.name;
      
      // Date cell
      const dateCell = document.createElement('td');
      dateCell.className = 'file-date';
      dateCell.textContent = this.formatDate(file.modified);
      
      // Actions cell
      const actionsCell = document.createElement('td');
      actionsCell.className = 'file-actions';
      
      const openButton = document.createElement('button');
      openButton.className = 'action-btn open-btn';
      openButton.textContent = 'Open';
      openButton.addEventListener('click', () => this.openFile(file.id));
      
      const actionMenuButton = document.createElement('button');
      actionMenuButton.className = 'action-menu-btn';
      actionMenuButton.textContent = '⋮';
      actionMenuButton.setAttribute('data-id', file.id);
      actionMenuButton.addEventListener('click', (e) => this.toggleActionMenu(e));
      
      const actionMenu = document.createElement('div');
      actionMenu.className = 'action-menu';
      actionMenu.id = `action-menu-${file.id}`;
      actionMenu.style.display = 'none';
      
      const renameItem = document.createElement('button');
      renameItem.className = 'action-menu-item';
      renameItem.textContent = 'Rename';
      renameItem.addEventListener('click', () => this.renameFile(file.id, file.name));
      
      const duplicateItem = document.createElement('button');
      duplicateItem.className = 'action-menu-item';
      duplicateItem.textContent = 'Duplicate';
      duplicateItem.addEventListener('click', () => this.duplicateFile(file.id));
      
      const deleteItem = document.createElement('button');
      deleteItem.className = 'action-menu-item delete-item';
      deleteItem.textContent = 'Delete';
      deleteItem.addEventListener('click', () => this.deleteFile(file.id, file.name));
      
      actionMenu.appendChild(renameItem);
      actionMenu.appendChild(duplicateItem);
      actionMenu.appendChild(deleteItem);
      
      actionsCell.appendChild(openButton);
      actionsCell.appendChild(actionMenuButton);
      actionsCell.appendChild(actionMenu);
      
      row.appendChild(nameCell);
      row.appendChild(dateCell);
      row.appendChild(actionsCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
  }
  
  /**
   * Toggle the action menu for a file
   * @param {Event} e - The click event
   */
  toggleActionMenu(e) {
    const fileId = e.target.getAttribute('data-id');
    const menuId = `action-menu-${fileId}`;
    const menu = document.getElementById(menuId);
    
    // Close all other menus first
    this.closeAllActionMenus();
    
    // Toggle this menu
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
    
    // Prevent the click from bubbling up
    e.stopPropagation();
  }
  
  /**
   * Close all action menus
   */
  closeAllActionMenus() {
    const menus = document.querySelectorAll('.action-menu');
    menus.forEach(menu => {
      menu.style.display = 'none';
    });
  }
  
  /**
   * Open a file
   * @param {string} id - The ID of the file to open
   * @returns {Promise<void>}
   */
  async openFile(id) {
    try {
      // Load the whiteboard
      const { content, metadata } = await this.storageManager.loadWhiteboard(id);
      
      // Update the app with the loaded whiteboard
      await this.app.openWhiteboard(id, content, metadata.name);
      
      // Hide the modal
      this.hideModal();
    } catch (error) {
      console.error(`Failed to open whiteboard with ID ${id}:`, error);
      this.showError('Failed to open whiteboard. Please try again.');
    }
  }
  
  /**
   * Create a new whiteboard
   */
  createNewWhiteboard() {
    // Create a new whiteboard in the app
    this.app.createNewWhiteboard();
    
    // Hide the modal
    this.hideModal();
  }
  
  /**
   * Rename a file
   * @param {string} id - The ID of the file to rename
   * @param {string} currentName - The current name of the file
   */
  renameFile(id, currentName) {
    // Close action menu
    this.closeAllActionMenus();
    
    // Prompt for new name
    const newName = prompt('Enter new name for the whiteboard:', currentName);
    
    if (newName && newName !== currentName) {
      this.storageManager.renameWhiteboard(id, newName)
        .then(() => {
          // Refresh the file list
          return this.refreshFileList();
        })
        .catch(error => {
          console.error(`Failed to rename whiteboard with ID ${id}:`, error);
          this.showError('Failed to rename whiteboard. Please try again.');
        });
    }
  }
  
  /**
   * Duplicate a file
   * @param {string} id - The ID of the file to duplicate
   * @returns {Promise<void>}
   */
  async duplicateFile(id) {
    // Close action menu
    this.closeAllActionMenus();
    
    try {
      // Load the whiteboard
      const { content, metadata } = await this.storageManager.loadWhiteboard(id);
      
      // Create a new name with "Copy of" prefix
      const newName = `Copy of ${metadata.name}`;
      
      // Save as a new whiteboard
      await this.storageManager.saveWhiteboard(newName, content);
      
      // Refresh the file list
      await this.refreshFileList();
    } catch (error) {
      console.error(`Failed to duplicate whiteboard with ID ${id}:`, error);
      this.showError('Failed to duplicate whiteboard. Please try again.');
    }
  }
  
  /**
   * Delete a file
   * @param {string} id - The ID of the file to delete
   * @param {string} name - The name of the file
   */
  deleteFile(id, name) {
    // Close action menu
    this.closeAllActionMenus();
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      this.storageManager.deleteWhiteboard(id)
        .then(() => {
          // Refresh the file list
          return this.refreshFileList();
        })
        .catch(error => {
          console.error(`Failed to delete whiteboard with ID ${id}:`, error);
          this.showError('Failed to delete whiteboard. Please try again.');
        });
    }
  }
  
  /**
   * Show an error message
   * @param {string} message - The error message to show
   */
  showError(message) {
    alert(message);
  }
  
  /**
   * Format a date string
   * @param {string} dateString - The ISO date string
   * @returns {string} Formatted date string
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is today
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise, return formatted date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
