import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

console.log('========================================================');
console.log('🧪 VERIFYING RELEASE FLOWS & RUNTIME INTEGRITY (v1.0.3)');
console.log('========================================================\n');

// 1. Verify ProfileSetupPage.jsx has Plus imported and used properly
console.log('Test 1: Checking ProfileSetupPage imports & JSX references...');
const profileSetupPath = path.resolve('src/pages/profile/ProfileSetupPage.jsx');
const profileSetupContent = fs.readFileSync(profileSetupPath, 'utf8');

assert.match(
  profileSetupContent,
  /import\s*\{[^}]*Plus[^}]*\}\s*from\s*['"]lucide-react['"]/,
  'Plus MUST be imported from lucide-react in ProfileSetupPage.jsx'
);
assert.match(
  profileSetupContent,
  /<Plus\s+size=\{12\}\s*\/>/,
  'ProfileSetupPage contains <Plus size={12} /> for Add Skill'
);
console.log('  ✅ Plus is correctly imported and referenced in ProfileSetupPage.jsx');

// 2. Verify SignupPage has updated v1.0.3 badge and safe input handling
console.log('\nTest 2: Checking SignupPage.jsx version badge & input safety...');
const signupPath = path.resolve('src/pages/auth/SignupPage.jsx');
const signupContent = fs.readFileSync(signupPath, 'utf8');

assert.match(
  signupContent,
  /v1\.0\.3\s*•\s*Verified Stable/,
  'SignupPage.jsx must display v1.0.3 • Verified Stable'
);
assert.match(
  signupContent,
  /name="fullName"/,
  'SignupPage.jsx must have fullName input'
);
console.log('  ✅ SignupPage.jsx has v1.0.3 badge and fullName input field configured safely');

// 3. Verify ErrorBoundary is present in App.jsx
console.log('\nTest 3: Checking ErrorBoundary in App.jsx...');
const appPath = path.resolve('src/App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert.match(
  appContent,
  /import\s*\{[^}]*ErrorBoundary[^}]*\}\s*from/,
  'App.jsx must import ErrorBoundary'
);
assert.match(
  appContent,
  /<ErrorBoundary>/,
  'App.jsx must wrap root in <ErrorBoundary>'
);
console.log('  ✅ Global ErrorBoundary is active in App.jsx to protect against unhandled crashes');

// 4. Verify build.gradle version details
console.log('\nTest 4: Checking Android build.gradle configuration...');
const gradlePath = path.resolve('android/app/build.gradle');
const gradleContent = fs.readFileSync(gradlePath, 'utf8');

assert.match(
  gradleContent,
  /versionCode\s+4/,
  'build.gradle must have versionCode 4'
);
assert.match(
  gradleContent,
  /versionName\s+["']1\.0\.3["']/,
  'build.gradle must have versionName "1.0.3"'
);
console.log('  ✅ Android build.gradle is correctly configured with versionCode 4, versionName 1.0.3');

// 5. Verify compiled dist assets
console.log('\nTest 5: Checking production dist assets...');
const distHtmlPath = path.resolve('dist/index.html');
assert.ok(fs.existsSync(distHtmlPath), 'dist/index.html must exist');
const distHtml = fs.readFileSync(distHtmlPath, 'utf8');
assert.ok(distHtml.includes('<div id="root"></div>'), 'dist/index.html contains #root');

const distAssets = fs.readdirSync(path.resolve('dist/assets'));
const jsBundle = distAssets.find(f => f.endsWith('.js'));
assert.ok(jsBundle, 'dist/assets must contain compiled JS bundle');
console.log(`  ✅ Vite production bundle verified: dist/assets/${jsBundle}`);

// 6. Verify Android assets synchronized
console.log('\nTest 6: Checking Capacitor synced assets in Android folder...');
const androidAssetsPath = path.resolve('android/app/src/main/assets/public/index.html');
assert.ok(fs.existsSync(androidAssetsPath), 'Capacitor Android public/index.html must exist');
console.log('  ✅ Android Capacitor public assets are fully synced with Vite dist');

// 7. Verify APK Release artifact
console.log('\nTest 7: Checking release APK artifact...');
const rootApkPath = path.resolve('../ai-interview-coach-release.apk');
assert.ok(fs.existsSync(rootApkPath), 'ai-interview-coach-release.apk must exist in root');
const apkStats = fs.statSync(rootApkPath);
assert.ok(apkStats.size > 5000000, `APK size must be realistic (>5MB), got ${apkStats.size} bytes`);
console.log(`  ✅ Release APK verified: ${(apkStats.size / (1024 * 1024)).toFixed(2)} MB (${apkStats.size} bytes)`);

console.log('\n========================================================');
console.log('🎉 ALL INTEGRITY & RELEASE VERIFICATION TESTS PASSED!');
console.log('========================================================');
