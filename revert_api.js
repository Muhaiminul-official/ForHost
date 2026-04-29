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

  // Revert backticks fetch requests
  const fetchRegex = /fetch\(\`\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*''\}\/api([^`'"]*)\`/g;
  if(fetchRegex.test(content)) {
     content = content.replace(fetchRegex, "fetch(`/api$1`");
     changed = true;
  }
  const fetchRegex2 = /fetch\(\`\$\{API_URL\}\/api([^`'"]*)\`/g;
  if (fetchRegex2.test(content)) {
     content = content.replace(fetchRegex2, "fetch(`/api$1`");
     changed = true;
  }

  // Revert quotes fetch requests
  const fetchRegex3 = /fetch\('\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*''\}\/api\//g;
  if (fetchRegex3.test(content)) {
    content = content.replace(fetchRegex3, "fetch('/api/");
    changed = true;
  }
  const fetchRegex4 = /fetch\('\$\{API_URL\}\/api\//g;
  if (fetchRegex4.test(content)) {
    content = content.replace(fetchRegex4, "fetch('/api/");
    changed = true;
  }

  // Revert io calls
  if (content.includes("io(import.meta.env.VITE_API_URL || undefined, { auth: { token } })")) {
      content = content.replace(/io\(import\.meta\.env\.VITE_API_URL \|\| undefined\, \{ auth\: \{ token \} \}\)/g, "io({ auth: { token } })");
      changed = true;
  }
  
  if (content.includes("io(import.meta.env.VITE_API_URL || undefined)")) {
      content = content.replace(/io\(import\.meta\.env\.VITE_API_URL \|\| undefined\)/g, "io()");
      changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Reverted to use Vite proxy in: ${file}`);
  }
}
