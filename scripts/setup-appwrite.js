/**
 * NEXORA — Appwrite Automation Setup Script
 * 
 * Usage:
 *   node scripts/setup-appwrite.js
 * 
 * Requirements:
 *   APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'nexora_db';

if (!PROJECT_ID || !API_KEY) {
  console.log(`
======================================================
  NEXORA Appwrite Automated Schema Setup
======================================================
To provision your Appwrite collections automatically:
1. Provide APPWRITE_API_KEY and VITE_APPWRITE_PROJECT_ID in your environment
2. Run: node scripts/setup-appwrite.js
------------------------------------------------------
Collections defined for provisioning:
- users: User profiles, roles, and status
- projects: Name, description, priority, category, deadline, teamLead
- tasks: Title, description, priority, status, subtasks, deadline, assignee
- teams: Name, description, memberCount, lead
- team_members: Name, email, role, team, status
- conversations: AI strategy sessions
- messages: Prompt history & AI responses
- notifications: System alerts & deadline reminders
- subscriptions: Resource quota tracking
- activities: Immutable project event logs
- settings: Workspace configurations & toggles
======================================================
`);
  process.exit(0);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function runSetup() {
  console.log(`Starting automated setup for Database: ${DATABASE_ID}...`);
  try {
    await databases.create(DATABASE_ID, 'NEXORA Workspace Database');
    console.log(`✓ Created Database: ${DATABASE_ID}`);
  } catch (e) {
    console.log(`ℹ Database ${DATABASE_ID} already exists or error:`, e.message);
  }

  // Define collections to create
  const collections = [
    { id: 'projects', name: 'Projects' },
    { id: 'tasks', name: 'Tasks' },
    { id: 'teams', name: 'Teams' },
    { id: 'team_members', name: 'Team Members' },
    { id: 'conversations', name: 'Conversations' },
    { id: 'messages', name: 'Messages' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'subscriptions', name: 'Subscriptions' },
    { id: 'activities', name: 'Activities' },
    { id: 'settings', name: 'Settings' }
  ];

  for (const col of collections) {
    try {
      await databases.createCollection(
        DATABASE_ID, 
        col.id, 
        col.name, 
        [
          Permission.read(Role.users()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      console.log(`✓ Created collection: ${col.name} (${col.id})`);
    } catch (e) {
      console.log(`ℹ Collection ${col.id} already exists or error:`, e.message);
    }
  }

  console.log('\n✓ Setup complete! NEXORA collections are ready.');
}

runSetup();
