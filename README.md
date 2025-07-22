
# Typing Speed Test

A modern web app to test and improve your typing speed and accuracy. Type through continuous text passages with smooth line transitions, track your performance, and visualize your progress over time.

## Features
- Random text selection from PoetryDB API with local JSON fallback
- Real-time calculation of typing speed (WPM) and continuous updates
- Accuracy and error tracking with instant feedback
- Multi-line typing with smooth transitions and text queue preview
- Direct typing interface with continuous text flow between lines
- Visual charts and tables to display performance metrics
- Responsive, intuitive, and modular UI with loading states
- Keyboard shortcuts for quick actions and paste prevention
- Progress tracking and improvement highlighting
- Buffer system for lag-free line transitions
- Previous line navigation with continuous backspace support
- Modular codebase for easy maintenance and extension

## Technologies Used
- HTML, CSS, JavaScript (ES6+ modules)
- Chart.js for data visualization
- PoetryDB API for dynamic text content
- LocalStorage for metrics persistence

## File Structure
```
index.html           # Main HTML file with multi-line text display
style.css            # Responsive stylesheet with animations
js/
  main.js            # Core application state and buffer management
  eventHandlers.js   # Keyboard input handling and user interactions
  textService.js     # API integration and text fetching with retry logic
  uiService.js       # DOM rendering and visual feedback
  metricsService.js  # Real-time typing metrics calculation
  timerService.js    # Test timer with callbacks
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
- Start typing the displayed text directly in the highlighted typing area (no input field needed).
- Navigate through multiple lines with automatic progression and smooth transitions.
- Use backspace to edit continuously across lines, including returning to previous lines.
- View your speed, accuracy, and errors in real time with continuous WPM updates.
- Check your progress with the provided charts and table.
- Stats shown: **WPM**, **Accuracy (%)**, **Correct Characters** (not just letters).

## Keyboard Shortcuts & Button Effects
- **Enter**: Restart the test with a new text
- **Esc**: Reset the test and clear your progress
- Buttons show a highlight on hover and a strong effect when clicked

## Progress & Improvement
- Your previous attempts are shown in a table and chart.
- If your WPM improves compared to your last attempt, the row is highlighted in green.