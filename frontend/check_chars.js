const fs = require('fs');
const path = require('path');
const dir = 'src/components/VerificationHub/Mocks';
const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.jsx')) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    for (let i = 0; i < content.length; i++) {
      if (content.charCodeAt(i) > 127) {
        console.log(`File: ${file}, Char: ${content[i]} (code: ${content.charCodeAt(i)}) at index: ${i}`);
      }
    }
  }
});
