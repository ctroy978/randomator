# Student Selector Mining Adventure Game

A fun, retro-style web-based game for randomly selecting students from different classes. Features an engaging mining animation where a pixel-art miner breaks through rocks to reveal the selected student's name.

## Features

- **8-bit Retro Style**: Pixel art graphics and retro gaming aesthetics
- **Mining Animation**: Watch as the miner swings their pickaxe to break through rocks
- **Multiple Classes**: Support for multiple classes with different student lists
- **Particle Effects**: Dynamic particle effects during the mining sequence
- **Customizable Settings**: Adjust animation speed and toggle particle effects
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Keyboard Support**: Spacebar to select, Escape to skip animation

## How to Use

1. Open `index.html` in a web browser
2. Select a class from the dropdown menu
3. Click "Select Student" or press spacebar
4. Watch the mining animation
5. The selected student's name will be revealed after the rock breaks
6. Click "Select Another" to choose another student

## File Structure

```
student_selector_game/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Retro-styled CSS
├── js/
│   ├── game.js         # Main game logic and state management
│   ├── ui.js           # UI components (buttons, text rendering)
│   ├── animation.js    # Mining animation system
│   └── data-manager.js # Handles loading and managing class data
├── data/
│   └── classes.json    # Student and class data
└── assets/
    ├── images/         # (Reserved for future sprite assets)
    └── sounds/         # (Reserved for future sound effects)
```

## Customizing Student Data

Edit `data/classes.json` to add your own classes and students:

```json
{
  "classes": {
    "Your Class Name": [
      "Student 1",
      "Student 2",
      "Student 3"
    ]
  }
}
```

## Settings

Click the gear icon (⚙️) to access settings:
- **Animation Speed**: Control how fast the animation plays (0.5x - 2x)
- **Particles**: Toggle particle effects on/off
- **Sound**: (Coming soon)

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technical Details

- Built with vanilla JavaScript and HTML5 Canvas
- No external dependencies required
- Frame rate locked at 60 FPS for smooth animation
- Responsive canvas scaling
- Touch-enabled for mobile devices

## Performance

The game is optimized for performance with:
- Efficient canvas rendering
- Object pooling for particles
- Smart redraw management
- Cached data loading

## License

Free to use for educational purposes.