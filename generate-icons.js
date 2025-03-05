// This script generates app icons in various sizes for APK packaging
// Run this with Node.js after installing the required packages:
// npm install canvas fs

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// Icon sizes needed for Android
const sizes = [
  36,    // ldpi
  48,    // mdpi
  72,    // hdpi
  96,    // xhdpi
  144,   // xxhdpi
  192,   // xxxhdpi
  512    // Play Store
];

async function generateIcons() {
  try {
    // Load the sprite sheet
    const sprite = await loadImage('sprite.png');
    
    // Create icons for each size
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw circular background
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
      ctx.fillStyle = '#70c5ce';
      ctx.fill();
      
      // Draw the bird from the sprite sheet (using the midflap position)
      // Scale the bird to fit nicely in the icon
      const birdWidth = Math.floor(size * 0.8);
      const birdHeight = Math.floor(birdWidth * (26/34)); // Maintain aspect ratio
      const birdX = (size - birdWidth) / 2;
      const birdY = (size - birdHeight) / 2;
      
      ctx.drawImage(sprite, 276, 139, 34, 26, birdX, birdY, birdWidth, birdHeight);
      
      // Save the icon
      const fileName = size === 512 ? 'app-icon-512.png' : (size === 192 ? 'app-icon.png' : `app-icon-${size}.png`);
      const out = fs.createWriteStream(fileName);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      
      out.on('finish', () => {
        console.log(`Created ${fileName}`);
      });
    }
    
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 