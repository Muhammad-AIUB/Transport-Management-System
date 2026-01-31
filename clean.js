const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  
  content = content.replace(/\s+$/gm, '');

  
  content = content.replace(/\n{3,}/g, '\n\n');

  
  const jsdocRegex = /\/\*\*.*?\*\//gs;
  const jsdocs = [];
  let match;
  while ((match = jsdocRegex.exec(content)) !== null) {
    jsdocs.push(match[0]);
  }
  content = content.replace(jsdocRegex, (match) => `___JSDOC_${jsdocs.indexOf(match)}___`);

 
  content = content.replace(/\/\/.*$/gm, '');

  
  content = content.replace(/\/\*.*?\*\//gs, '');


  jsdocs.forEach((jsdoc, i) => {
    content = content.replace(`___JSDOC_${i}___`, jsdoc);
  });

 
  fs.writeFileSync(filePath, content);
}

function getFiles(dir, extensions) {
  const files = [];
  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extensions.includes(path.extname(fullPath))) {
        files.push(fullPath);
      }
    }
  }
  walk(dir);
  return files;
}

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'];
const backendFiles = getFiles('backend/src', extensions);
const frontendFiles = getFiles('frontend/src', extensions);
const allFiles = [...backendFiles, ...frontendFiles];

console.log(`Found ${allFiles.length} files to clean.`);
allFiles.forEach(file => {
  console.log(`Cleaning ${file}`);
  cleanFile(file);
});
console.log('Cleanup completed.');