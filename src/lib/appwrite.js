import { Client, Account, Databases, Storage, Avatars, Teams, Functions } from 'appwrite';

const client = new Client();

const endpoint = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APPWRITE_ENDPOINT) || 'https://cloud.appwrite.io/v1';
const projectId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APPWRITE_PROJECT_ID) || '';

client
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const teams = new Teams(client);

const getEnv = (key, fallback = '') => (typeof import.meta !== 'undefined' && import.meta.env?.[key]) || fallback;

export const DATABASE_ID = getEnv('VITE_APPWRITE_DATABASE_ID', 'nexora_db');
export const COLLECTIONS = {
  USERS: getEnv('VITE_APPWRITE_USERS_COLLECTION_ID', 'users'),
  PROJECTS: getEnv('VITE_APPWRITE_PROJECTS_COLLECTION_ID', 'projects'),
  TASKS: getEnv('VITE_APPWRITE_TASKS_COLLECTION_ID', 'tasks'),
  TEAMS: getEnv('VITE_APPWRITE_TEAMS_COLLECTION_ID', 'teams'),
  TEAM_MEMBERS: getEnv('VITE_APPWRITE_TEAM_MEMBERS_COLLECTION_ID', 'team_members'),
  CONVERSATIONS: getEnv('VITE_APPWRITE_CONVERSATIONS_COLLECTION_ID', 'conversations'),
  MESSAGES: getEnv('VITE_APPWRITE_MESSAGES_COLLECTION_ID', 'messages'),
  NOTIFICATIONS: getEnv('VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID', 'notifications'),
  SUBSCRIPTIONS: getEnv('VITE_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID', 'subscriptions'),
  ACTIVITIES: getEnv('VITE_APPWRITE_ACTIVITIES_COLLECTION_ID', 'activities'),
  COMMENTS: getEnv('VITE_APPWRITE_COMMENTS_COLLECTION_ID', 'comments'),
  SETTINGS: getEnv('VITE_APPWRITE_SETTINGS_COLLECTION_ID', 'settings'),
};
export const BUCKETS = {
  FILES: getEnv('VITE_APPWRITE_STORAGE_BUCKET_ID', 'nexora_files'),
  AVATARS: getEnv('VITE_APPWRITE_AVATAR_BUCKET_ID', 'nexora_avatars'),
};

export { client };
export default client;
