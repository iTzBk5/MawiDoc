const fs = require('fs');
const path = require('path');

const directoryPath = path.join('c:/Users/yassi/Documents/mawidoc/mobile/src');

function findAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      if (content.includes('@expo/vector-icons')) {
        content = content.replace(/import\s+\{\s*Ionicons\s*\}\s+from\s+['"]@expo\/vector-icons['"];/g, "import Ionicons from 'react-native-vector-icons/Ionicons';");
        modified = true;
      }
      
      if (content.includes('expo-linear-gradient')) {
        content = content.replace(/import\s+\{\s*LinearGradient\s*\}\s+from\s+['"]expo-linear-gradient['"];/g, "import LinearGradient from 'react-native-linear-gradient';");
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Modified:', fullPath);
      }
    }
  }
}

findAndReplace(directoryPath);
