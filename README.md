
# Typing Speed Test

A modern web app to test and improve your typing speed and accuracy. Type random text passages, track your performance, and visualize your progress over time.

## Features
- Random text selection from PoetryDB API or local JSON
- Real-time calculation of typing speed (WPM)
- Accuracy and error tracking
- Visual charts and tables to display performance metrics
- Responsive, intuitive, and modular UI
- Keyboard shortcuts for quick actions
- Progress tracking and improvement highlighting
- Modular codebase for easy maintenance and extension

## Technologies Used
- HTML, CSS, JavaScript
- Chart.js for data visualization

## File Structure
```
index.html           # Main HTML file
style.css            # Stylesheet
js/
  chartLoader.js     # Loads and manages charts
  main.js            # Main application logic and state
  metricsService.js  # Calculates typing metrics
  texts.json         # Text passages for typing tests
  textService.js     # Handles text selection and management
  uiService.js       # Manages UI updates and interactions
  eventHandlers.js   # Handles all event listeners and user actions
  timerService.js    # Timer logic for the test
  progressService.js # Progress table and chart rendering
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
- Start typing the displayed text in the input area.
- View your speed, accuracy, and errors in real time.
- Check your progress with the provided charts and table.
- Stats shown: **WPM**, **Accuracy (%)**, **Correct Characters** (not just letters).

## Keyboard Shortcuts & Button Effects
- **Enter**: Restart the test with a new text
- **Esc**: Reset the test and clear your progress
- Buttons show a highlight on hover and a strong effect when clicked

## Progress & Improvement
- Your previous attempts are shown in a table and chart.
- If your WPM improves compared to your last attempt, the row is highlighted in green.