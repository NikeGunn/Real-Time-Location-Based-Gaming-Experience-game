// Test file to verify imports work
try {
  console.log('Testing imports...');

  // Test main App
  require('./App.tsx');
  console.log('✅ App.tsx imported successfully');

  // Test key services
  require('./app/services/authService.real.ts');
  console.log('✅ authService.real.ts imported successfully');

  require('./app/services/zoneService.real.ts');
  console.log('✅ zoneService.real.ts imported successfully');

  console.log('✅ All key imports successful!');
} catch (error) {
  console.error('❌ Import error:', error.message);
}
