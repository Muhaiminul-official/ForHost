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

  // Fix cases where it's `fetch(`${import.meta.env.VITE_API_URL || ''}/api/path',`
  const regex = /fetch\(\`\$\{import\.meta\.env\.VITE_API_URL \|\| ''\}\/api([^']*)\'/g;
  if(regex.test(content)) {
     content = content.replace(regex, "fetch(`${import.meta.env.VITE_API_URL || ''}/api$1`");
     changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Fixed quotes in: ${file}`);
  }
}
