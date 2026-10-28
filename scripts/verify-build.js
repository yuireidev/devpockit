#!/usr/bin/env node
/* eslint @typescript-eslint/no-require-imports: off -- This Node script runs as CommonJS. */

/**
 * DevPockit Build Verification Script
 * Verifies that the Next.js build output is correct and complete
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - File not found: ${filePath}`, 'red');
    return false;
  }
}

function checkDirectoryExists(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Directory not found: ${dirPath}`, 'red');
    return false;
  }
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2) + ' KB';
  } catch {
    return 'Unknown';
  }
}

function main() {
  log('🔍 Verifying DevPockit Build Output...', 'blue');
  log('');

  let allChecksPassed = true;

  // Check if out directory exists
  if (!checkDirectoryExists('out', 'Build output directory exists')) {
    log('❌ Build failed - no output directory found', 'red');
    process.exit(1);
  }

  // Check main files
  const mainFiles = [
    { path: 'out/index.html', description: 'Main index.html' },
    { path: 'out/404.html', description: '404 error page' }
  ];

  mainFiles.forEach(file => {
    if (!checkFileExists(file.path, file.description)) {
      allChecksPassed = false;
    }
  });

  // Check tools directory structure
  const toolsDir = 'out/tools';
  if (!checkDirectoryExists(toolsDir, 'Tools directory exists')) {
    allChecksPassed = false;
  } else {
    // Check for tool categories
    const categories = ['converters', 'cryptography', 'encoders', 'formatters', 'network', 'text-tools', 'utilities'];
    categories.forEach(category => {
      const categoryPath = path.join(toolsDir, category);
      if (checkDirectoryExists(categoryPath, `Tool category: ${category}`)) {
        // Check for index.html in category
        const categoryIndex = path.join(categoryPath, 'index.html');
        checkFileExists(categoryIndex, `Category index: ${category}`);
      }
    });
  }

  // Check _next directory for assets
  if (checkDirectoryExists('out/_next', 'Next.js assets directory')) {
    const nextDir = 'out/_next';
    const files = fs.readdirSync(nextDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    const cssFiles = files.filter(file => file.endsWith('.css'));

    log(`📦 Found ${jsFiles.length} JavaScript files`, 'blue');
    log(`🎨 Found ${cssFiles.length} CSS files`, 'blue');
  }

  // Check file sizes
  log('');
  log('📊 Build Statistics:', 'blue');

  if (fs.existsSync('out/index.html')) {
    const size = getFileSize('out/index.html');
    log(`   Main page: ${size}`, 'blue');
  }

  // Check for common issues
  log('');
  log('🔍 Checking for common issues...', 'blue');

  // Check if index.html contains proper content
  if (fs.existsSync('out/index.html')) {
    const indexContent = fs.readFileSync('out/index.html', 'utf8');

    if (indexContent.includes('DevPockit')) {
      log('✅ Main page contains app title', 'green');
    } else {
      log('⚠️  Main page may not contain expected content', 'yellow');
    }

    if (indexContent.includes('_next/static')) {
      log('✅ Static assets properly referenced', 'green');
    } else {
      log('⚠️  Static assets may not be properly referenced', 'yellow');
    }
  }

  // Final result
  log('');
  if (allChecksPassed) {
    log('🎉 Build verification completed successfully!', 'green');
    log('✅ All critical files and directories are present', 'green');
    log('');
    log('Next steps:', 'blue');
    log('1. Test locally: pnpm serve:build', 'blue');
    log('2. Visit http://localhost:8080 to test the application', 'blue');
    log('3. Deploy to GitHub Pages if everything looks good', 'blue');
  } else {
    log('❌ Build verification failed!', 'red');
    log('Please check the errors above and rebuild the application', 'red');
    process.exit(1);
  }
}

main();
