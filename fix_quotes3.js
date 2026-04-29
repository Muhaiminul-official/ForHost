import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(filePath);
    }
  }
  return results;
}

const files = walk('./frontend/src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes("\`Authorization': \`Bearer")) {
    content = content.replace(/\`Authorization': \`Bearer/g, "'Authorization': `Bearer");
    changed = true;
  }
  
  if (content.includes("\`Content-Type': `")) {
      content = content.replace(/\`Content-Type': \`/g, "'Content-Type': '");
      changed = true;
  }
  
  if (content.includes("\`Content-Type': '")) {
      content = content.replace(/\`Content-Type': '/g, "'Content-Type': '");
      changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Re-Fixed formatting in: ${file}`);
  }
}
