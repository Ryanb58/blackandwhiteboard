# Technical Context

## Technologies Used

### Core Technologies
- **HTML5**: Structure and semantic markup
- **CSS3**: Styling and responsive design
- **JavaScript (ES6+)**: Core application logic and interactivity
- **HTML Canvas API**: Primary drawing surface
- **SVG**: Format for storing and exporting drawings
- **OPFS (Origin Private File System)**: Local storage mechanism

### Development Tools
- **Git**: Version control
- **ESLint**: Code quality and style enforcement
- **Prettier**: Code formatting
- **npm**: Package management (minimal dependencies)
- **Vite**: Build tool and development server

## Development Setup

### Project Structure
```
blackandwhiteboard/
├── index.html              # Main entry point
├── styles/                 # CSS styles
│   ├── main.css            # Main stylesheet
│   ├── canvas.css          # Canvas-specific styles
│   └── toolbar.css         # Toolbar-specific styles
├── scripts/                # JavaScript modules
│   ├── app.js              # Application initialization
│   ├── components/         # UI components
│   │   ├── canvas.js       # Canvas component
│   │   └── toolbar.js      # Toolbar component
│   ├── drawing/            # Drawing functionality
│   │   ├── drawingEngine.js # Core drawing logic
│   │   ├── commands.js     # Command pattern implementation
│   │   └── tools.js        # Drawing tools implementation
│   └── storage/            # Storage functionality
│       ├── storageManager.js # OPFS interface
│       └── exportManager.js  # SVG export functionality
├── assets/                 # Static assets
│   └── icons/              # UI icons
└── memory-bank/            # Project documentation
```

### Build and Run
- Development: `npm run dev` - Starts Vite development server
- Build: `npm run build` - Creates production build in the /docs folder for GitHub Pages
- Preview: `npm run preview` - Previews production build locally

## Technical Constraints

### Browser Compatibility
- **Target Browsers**: Latest versions of Chrome and Firefox
- **Required APIs**:
  - Canvas API
  - SVG support
  - OPFS API (Origin Private File System)
  - ES6+ JavaScript features

### Performance Considerations
- Drawing operations must be optimized for real-time responsiveness
- Canvas size and rendering must handle infinite panning efficiently
- Memory management for undo/redo history to prevent excessive memory usage
- SVG generation should be optimized for larger drawings

### Storage Limitations
- OPFS is limited to the browser's storage allocation
- Export functionality needed for persistence beyond the browser

## Dependencies

### Core Dependencies
- None (Vanilla JavaScript approach)

### Development Dependencies
- **Vite**: Fast development server and build tool
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting

## API Usage

### Canvas API
Used for:
- Real-time drawing operations
- Capturing mouse/touch input
- Rendering the current drawing state
- Managing the viewport for infinite canvas

### OPFS API
Used for:
- Saving whiteboards with user-defined names
- Loading previously saved whiteboards
- Managing whiteboard files

### File System Access API
Used for:
- Exporting SVG files to the user's local file system

## Testing Strategy
- Manual testing across supported browsers
- Focus on drawing performance and accuracy
- Storage persistence verification
- Export functionality validation

## Deployment
- **GitHub Pages**: The application is configured to be deployed on GitHub Pages
  - Build output is directed to the /docs folder
  - When pushed to the main branch, GitHub Pages will serve content from this folder
  - All file paths use relative references (./path) instead of absolute paths (/path)
  - Vite is configured with base: './' to ensure assets are correctly referenced
  - This provides a simple, free hosting solution for the static web application
