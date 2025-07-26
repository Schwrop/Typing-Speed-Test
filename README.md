
# Typing Speed Test

A modern web app to test and improve your typing speed and accuracy. Type through continuous text passages with smooth line transitions and track your performance over time.

## Features
- Random text selection from PoetryDB API with local fallback
- Real-time WPM calculation and accuracy tracking
- Multi-line typing with smooth transitions and next line preview
- Visual charts and tables for performance metrics
- Keyboard shortcuts and paste prevention
- Progress tracking with improvement highlighting
- Previous line navigation with backspace support

## Technologies Used
- HTML, CSS, JavaScript
- Chart.js for data visualization
- PoetryDB API for dynamic text content
- LocalStorage for metrics persistence

## File Structure
```
index.html           # Main HTML structure
style.css            # Responsive styling
js/
  main.js            # Core application state and text queue management
  eventHandlers.js   # Keyboard input and user interactions
  textService.js     # API integration and text fetching
  uiService.js       # DOM rendering and visual feedback
  metricsService.js  # Typing metrics calculation
  timerService.js    # Test timer functionality
  progressService.js # Performance charts and progress tracking
  texts.json         # Local fallback text passages
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Schwrop/Typing-Speed-Test.git
   ```
2. Open the project folder in Visual Studio Code.
3. Install the **Live Server** extension from the VS Code Extensions Marketplace.
4. Right-click on `index.html` and select **Open with Live Server**.
5. The app will open in your browser at `http://localhost:5500` or `http://127.0.0.1:5500`.

## Usage
- Start typing the displayed text directly
- Navigate through lines with automatic progression
- Use backspace to edit across lines and return to previous lines
- View real-time speed, accuracy, and character statistics
- Track progress with charts and tables

## Keyboard Shortcuts
- **Enter**: Restart test with new text
- **Esc**: Reset test and clear progress

## Progress Tracking
- Previous attempts shown in table and chart
- Improved WPM attempts highlighted in green