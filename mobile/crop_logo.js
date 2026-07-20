// To change the size of the logo in the app icon, adjust the PADDING_PERCENTAGE below.
// - A SMALLER number (e.g., 0.05) makes the logo LARGER inside the app icon.
// - A ZERO number (0) makes the logo take up the MAXIMUM space (WARNING: edges might be cut off by Android circles).
// - A LARGER number (e.g., 0.30) makes the logo SMALLER inside the app icon.
const PADDING_PERCENTAGE = 0.00; // I set this to 0% padding
const ZOOM_FACTOR = 1.4; // 1.0 is normal. 1.4 makes it 40% bigger (warning: corners might get cut by Android circle mask)

const fs = require('fs');

async function processLogo() {
  console.log("Getting PNG buffer...");
  let JimpModule = require('C:\\Users\\yassi\\AppData\\Roaming\\npm\\node_modules\\jimp');
  let JimpClass = JimpModule.Jimp || JimpModule;
  const image = await JimpClass.read('src/assets/logo-removebg-preview.png');
  image.autocrop({ tolerance: 0.2 });

  const maxDimOriginal = Math.max(image.bitmap.width, image.bitmap.height);
  
  // Scale the image up!
  image.scale(ZOOM_FACTOR);
  
  const pad = Math.floor(maxDimOriginal * PADDING_PERCENTAGE);
  const squareSize = maxDimOriginal + pad * 2;
  
  let newImg;
  try { newImg = new JimpClass(squareSize, squareSize, 0x00000000); } 
  catch (e) { newImg = new JimpClass({ width: squareSize, height: squareSize, color: 0x00000000 }); }
  
  // Center it (offset will be negative if zoomed, which effectively crops the edges!)
  const offsetX = pad + Math.floor((squareSize - image.bitmap.width) / 2);
  const offsetY = pad + Math.floor((squareSize - image.bitmap.height) / 2);
  newImg.composite(image, offsetX, offsetY);

  const resDir = 'android/app/src/main/res';
  const mipmaps = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];

  console.log("Saving new icons to Android mipmap folders...");
  for (const dir of mipmaps) {
    const dest1 = resDir + '/' + dir + '/ic_launcher.png';
    const dest2 = resDir + '/' + dir + '/ic_launcher_round.png';
    if (fs.existsSync(resDir + '/' + dir)) {
      await newImg.write(dest1);
      await newImg.write(dest2);
      console.log('Updated ' + dir);
    }
  }

  console.log("\nDone! Please run 'npm run android' to see your changes.");
}
processLogo().catch(console.error);
