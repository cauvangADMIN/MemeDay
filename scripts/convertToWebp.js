const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Path to your memes folder
const Folder = path.join(__dirname, '..', 'assets/images');
const outputFolder = Folder; // Save in the same folder

console.log(`Looking for JPG files in: ${Folder}`);

// Get all jpg files in Meme folder
const jpgFiles = fs.readdirSync(Folder).filter(file => 
  file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')
);

console.log(`Found ${jpgFiles.length} JPG files to convert`);

if (jpgFiles.length === 0) {
  console.log('No JPG files found. Please add some JPG files to the meme folder.');
} else {
  // Convert each file
  jpgFiles.forEach(file => {
    const inputPath = path.join(Folder, file);
    const outputPath = path.join(outputFolder, `${path.parse(file).name}.webp`);
    
    sharp(inputPath)
      .webp({ quality: 80 }) // Adjust quality as needed (0-100)
      .toFile(outputPath)
      .then(() => {
        console.log(`Converted: ${file} -> ${path.parse(file).name}.webp`);
      })
      .catch(err => {
        console.error(`Error converting ${file}:`, err);
      });
  });
}