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

  // fix 'PUT' and other method syntax issues
  if (content.includes("method: `PUT',") || content.includes("method: `PUT',") || content.includes("method: `DELETE',") || content.includes("method: `POST',") ) {
    content = content.replace(/method:\s*\`([A-Z]+)\',/g, "method: '$1',");
    changed = true;
  }
  
  if (content.includes("method: `GET',") || content.includes("method: `PATCH',")) {
      content = content.replace(/method:\s*\`([A-Z]+)\',/g, "method: '$1',");
      changed = true;
  }

  // Look for any unclosed fetch backticks like fetch(`${...}/api/something', {
  const fetchRegex = /fetch\((`\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*''\}\/api[^`'"]*)['"]/g;
  if(fetchRegex.test(content)) {
     content = content.replace(fetchRegex, "fetch($1`");
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Re-Fixed formatting in: ${file}`);
  }
}
