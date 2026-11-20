/**
 * NEXORA Quality Assurance & Comprehensive Test Suite
 * Covers: Unit Testing, Integration Testing, Acceptance Testing, Regression Testing, and System Testing.
 */

import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT_DIR = process.cwd();

// In-memory storage adapter for CLI environment
class MemoryStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MemoryStorage();

console.log('================================================================');
console.log('🚀 NEXORA COMPREHENSIVE QA & TEST SUITE RUNNER');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } catch (error) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${error.message}`);
    failCount++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } catch (error) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${error.message}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// 1. UNIT TESTING (Core Utilities & Helpers)
// -----------------------------------------------------------------------------
console.log('📦 1. UNIT TESTS (Utilities, Formatting & Computation)');

const { cn, calculateProgress, getInitials, getPriorityColor, getStatusColor, truncate } = await import('../src/lib/utils.js');

runTest('cn() joins conditional and truthy class names properly', () => {
  const result = cn('btn', true && 'btn-primary', false && 'hidden', null, undefined, 'px-4');
  assert.equal(result, 'btn btn-primary px-4');
});

runTest('calculateProgress() correctly calculates percentage of done tasks', () => {
  assert.equal(calculateProgress([]), 0);
  assert.equal(calculateProgress([{ status: 'todo' }, { status: 'in-progress' }]), 0);
  assert.equal(calculateProgress([{ status: 'done' }, { status: 'todo' }]), 50);
  assert.equal(calculateProgress([{ status: 'done' }, { status: 'completed' }, { status: 'todo' }, { status: 'todo' }]), 50);
  assert.equal(calculateProgress([{ status: 'done' }]), 100);
});

runTest('getInitials() extracts uppercase initials from names', () => {
  assert.equal(getInitials('Alex Rivera'), 'AR');
  assert.equal(getInitials('Sarah Jenkins Vance'), 'SJ');
  assert.equal(getInitials('John'), 'J');
  assert.equal(getInitials(''), '?');
});

runTest('truncate() cuts long strings and adds ellipsis', () => {
  assert.equal(truncate('Short text', 20), 'Short text');
  assert.equal(truncate('A very long description that exceeds limit', 10), 'A very lon...');
});

runTest('getPriorityColor() returns appropriate styles for all priorities', () => {
  assert.ok(getPriorityColor('urgent').includes('red'));
  assert.ok(getPriorityColor('high').includes('orange'));
  assert.ok(getPriorityColor('medium').includes('yellow'));
  assert.ok(getPriorityColor('low').includes('green'));
  assert.ok(getPriorityColor('unknown').includes('gray'));
});

runTest('getStatusColor() returns valid theme styling for all task statuses', () => {
  assert.ok(getStatusColor('todo').includes('gray'));
  assert.ok(getStatusColor('in-progress').includes('blue'));
  assert.ok(getStatusColor('in-review').includes('yellow'));
  assert.ok(getStatusColor('done').includes('green'));
});


// -----------------------------------------------------------------------------
// 2. INTEGRATION TESTING (DataService & Multi-Tenant Workspace Scoping)
// -----------------------------------------------------------------------------
console.log('\n🔄 2. INTEGRATION TESTS (DataService, Scoping & Session Isolation)');

const dataService = await import('../src/services/dataService.js');

await runAsyncTest('Super Admin (wa363969@gmail.com) receives Master Workspace', async () => {
  // Set Admin session
  localStorage.setItem('nexora_user_session', JSON.stringify({
    $id: 'user-admin',
    name: 'WA Admin',
    email: 'wa363969@gmail.com',
    role: 'admin',
    labels: ['admin'],
  }));

  const projects = await dataService.getProjects();
  assert.ok(Array.isArray(projects), 'Projects should be an array');
  assert.ok(projects.length >= 4, 'Admin should have master seed projects');
  assert.equal(projects[0].name, 'NEXORA Mobile App v2');

  const tasks = await dataService.getTasks();
  assert.ok(Array.isArray(tasks), 'Tasks should be an array');
  assert.ok(tasks.length >= 6, 'Admin should have master seed tasks');
});

await runAsyncTest('New Client receives an isolated, clean workspace', async () => {
  // Set Client session
  localStorage.setItem('nexora_user_session', JSON.stringify({
    $id: 'user-client-123',
    name: 'Acme Client',
    email: 'client@acme.corp',
    role: 'member',
    labels: ['member'],
  }));

  const clientProjects = await dataService.getProjects();
  assert.ok(Array.isArray(clientProjects));
  assert.equal(clientProjects.length, 1, 'Client should start with exactly 1 starter project');
  assert.equal(clientProjects[0].name, '🚀 My First Workspace Project');
  assert.equal(clientProjects[0].teamLead, 'Acme Client');

  const clientTasks = await dataService.getTasks();
  assert.ok(Array.isArray(clientTasks));
  assert.equal(clientTasks.length, 3, 'Client should have 3 onboarding tasks');
  assert.equal(clientTasks[0].projectName, '🚀 My First Workspace Project');

  const clientConversations = await dataService.getConversations();
  assert.ok(Array.isArray(clientConversations));
  assert.equal(clientConversations.length, 0, 'Client must start with a clean AI conversation history');
});

await runAsyncTest('Data Isolation: Client mutation does NOT contaminate Admin Workspace', async () => {
  // 1. Client creates a project
  localStorage.setItem('nexora_user_session', JSON.stringify({
    $id: 'user-client-123',
    name: 'Acme Client',
    email: 'client@acme.corp',
    role: 'member',
    labels: ['member'],
  }));

  const clientCreatedProject = await dataService.createProject({
    name: 'Acme Confidential Redesign',
    description: 'Private client redesign project',
    priority: 'urgent',
  });
  assert.equal(clientCreatedProject.name, 'Acme Confidential Redesign');

  const clientProjects = await dataService.getProjects();
  assert.equal(clientProjects.length, 2, 'Client should now have 2 projects');

  // 2. Admin logs in
  localStorage.setItem('nexora_user_session', JSON.stringify({
    $id: 'user-admin',
    name: 'WA Admin',
    email: 'wa363969@gmail.com',
    role: 'admin',
    labels: ['admin'],
  }));

  const adminProjects = await dataService.getProjects();
  const hasClientProject = adminProjects.some(p => p.name === 'Acme Confidential Redesign');
  assert.equal(hasClientProject, false, 'Client project MUST NOT exist in Admin workspace');
});

await runAsyncTest('Kanban task status transitions update correctly', async () => {
  localStorage.setItem('nexora_user_session', JSON.stringify({
    $id: 'user-admin',
    name: 'WA Admin',
    email: 'wa363969@gmail.com',
    role: 'admin',
    labels: ['admin'],
  }));

  const tasksBefore = await dataService.getTasks();
  const targetTask = tasksBefore[0];
  const originalStatus = targetTask.status;
  const newStatus = originalStatus === 'done' ? 'in-progress' : 'done';

  const updatedTask = await dataService.updateTaskStatus(targetTask.$id, newStatus);
  assert.equal(updatedTask.status, newStatus, 'Task status should transition cleanly');

  // Restore
  await dataService.updateTaskStatus(targetTask.$id, originalStatus);
});

await runAsyncTest('Notifications lifecycle: fetching, marking single and all read', async () => {
  localStorage.setItem('nexora_user_session', JSON.stringify({
    $id: 'user-admin',
    name: 'WA Admin',
    email: 'wa363969@gmail.com',
    role: 'admin',
    labels: ['admin'],
  }));

  const notifs = await dataService.getNotifications();
  assert.ok(Array.isArray(notifs));
  assert.ok(notifs.length > 0);

  // Mark single as read
  const updatedList = await dataService.markNotificationAsRead(notifs[0].$id);
  const found = updatedList.find(n => n.$id === notifs[0].$id);
  assert.equal(found.read, true);

  // Mark all as read
  const allRead = await dataService.markAllNotificationsRead();
  assert.ok(allRead.every(n => n.read === true));
});

await runAsyncTest('Team Guild & Member Operations: invite and member count', async () => {
  const membersBefore = await dataService.getMembers();
  const countBefore = membersBefore.length;

  const newMember = await dataService.inviteMember({
    name: 'Engineering Contributor',
    email: 'dev.contributor@nexora.io',
    role: 'Frontend Engineer',
    team: 'Core Engineering Guild',
  });
  assert.equal(newMember.email, 'dev.contributor@nexora.io');
  assert.equal(newMember.status, 'pending');

  const membersAfter = await dataService.getMembers();
  assert.equal(membersAfter.length, countBefore + 1);

  const teams = await dataService.getTeams();
  assert.ok(Array.isArray(teams));
  assert.ok(teams.length >= 2);
});

await runAsyncTest('AI Model Catalog: verifies Gemini & OpenAI models', async () => {
  const { getAvailableModels, getCurrentProvider, getCurrentModel } = await import('../src/lib/ai.js');
  
  const geminiModels = getAvailableModels('gemini');
  assert.ok(Array.isArray(geminiModels));
  assert.ok(geminiModels.some(m => m.id === 'gemini-3.5-flash-lite'));
  assert.ok(geminiModels.some(m => m.id === 'gemini-3.8-flash'));

  const openaiModels = getAvailableModels('openai');
  assert.ok(Array.isArray(openaiModels));
  assert.ok(openaiModels.some(m => m.id === 'gpt-4o'));

  assert.equal(getCurrentProvider(), 'gemini');
  assert.equal(getCurrentModel(), 'gemini-3.5-flash-lite');
});


// -----------------------------------------------------------------------------
// 3. SYSTEM & ACCEPTANCE TESTING (Client Side vs Admin Side)
// -----------------------------------------------------------------------------
console.log('\n🖥️  3. SYSTEM & ACCEPTANCE TESTS (Routes, Roles & Security Boundaries)');

const expectedPages = [
  'Landing.jsx',
  'Login.jsx',
  'Register.jsx',
  'ForgotPassword.jsx',
  'HelpCenter.jsx',
  'PrivacyPolicy.jsx',
  'Terms.jsx',
  'NotFound.jsx',
  'Dashboard.jsx',
  'AIAssistant.jsx',
  'Projects.jsx',
  'ProjectDetails.jsx',
  'Tasks.jsx',
  'Kanban.jsx',
  'Calendar.jsx',
  'Teams.jsx',
  'TeamMembers.jsx',
  'Analytics.jsx',
  'Notifications.jsx',
  'Profile.jsx',
  'Settings.jsx',
  'Subscriptions.jsx',
  'AdminDashboard.jsx',
];

runTest('All 23 Page modules exist and are valid JavaScript files', () => {
  for (const page of expectedPages) {
    const fullPath = join(ROOT_DIR, 'src', 'pages', page);
    assert.ok(existsSync(fullPath), `Page ${page} must exist on disk`);
    const content = readFileSync(fullPath, 'utf-8');
    assert.ok(content.includes('export default'), `Page ${page} must have a default export`);
  }
});

runTest('App.jsx configures ProtectedRoute with adminOnly for /admin', () => {
  const appCode = readFileSync(join(ROOT_DIR, 'src', 'App.jsx'), 'utf-8');
  assert.ok(appCode.includes('path="/admin"'), 'App.jsx must declare /admin route');
  assert.ok(appCode.includes('adminOnly'), 'App.jsx must protect /admin with adminOnly');
});

runTest('Sidebar.jsx hides Admin Console from non-admin users', () => {
  const sidebarCode = readFileSync(join(ROOT_DIR, 'src', 'components', 'layout', 'Sidebar.jsx'), 'utf-8');
  assert.ok(sidebarCode.includes('isAdmin'), 'Sidebar must evaluate isAdmin permission');
  assert.ok(sidebarCode.includes('wa363969@gmail.com'), 'Sidebar must include wa363969@gmail.com check');
  assert.ok(sidebarCode.includes('if (isAdmin)'), 'Admin console must be guarded inside if (isAdmin)');
});

runTest('Profile.jsx grants Super Admin role to wa363969@gmail.com', () => {
  const profileCode = readFileSync(join(ROOT_DIR, 'src', 'pages', 'Profile.jsx'), 'utf-8');
  assert.ok(profileCode.includes('wa363969@gmail.com'), 'Profile must check wa363969@gmail.com for admin status');
});


// -----------------------------------------------------------------------------
// 4. REGRESSION TESTING (Privacy, SEO, and Security Checks)
// -----------------------------------------------------------------------------
console.log('\n🔒 4. REGRESSION TESTS (No Leaks, SEO, PWA & Security Compliance)');

runTest('Login.jsx has ZERO exposed hardcoded admin login buttons', () => {
  const loginCode = readFileSync(join(ROOT_DIR, 'src', 'pages', 'Login.jsx'), 'utf-8');
  assert.equal(loginCode.includes('Instant Login as WA Admin'), false, 'Public login must not display instant admin button');
  assert.equal(loginCode.includes('wa363969@gmail.com'), false, 'Public login must not display private admin email');
});

runTest('Register.jsx has ZERO exposed hardcoded admin login buttons', () => {
  const registerCode = readFileSync(join(ROOT_DIR, 'src', 'pages', 'Register.jsx'), 'utf-8');
  assert.equal(registerCode.includes('Instant Access as WA Admin'), false, 'Public register must not display instant admin button');
  assert.equal(registerCode.includes('wa363969@gmail.com'), false, 'Public register must not display private admin email');
});

runTest('GoogleAuthModal.jsx does NOT expose private email to public clients', () => {
  const modalCode = readFileSync(join(ROOT_DIR, 'src', 'components', 'GoogleAuthModal.jsx'), 'utf-8');
  assert.equal(modalCode.includes('wa363969@gmail.com'), false, 'Google modal must not contain hardcoded private email');
});

runTest('robots.txt exists in public/ and is properly formatted', () => {
  const robotsPath = join(ROOT_DIR, 'public', 'robots.txt');
  assert.ok(existsSync(robotsPath), 'public/robots.txt must exist');
  const content = readFileSync(robotsPath, 'utf-8');
  assert.ok(content.includes('User-agent: *'));
  assert.ok(content.includes('Sitemap:'));
});

runTest('sitemap.xml exists in public/ and lists core application routes', () => {
  const sitemapPath = join(ROOT_DIR, 'public', 'sitemap.xml');
  assert.ok(existsSync(sitemapPath), 'public/sitemap.xml must exist');
  const content = readFileSync(sitemapPath, 'utf-8');
  assert.ok(content.includes('<loc>https://nexora-work.vercel.app/</loc>') || content.includes('<loc>https://nexora-work.com/</loc>'));
  assert.ok(content.includes('/login</loc>'));
});

runTest('PWA manifest.json exists with valid application metadata', () => {
  const manifestPath = join(ROOT_DIR, 'public', 'manifest.json');
  assert.ok(existsSync(manifestPath), 'public/manifest.json must exist');
  const content = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  assert.equal(content.short_name, 'NEXORA');
  assert.ok(content.name.includes('NEXORA'));
  assert.equal(content.display, 'standalone');
});

runTest('.env file contains valid Appwrite and Google Gemini AI configurations', () => {
  const envPath = join(ROOT_DIR, '.env');
  assert.ok(existsSync(envPath), '.env must exist');
  const content = readFileSync(envPath, 'utf-8');
  assert.ok(content.includes('VITE_APPWRITE_PROJECT_ID=6ae70bab0018cfc63b46'));
  assert.ok(content.includes('VITE_AI_API_KEY='));
  assert.ok(content.includes('VITE_AI_MODEL=gemini-3.5-flash-lite'));
});

console.log('\n================================================================');
console.log(`📊 TEST SUITE SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
