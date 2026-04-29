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
  
  if (content.includes('fetch(`/api')) {
    content = content.replace(/fetch\(\`\/api/g, 'fetch(`${import.meta.env.VITE_API_URL || \'\'}/api');
    changed = true;
  }
  
  if (content.includes('socket = io()')) {
    content = content.replace(/socket = io\(\)/g, "socket = io(import.meta.env.VITE_API_URL || undefined)");
    changed = true;
  }

  if (content.includes("socket = io({ auth: { token } });")) {
     content = content.replace(/socket = io\(\{ auth: \{ token \} \}\);/g, "socket = io(import.meta.env.VITE_API_URL || undefined, { auth: { token } });");
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
