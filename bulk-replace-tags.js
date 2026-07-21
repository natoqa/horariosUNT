const fs = require('fs');
const path = require('path');

const colors = ['emerald', 'amber', 'red', 'blue', 'purple', 'violet', 'indigo', 'cyan', 'sky', 'rose', 'orange', 'pink', 'lime', 'fuchsia', 'teal', 'gray', 'slate', 'zinc'];

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        filelist = walkSync(filepath, filelist);
      }
    } else {
      if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}

const files = walkSync(path.join(process.cwd(), 'src'));
files.push(...walkSync(path.join(process.cwd(), 'app')));

let modifiedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  for (const color of colors) {
    // Replace bg-color-50
    const bgRegex = new RegExp(`\\bbg-${color}-50\\b`, 'g');
    content = content.replace(bgRegex, `bg-${color}-500/10`);
    
    // Replace text-color-700 and 800 and 900
    const textRegex = new RegExp(`\\btext-${color}-(700|800|900)\\b`, 'g');
    content = content.replace(textRegex, `text-${color}-600`);
    
    // Replace border-color-100/200/300
    const borderRegex = new RegExp(`\\bborder-${color}-(100|200|300)\\b`, 'g');
    content = content.replace(borderRegex, `border-${color}-500/20`);

    // Replace hover bg
    const hoverBgRegex = new RegExp(`\\bhover:bg-${color}-100\\b`, 'g');
    content = content.replace(hoverBgRegex, `hover:bg-${color}-500/20`);
    
    // Some instances where bg-gray-50 etc are used, might be replaced with bg-muted
    if (['gray', 'slate', 'zinc'].includes(color)) {
      content = content.replace(new RegExp(`\\bbg-${color}-500/10\\b`, 'g'), 'bg-muted/50');
      content = content.replace(new RegExp(`\\bborder-${color}-500/20\\b`, 'g'), 'border-border');
      content = content.replace(new RegExp(`\\btext-${color}-600\\b`, 'g'), 'text-muted-foreground');
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedFiles++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`Total files modified: ${modifiedFiles}`);
