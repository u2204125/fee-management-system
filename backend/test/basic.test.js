// Simple test configuration for backend structure validation

const fs = require('fs');
const path = require('path');

// Test suite for basic backend file structure and configuration
function runBasicTests() {
    console.log('🧪 Running backend structure tests...');
    
    const requiredFiles = [
        'package.json',
        'server.js',
        '.env.example',
        'config/cors.js',
        'config/db.js',
        'config/security.js',
        'config/session.js',
        'models/User.js',
        'models/Student.js',
        'models/Payment.js',
        'routes/auth.js',
        'controllers/authController.js',
        'utils/helpers.js'
    ];
    
    let passed = 0;
    let failed = 0;
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} exists`);
            passed++;
        } else {
            console.log(`❌ ${file} missing`);
            failed++;
        }
    });
    
    // Test package.json structure
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (packageJson.scripts && packageJson.scripts.start) {
            console.log('✅ Start script exists');
            passed++;
        } else {
            console.log('❌ Start script missing');
            failed++;
        }
        
        if (packageJson.dependencies && packageJson.dependencies.express) {
            console.log('✅ Express dependency found');
            passed++;
        } else {
            console.log('❌ Express dependency missing');
            failed++;
        }

        if (packageJson.dependencies && packageJson.dependencies.mongoose) {
            console.log('✅ Mongoose dependency found');
            passed++;
        } else {
            console.log('❌ Mongoose dependency missing');
            failed++;
        }
        
    } catch (error) {
        console.log('❌ Invalid package.json');
        failed++;
    }
    
    // Test environment configuration
    try {
        const envExample = fs.readFileSync('.env.example', 'utf8');
        
        if (envExample.includes('MONGO_URI')) {
            console.log('✅ Database configuration found');
            passed++;
        } else {
            console.log('❌ Database configuration missing');
            failed++;
        }
        
        if (envExample.includes('SESSION_SECRET')) {
            console.log('✅ Session configuration found');
            passed++;
        } else {
            console.log('❌ Session configuration missing');
            failed++;
        }
        
    } catch (error) {
        console.log('❌ .env.example not readable');
        failed++;
    }
    
    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('🎉 All backend tests passed!');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runBasicTests();
}

module.exports = { runBasicTests };

module.exports = { runBasicTests };
