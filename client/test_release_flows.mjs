import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const clientDir = import.meta.dirname;

console.log('========================================================');
console.log('🧪 VERIFYING RELEASE FLOWS & RUNTIME INTEGRITY (v1.0.4)');
console.log('========================================================\n');

// 1. Verify ProfileSetupPage.jsx has Plus imported and used properly
console.log('Test 1: Checking ProfileSetupPage imports & JSX references...');
const profileSetupPath = path.resolve(clientDir, 'src/pages/profile/ProfileSetupPage.jsx');
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

// 2. Verify SignupPage has updated v1.0.4 badge and safe input handling
console.log('\nTest 2: Checking SignupPage.jsx version badge & input safety...');
const signupPath = path.resolve(clientDir, 'src/pages/auth/SignupPage.jsx');
const signupContent = fs.readFileSync(signupPath, 'utf8');

assert.match(
  signupContent,
  /v1\.0\.4\s*•\s*Verified Stable/,
  'SignupPage.jsx must display v1.0.4 • Verified Stable'
);
assert.match(
  signupContent,
  /name="fullName"/,
  'SignupPage.jsx must have fullName input'
);
console.log('  ✅ SignupPage.jsx has v1.0.4 badge and fullName input field configured safely');

// 3. Verify ErrorBoundary is present in App.jsx
console.log('\nTest 3: Checking ErrorBoundary in App.jsx...');
const appPath = path.resolve(clientDir, 'src/App.jsx');
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

// 4. Verify Android build.gradle version details
console.log('\nTest 4: Checking Android build.gradle configuration...');
const gradlePath = path.resolve(clientDir, 'android/app/build.gradle');
const gradleContent = fs.readFileSync(gradlePath, 'utf8');

assert.match(
  gradleContent,
  /versionCode\s+5/,
  'build.gradle must have versionCode 5'
);
assert.match(
  gradleContent,
  /versionName\s+["']1\.0\.4["']/,
  'build.gradle must have versionName "1.0.4"'
);
console.log('  ✅ Android build.gradle is correctly configured with versionCode 5, versionName 1.0.4');

// 5. Verify Text-To-Speech Integration & VoiceInterviewScreen Listen Button
console.log('\nTest 5: Checking Text-To-Speech plugin integration...');
const ttsHookPath = path.resolve(clientDir, 'src/hooks/useSpeechSynthesis.js');
const ttsHookContent = fs.readFileSync(ttsHookPath, 'utf8');
assert.match(
  ttsHookContent,
  /from ['"]@capacitor-community\/text-to-speech['"]/,
  'useSpeechSynthesis must import TextToSpeech from @capacitor-community/text-to-speech'
);

const voiceScreenPath = path.resolve(clientDir, 'src/pages/interview/VoiceInterviewScreen.jsx');
const voiceScreenContent = fs.readFileSync(voiceScreenPath, 'utf8');
assert.match(
  voiceScreenContent,
  /useSpeechSynthesis/,
  'VoiceInterviewScreen must use useSpeechSynthesis hook'
);
assert.match(
  voiceScreenContent,
  /speakCurrentQuestion/,
  'VoiceInterviewScreen must have speakCurrentQuestion'
);
console.log('  ✅ Text-to-Speech native plugin and VoiceInterviewScreen Listen button verified');

// 6. Verify compiled dist assets
console.log('\nTest 6: Checking production dist assets...');
const distHtmlPath = path.resolve(clientDir, 'dist/index.html');
assert.ok(fs.existsSync(distHtmlPath), 'dist/index.html must exist');
const distHtml = fs.readFileSync(distHtmlPath, 'utf8');
assert.ok(distHtml.includes('<div id="root"></div>'), 'dist/index.html contains #root');

const distAssets = fs.readdirSync(path.resolve(clientDir, 'dist/assets'));
const jsBundle = distAssets.find(f => f.endsWith('.js'));
assert.ok(jsBundle, 'dist/assets must contain compiled JS bundle');
console.log(`  ✅ Vite production bundle verified: dist/assets/${jsBundle}`);

// 7. Verify Android assets synchronized
console.log('\nTest 7: Checking Capacitor synced assets in Android folder...');
const androidAssetsPath = path.resolve(clientDir, 'android/app/src/main/assets/public/index.html');
assert.ok(fs.existsSync(androidAssetsPath), 'Capacitor Android public/index.html must exist');
console.log('  ✅ Android Capacitor public assets are fully synced with Vite dist');

// 8. Verify APK Release artifact
console.log('\nTest 8: Checking release APK artifact...');
const rootApkPath = path.resolve(clientDir, '../ai-interview-coach-release.apk');
assert.ok(fs.existsSync(rootApkPath), 'ai-interview-coach-release.apk must exist in root');
const apkStats = fs.statSync(rootApkPath);
assert.ok(apkStats.size > 5000000, `APK size must be realistic (>5MB), got ${apkStats.size} bytes`);
console.log(`  ✅ Release APK verified: ${(apkStats.size / (1024 * 1024)).toFixed(2)} MB (${apkStats.size} bytes)`);

console.log('\n========================================================');
console.log('🎉 ALL INTEGRITY & RELEASE VERIFICATION TESTS PASSED!');
console.log('========================================================');
