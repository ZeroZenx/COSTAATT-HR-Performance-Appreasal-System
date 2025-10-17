#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const BACKUP_SUFFIX = '.backup';
const HARDCODED_URL = 'http://10.2.1.27:3000';
const HARDCODED_URL_ESC = 'http://10\\.2\\.1\\.27:3000';

// Files to search in (TypeScript/JavaScript files)
const searchPaths = [
  'src'
];

// Function to replace hardcoded URLs with dynamic imports
function replaceHardcodedUrl(content, filePath) {
  let modified = false;
  let newContent = content;
  
  // Pattern to find fetch calls with hardcoded URLs
  const fetchPattern = new RegExp(`fetch\\s*\\(\\s*['"](${HARDCODED_URL_ESC})`, 'g');
  
  // Check if file needs updating
  if (fetchPattern.test(content)) {
    console.log(`Updating file: ${filePath}`);
    
    // Replace fetch calls with dynamic URL
    newContent = newContent.replace(fetchPattern, (match, url) => {
      // Check if this file already imports the config
      const hasImport = content.includes("import { API_BASE_URL }");
      
      if (!hasImport) {
        // Find the first import statement to add our import after it
        const firstImportMatch = newContent.match(/^import .+ from ['"]/m);
        if (firstImportMatch) {
          const insertPos = newContent.indexOf(firstImportMatch[0]);
          const endOfLine = newContent.indexOf('\n', insertPos) + 1;
          const importToAdd = `import { API_BASE_URL } from '../lib/config';\n`;
          newContent = newContent.slice(0, endOfLine) + importToAdd + newContent.slice(endOfLine);
        }
      }
      
      return match.replace(url, '${API_BASE_URL}');
    });
    
    modified = true;
  }
  
  return { content: newContent, modified };
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = replaceHardcodedUrl(content, filePath);
    
    if (result.modified) {
      // Create backup
      fs.writeFileSync(filePath + BACKUP_SUFFIX, content);
      
      // Write updated content
      fs.writeFileSync(filePath, result.content);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to find and process all relevant files
function processDirectory(dirPath) {
  let processedCount = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        processedCount += processDirectory(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        if (processFile(fullPath)) {
          processedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
  
  return processedCount;
}

// Main execution
function main() {
  console.log('🔄 Starting hardcoded URL replacement...');
  console.log(`Looking for: ${HARDCODED_URL}`);
  console.log('Replacing with: ${API_BASE_URL}');
  console.log('');
  
  let totalProcessed = 0;
  
  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath)) {
      console.log(`Processing: ${searchPath}`);
      totalProcessed += processDirectory(searchPath);
    } else {
      console.log(`Path not found: ${searchPath}`);
    }
  }
  
  console.log('');
  console.log(`✅ Processing complete!`);
  console.log(`📁 Files updated: ${totalProcessed}`);
  console.log(`💾 Backups created with suffix: ${BACKUP_SUFFIX}`);
  
  if (totalProcessed > 0) {
    console.log('');
    console.log('⚠️  IMPORTANT: Please review the changes and test thoroughly!');
    console.log('📝 You may need to add import statements manually in some files.');
    console.log('🔄 If issues occur, restore from backup files.');
  }
}

// Run the script
main();
