#!/usr/bin/env node

/**
 * Check for unused dependencies in the project
 * Run with: node scripts/check_unused_dependencies.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for unused dependencies...\n');

// Read package.json
const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
);

const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});
const allDeps = [...dependencies, ...devDependencies];

// Directories to scan
const dirsToScan = [
    'config',
    'constants',
    'controllers',
    'helpers',
    'middlewares',
    'models',
    'routes',
    'scripts',
    'services',
    'utils'
];

// Read all JS files
const usedPackages = new Set();

function scanDirectory(dir) {
    const fullPath = path.join(__dirname, '..', dir);
    
    if (!fs.existsSync(fullPath)) return;
    
    const files = fs.readdirSync(fullPath);
    
    files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            scanDirectory(path.join(dir, file));
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Find require statements
            const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
            let match;
            
            while ((match = requireRegex.exec(content)) !== null) {
                const pkg = match[1];
                
                // Extract package name (handle scoped packages)
                let packageName = pkg;
                if (pkg.startsWith('@')) {
                    packageName = pkg.split('/').slice(0, 2).join('/');
                } else {
                    packageName = pkg.split('/')[0];
                }
                
                // Skip relative imports
                if (!packageName.startsWith('.') && !packageName.startsWith('/')) {
                    usedPackages.add(packageName);
                }
            }
        }
    });
}

// Scan server.js
const serverContent = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
let match;

while ((match = requireRegex.exec(serverContent)) !== null) {
    const pkg = match[1];
    let packageName = pkg;
    
    if (pkg.startsWith('@')) {
        packageName = pkg.split('/').slice(0, 2).join('/');
    } else {
        packageName = pkg.split('/')[0];
    }
    
    if (!packageName.startsWith('.') && !packageName.startsWith('/')) {
        usedPackages.add(packageName);
    }
}

// Scan all directories
dirsToScan.forEach(dir => scanDirectory(dir));

// Find unused dependencies
const unusedDeps = allDeps.filter(dep => !usedPackages.has(dep));

// Report results
console.log('📦 Total dependencies:', allDeps.length);
console.log('✅ Used dependencies:', usedPackages.size);
console.log('❌ Potentially unused:', unusedDeps.length);
console.log();

if (unusedDeps.length > 0) {
    console.log('⚠️  Potentially unused dependencies:');
    unusedDeps.forEach(dep => {
        const isDev = devDependencies.includes(dep);
        console.log(`  - ${dep} ${isDev ? '(dev)' : ''}`);
    });
    console.log();
    console.log('Note: Some dependencies may be used indirectly or in ways this script cannot detect.');
    console.log('Always verify before removing!');
} else {
    console.log('✨ All dependencies appear to be in use!');
}

console.log();
console.log('Used packages:', Array.from(usedPackages).sort().join(', '));
