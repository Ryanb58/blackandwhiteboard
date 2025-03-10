/**
 * Storage Manager for Black and White Board
 * Handles OPFS storage operations and file management
 */

export class StorageManager {
  /**
   * Create a new Storage Manager
   */
  constructor() {
    this.root = null;
    this.db = null;
    this.dbName = 'blackandwhiteboard-db';
    this.storeName = 'whiteboards';
    this.initialized = false;
  }
  
  /**
   * Initialize the storage manager
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Request access to OPFS
      this.root = await navigator.storage.getDirectory();
      
      // Initialize IndexedDB for metadata
      await this.initializeDatabase();
      
      this.initialized = true;
      console.log('Storage Manager initialized');
    } catch (error) {
      console.error('Failed to initialize Storage Manager:', error);
      throw error;
    }
  }
  
  /**
   * Initialize the IndexedDB database for metadata
   * @returns {Promise<void>}
   */
  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB opened successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for whiteboard metadata
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('created', 'created', { unique: false });
          store.createIndex('modified', 'modified', { unique: false });
          console.log('Object store created');
        }
      };
    });
  }
  
  /**
   * Save a whiteboard to OPFS
   * @param {string} name - The name of the whiteboard
   * @param {string} svgContent - The SVG content to save
   * @param {string} [id] - Optional ID for updating existing whiteboard
   * @returns {Promise<string>} The ID of the saved whiteboard
   */
  async saveWhiteboard(name, svgContent, id = null) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Generate a new ID if not provided
      const whiteboardId = id || crypto.randomUUID();
      const now = new Date().toISOString();
      
      // Save the SVG content to OPFS
      const fileHandle = await this.root.getFileHandle(`${whiteboardId}.svg`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(svgContent);
      await writable.close();
      
      // Generate a thumbnail (simplified for now)
      const thumbnailData = this.generateThumbnail(svgContent);
      
      // Save or update metadata in IndexedDB
      const metadata = {
        id: whiteboardId,
        name: name,
        created: id ? (await this.getWhiteboardMetadata(id))?.created || now : now,
        modified: now,
        size: svgContent.length,
        thumbnail: thumbnailData
      };
      
      await this.saveMetadata(metadata);
      
      console.log(`Whiteboard "${name}" saved with ID: ${whiteboardId}`);
      return whiteboardId;
    } catch (error) {
      console.error('Failed to save whiteboard:', error);
      throw error;
    }
  }
  
  /**
   * Load a whiteboard from OPFS
   * @param {string} id - The ID of the whiteboard to load
   * @returns {Promise<{content: string, metadata: Object}>} The whiteboard content and metadata
   */
  async loadWhiteboard(id) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Get the file from OPFS
      const fileHandle = await this.root.getFileHandle(`${id}.svg`);
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      // Get metadata from IndexedDB
      const metadata = await this.getWhiteboardMetadata(id);
      
      console.log(`Whiteboard "${metadata.name}" loaded`);
      return { content, metadata };
    } catch (error) {
      console.error(`Failed to load whiteboard with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a whiteboard from OPFS
   * @param {string} id - The ID of the whiteboard to delete
   * @returns {Promise<void>}
   */
  async deleteWhiteboard(id) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Delete the file from OPFS
      await this.root.removeEntry(`${id}.svg`);
      
      // Delete metadata from IndexedDB
      await this.deleteMetadata(id);
      
      console.log(`Whiteboard with ID ${id} deleted`);
    } catch (error) {
      console.error(`Failed to delete whiteboard with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Rename a whiteboard
   * @param {string} id - The ID of the whiteboard to rename
   * @param {string} newName - The new name for the whiteboard
   * @returns {Promise<void>}
   */
  async renameWhiteboard(id, newName) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Get existing metadata
      const metadata = await this.getWhiteboardMetadata(id);
      if (!metadata) {
        throw new Error(`Whiteboard with ID ${id} not found`);
      }
      
      // Update metadata with new name
      metadata.name = newName;
      metadata.modified = new Date().toISOString();
      
      // Save updated metadata
      await this.saveMetadata(metadata);
      
      console.log(`Whiteboard renamed to "${newName}"`);
    } catch (error) {
      console.error(`Failed to rename whiteboard with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * List all saved whiteboards
   * @returns {Promise<Array>} Array of whiteboard metadata objects
   */
  async listWhiteboards() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Sort by modified date (newest first)
        const whiteboards = request.result.sort((a, b) => {
          return new Date(b.modified) - new Date(a.modified);
        });
        
        console.log(`Found ${whiteboards.length} whiteboards`);
        resolve(whiteboards);
      };
      
      request.onerror = (event) => {
        console.error('Failed to list whiteboards:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  /**
   * Save metadata to IndexedDB
   * @param {Object} metadata - The metadata to save
   * @returns {Promise<void>}
   * @private
   */
  async saveMetadata(metadata) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(metadata);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('Failed to save metadata:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  /**
   * Get metadata for a whiteboard
   * @param {string} id - The ID of the whiteboard
   * @returns {Promise<Object>} The whiteboard metadata
   * @private
   */
  async getWhiteboardMetadata(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        console.error('Failed to get metadata:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  /**
   * Delete metadata from IndexedDB
   * @param {string} id - The ID of the whiteboard
   * @returns {Promise<void>}
   * @private
   */
  async deleteMetadata(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('Failed to delete metadata:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  /**
   * Generate a thumbnail from SVG content
   * @param {string} svgContent - The SVG content
   * @returns {string} Base64-encoded thumbnail data
   * @private
   */
  generateThumbnail(svgContent) {
    // This is a simplified placeholder
    // In a real implementation, we would render the SVG to a canvas and create a thumbnail
    return 'data:image/svg+xml;base64,' + btoa(svgContent.substring(0, 1000));
  }
}
