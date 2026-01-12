/**
 * Helper script to find hardcoded strings in JSX files
 * Run with: node find-hardcoded-strings.js
 * 
 * This will help identify text that needs to be translated
 */

const fs = require('fs');
const path = require('path');

const clientSrcPath = path.join(__dirname, 'client', 'src');
const excludeDirs = ['node_modules', 'dist', 'build', '.git'];
const excludeFiles = ['i18n', 'config', 'api.js', 'formatNumber.js'];

// Patterns to find hardcoded strings
const patterns = [
  // JSX text content
  />([A-Z][a-zA-Z\s]{2,})</g,
  // String literals in JSX
  /['"]([A-Z][a-zA-Z\s!?.,]{3,})['"]/g,
  // Toast messages
  /toast\.(success|error|info|warning)\(['"]([^'"]+)['"]\)/g,
  // Button text
  /<[Bb]utton[^>]*>([A-Z][a-zA-Z\s]+)</g,
  // Headings
  /<h[1-6][^>]*>([A-Z][a-zA-Z\s]+)</g,
  // Labels
  /<label[^>]*>([A-Z][a-zA-Z\s]+)</g,
  // Placeholders
  /placeholder=['"]([A-Z][a-zA-Z\s]+)['"]/g,
  // Title attributes
  /title=['"]([A-Z][a-zA-Z\s]+)['"]/g,
];

function shouldExclude(filePath) {
  return excludeDirs.some(dir => filePath.includes(dir)) ||
         excludeFiles.some(file => filePath.includes(file));
}

function findStringsInFile(filePath) {
  if (shouldExclude(filePath)) return [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1] || match[2];
        if (text && text.length > 2 && !text.includes('{{') && !text.includes('t(')) {
          findings.push({
            file: filePath.replace(clientSrcPath, ''),
            text: text.trim(),
            line: content.substring(0, match.index).split('\n').length
          });
        }
      }
    });
    
    return findings;
  } catch (error) {
    return [];
  }
}

function walkDirectory(dir) {
  let findings = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!shouldExclude(filePath)) {
          findings = findings.concat(walkDirectory(filePath));
        }
      } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
        findings = findings.concat(findStringsInFile(filePath));
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return findings;
}

console.log('🔍 Scanning for hardcoded strings...\n');

const findings = walkDirectory(clientSrcPath);

if (findings.length === 0) {
  console.log('✅ No hardcoded strings found! All text appears to be translated.');
} else {
  console.log(`Found ${findings.length} potential hardcoded strings:\n`);
  
  // Group by file
  const byFile = findings.reduce((acc, finding) => {
    if (!acc[finding.file]) acc[finding.file] = [];
    acc[finding.file].push(finding);
    return acc;
  }, {});
  
  Object.entries(byFile).forEach(([file, items]) => {
    console.log(`\n📄 ${file}`);
    items.forEach(item => {
      console.log(`   Line ${item.line}: "${item.text}"`);
    });
  });
  
  console.log(`\n\n📊 Summary: ${findings.length} strings in ${Object.keys(byFile).length} files`);
  console.log('\n💡 Tip: Review these strings and add them to translation files if needed.');
}

console.log('\n✨ Scan complete!\n');
