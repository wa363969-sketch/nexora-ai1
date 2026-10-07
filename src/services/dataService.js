import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite.js';
import { ID, Query } from 'appwrite';

// Check if Appwrite is genuinely configured
const hasAppwrite = Boolean(
  typeof import.meta !== 'undefined' &&
  import.meta.env?.VITE_APPWRITE_PROJECT_ID && 
  import.meta.env?.VITE_APPWRITE_DATABASE_ID &&
  import.meta.env?.VITE_APPWRITE_PROJECT_ID !== 'your_project_id'
);

// Initial Seed Data for Local Storage Fallback
const SEED_PROJECTS = [
  {
    $id: 'proj-1',
    name: 'NEXORA Mobile App v2',
    description: 'Next-generation iOS and Android client with offline sync, biometric login, and real-time push notifications.',
    category: 'Development',
    priority: 'urgent',
    status: 'active',
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    teamLead: 'Sarah Jenkins',
    color: '#3b82f6',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    $id: 'proj-2',
    name: 'Design System & Token Library',
    description: 'Universal Figma-to-code design system token architecture with dark/light themes and accessibility auditing.',
    category: 'Design',
    priority: 'high',
    status: 'active',
    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    teamLead: 'Elena Rostova',
    color: '#8b5cf6',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    $id: 'proj-3',
    name: 'Enterprise SOC2 & GDPR Compliance',
    description: 'Data encryption-at-rest audits, access logging pipeline, and automated vulnerability scanning for enterprise readiness.',
    category: 'Operations',
    priority: 'urgent',
    status: 'completed',
    deadline: new Date(Date.now() - 2 * 86400000).toISOString(),
    teamLead: 'Marcus Vance',
    color: '#10b981',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    $id: 'proj-4',
    name: 'AI Streaming Context Engine',
    description: 'Sub-second latency token streaming, vector search embeddings, and automatic task dependency inference.',
    category: 'Research',
    priority: 'medium',
    status: 'active',
    deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    teamLead: 'Alex Rivera',
    color: '#ec4899',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  }
];

const SEED_TASKS = [
  {
    $id: 'task-1',
    projectId: 'proj-1',
    projectName: 'NEXORA Mobile App v2',
    title: 'Implement Biometric & Apple FaceID Authentication',
    description: 'Integrate native Keychain/Keystore cryptographic storage with fallback PIN.',
    priority: 'urgent',
    status: 'in-progress',
    assigneeName: 'Alex Rivera',
    assigneeAvatar: 'AR',
    deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    subtasks: [
      { id: 'st-1', title: 'Keychain bridge module', done: true },
      { id: 'st-2', title: 'Fallback PIN screen layout', done: true },
      { id: 'st-3', title: 'Session revocation webhook', done: false },
    ],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    $id: 'task-2',
    projectId: 'proj-1',
    projectName: 'NEXORA Mobile App v2',
    title: 'Offline SQLite Sync Queue',
    description: 'Ensure queued mutations sync gracefully once client reconnects to WebSocket gateway.',
    priority: 'high',
    status: 'todo',
    assigneeName: 'Sarah Jenkins',
    assigneeAvatar: 'SJ',
    deadline: new Date(Date.now() + 6 * 86400000).toISOString(),
    subtasks: [
      { id: 'st-4', title: 'Conflict resolution resolver', done: false },
      { id: 'st-5', title: 'Optimistic UI update hooks', done: false },
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    $id: 'task-3',
    projectId: 'proj-2',
    projectName: 'Design System & Token Library',
    title: 'Tailwind CSS v4 Token Mapping & Color Audit',
    description: 'Map hex values to custom CSS variables with automated contrast ratio verification.',
    priority: 'medium',
    status: 'done',
    assigneeName: 'Elena Rostova',
    assigneeAvatar: 'ER',
    deadline: new Date(Date.now() - 1 * 86400000).toISOString(),
    subtasks: [
      { id: 'st-6', title: 'Audit WCAG AA colors', done: true },
      { id: 'st-7', title: 'Export JSON token dictionary', done: true },
    ],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    $id: 'task-4',
    projectId: 'proj-3',
    projectName: 'Enterprise SOC2 & GDPR Compliance',
    title: 'Deploy Automated Database Backup Verification',
    description: 'Implement daily automated restore test to isolated sandbox and verify checksums.',
    priority: 'urgent',
    status: 'done',
    assigneeName: 'Marcus Vance',
    assigneeAvatar: 'MV',
    deadline: new Date(Date.now() - 4 * 86400000).toISOString(),
    subtasks: [
      { id: 'st-8', title: 'Write S3 restore script', done: true },
      { id: 'st-9', title: 'Alerting on checksum mismatch', done: true },
    ],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    $id: 'task-5',
    projectId: 'proj-4',
    projectName: 'AI Streaming Context Engine',
    title: 'Gemini 2.0 Flash Streaming SSE Gateway',
    description: 'Enable Server-Sent Events with backpressure regulation for fast multi-token responses.',
    priority: 'high',
    status: 'in-review',
    assigneeName: 'Alex Rivera',
    assigneeAvatar: 'AR',
    deadline: new Date(Date.now() + 2 * 86400000).toISOString(),
    subtasks: [
      { id: 'st-10', title: 'SSE chunk decoder', done: true },
      { id: 'st-11', title: 'Rate limiter interceptor', done: true },
      { id: 'st-12', title: 'Token usage accumulator', done: false },
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    $id: 'task-6',
    projectId: 'proj-2',
    projectName: 'Design System & Token Library',
    title: 'Glassmorphism Card & Modal Transitions',
    description: 'Polish backdrop filters and Framer Motion spring physics on dialogs.',
    priority: 'low',
    status: 'backlog',
    assigneeName: 'Elena Rostova',
    assigneeAvatar: 'ER',
    deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
    subtasks: [],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

const SEED_TEAMS = [
  {
    $id: 'team-1',
    name: 'Core Engineering Guild',
    description: 'Full-stack platform, infrastructure, and mobile client development.',
    memberCount: 8,
    lead: 'Sarah Jenkins',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    $id: 'team-2',
    name: 'Product Design & UX',
    description: 'UI/UX architecture, design systems, and rapid prototyping.',
    memberCount: 4,
    lead: 'Elena Rostova',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    $id: 'team-3',
    name: 'AI & Data Intelligence',
    description: 'Large language model fine-tuning, embeddings, and analytics pipelines.',
    memberCount: 5,
    lead: 'Alex Rivera',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  }
];

const SEED_MEMBERS = [
  {
    $id: 'mem-super-admin',
    name: 'WA Admin',
    email: 'wa363969@gmail.com',
    role: 'Super Admin / Owner',
    team: 'Executive Leadership',
    status: 'active',
    joined: 'Jan 01, 2024',
    tasksCount: 32,
  },
  {
    $id: 'mem-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@nexora.io',
    role: 'Lead Architect',
    team: 'Core Engineering Guild',
    status: 'active',
    joined: 'Jan 15, 2024',
    tasksCount: 14,
  },
  {
    $id: 'mem-2',
    name: 'Marcus Vance',
    email: 'marcus.v@nexora.io',
    role: 'Admin / Product Director',
    team: 'Core Engineering Guild',
    status: 'active',
    joined: 'Feb 02, 2024',
    tasksCount: 9,
  },
  {
    $id: 'mem-3',
    name: 'Elena Rostova',
    email: 'elena.r@nexora.io',
    role: 'Principal Designer',
    team: 'Product Design & UX',
    status: 'active',
    joined: 'Feb 20, 2024',
    tasksCount: 12,
  },
  {
    $id: 'mem-4',
    name: 'Alex Rivera',
    email: 'alex.r@nexora.io',
    role: 'Senior AI Engineer',
    team: 'AI & Data Intelligence',
    status: 'active',
    joined: 'Mar 10, 2024',
    tasksCount: 11,
  },
  {
    $id: 'mem-5',
    name: 'David Kim',
    email: 'david.k@nexora.io',
    role: 'DevOps & SRE',
    team: 'Core Engineering Guild',
    status: 'active',
    joined: 'Apr 01, 2024',
    tasksCount: 6,
  }
];

const SEED_NOTIFICATIONS = [
  {
    $id: 'notif-1',
    title: 'Task Assigned',
    message: 'Sarah Jenkins assigned you to "Offline SQLite Sync Queue"',
    type: 'assignment',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    $id: 'notif-2',
    title: 'Deadline Approaching',
    message: '"Implement Biometric Authentication" is due in 3 days',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    $id: 'notif-3',
    title: 'Project Milestone Achieved',
    message: '"Enterprise SOC2 Compliance" has reached 100% completion!',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  }
];

// -------------------------------------------------------------
// WORKSPACE MULTI-TENANCY & DATA ISOLATION
// -------------------------------------------------------------
export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 0,
    priceAnnual: 0,
    priceDisplay: '$0',
    period: 'Forever free',
    desc: 'Ideal for independent developers and solopreneurs exploring AI project workflows.',
    maxProjects: 5,
    maxTasks: 50,
    maxTeamMembers: 3,
    maxAiQueries: 100,
    badge: 'Free Starter',
    color: 'from-blue-500 to-cyan-500',
    popular: false,
    cta: 'Current Plan',
    features: [
      'Up to 5 active projects',
      '50 tasks with Kanban & List view',
      '1 team workspace (up to 3 members)',
      'Basic AI Assistant (100 msgs/mo)',
      'Community Discord support',
      '7-day activity history'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Workspace',
    priceMonthly: 15,
    priceAnnual: 12,
    priceDisplay: '$12',
    period: 'per member / month',
    desc: 'For high-velocity product teams who need complete AI automation and unlimited scale.',
    maxProjects: Infinity,
    maxTasks: Infinity,
    maxTeamMembers: Infinity,
    maxAiQueries: 5000,
    badge: 'Pro Workspace',
    color: 'from-violet-500 to-purple-500',
    popular: true,
    cta: 'Upgrade to Pro',
    features: [
      'Unlimited active projects & tasks',
      'Unlimited team members & guest roles',
      'Advanced AI Co-Pilot (Gemini 3.5 & GPT-4o)',
      '5,000 AI generations / month',
      'Interactive Drag & Drop Kanban & Calendar',
      'Priority email & ticket support',
      'Full activity audit trails & reports',
      'Custom workflow triggers'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise SLA',
    priceMonthly: 49,
    priceAnnual: 39,
    priceDisplay: '$39',
    period: 'per member / month, custom SLA',
    desc: 'For organizations demanding custom security, dedicated AI capacity, and private deployments.',
    maxProjects: Infinity,
    maxTasks: Infinity,
    maxTeamMembers: Infinity,
    maxAiQueries: 50000,
    badge: 'Enterprise SLA',
    color: 'from-emerald-400 to-teal-500',
    popular: false,
    cta: 'Upgrade to Enterprise',
    features: [
      'Everything in Pro plan',
      'Bring Your Own Key (BYOK) AI models',
      'Dedicated Appwrite cluster option',
      'SSO (SAML, Okta, Azure AD) integration',
      'Dedicated customer success architect',
      'Custom 99.99% uptime SLA',
      'Custom contract & invoicing terms',
      'Advanced admin audit logs'
    ]
  }
];

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('nexora_user_session');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
}

function isCurrentAdmin() {
  const u = getCurrentUser();
  return Boolean(
    u?.email === 'wa363969@gmail.com' || 
    u?.role === 'admin' || 
    u?.labels?.includes('admin')
  );
}

function getUserScope() {
  const u = getCurrentUser();
  if (!u) return 'guest';
  if (isCurrentAdmin()) {
    return 'admin_master';
  }
  if (u.email) {
    return 'user_' + u.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }
  return 'user_' + (u.$id || 'client');
}

function getScopedSeed(key) {
  const admin = isCurrentAdmin();
  const u = getCurrentUser();

  if (key === 'projects') {
    if (admin) return SEED_PROJECTS;
    return [
      {
        $id: 'proj-client-welcome',
        name: '🚀 My First Workspace Project',
        description: 'Welcome to your private Nexora workspace. You can manage tasks, track deadlines, and collaborate with AI here.',
        category: 'Productivity',
        priority: 'high',
        status: 'active',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        teamLead: u?.name || 'You',
        color: '#3b82f6',
        createdAt: new Date().toISOString(),
      }
    ];
  }

  if (key === 'tasks') {
    if (admin) return SEED_TASKS;
    const clientName = u?.name || 'You';
    const clientInitials = (clientName.slice(0, 2) || 'U').toUpperCase();
    return [
      {
        $id: 'task-c-1',
        projectId: 'proj-client-welcome',
        projectName: '🚀 My First Workspace Project',
        title: 'Explore your private Kanban board',
        description: 'Drag and drop cards across columns to track tasks in real time.',
        priority: 'urgent',
        status: 'in-progress',
        assigneeName: clientName,
        assigneeAvatar: clientInitials,
        deadline: new Date(Date.now() + 2 * 86400000).toISOString(),
        subtasks: [
          { id: 'st-c1', title: 'Open the Kanban board view', done: true },
          { id: 'st-c2', title: 'Drag this card to "Done"', done: false },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        $id: 'task-c-2',
        projectId: 'proj-client-welcome',
        projectName: '🚀 My First Workspace Project',
        title: 'Ask the AI Assistant a question',
        description: 'Use the AI Co-Pilot to break down projects or write technical specifications.',
        priority: 'high',
        status: 'todo',
        assigneeName: clientName,
        assigneeAvatar: clientInitials,
        deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
        subtasks: [],
        createdAt: new Date().toISOString(),
      },
      {
        $id: 'task-c-3',
        projectId: 'proj-client-welcome',
        projectName: '🚀 My First Workspace Project',
        title: 'Create your first custom task',
        description: 'Click "+ Add Task" to set priority, deadlines, and checklists.',
        priority: 'medium',
        status: 'todo',
        assigneeName: clientName,
        assigneeAvatar: clientInitials,
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        subtasks: [],
        createdAt: new Date().toISOString(),
      }
    ];
  }

  if (key === 'conversations') {
    if (admin) return SEED_CONVERSATIONS;
    return []; // Clean fresh AI chat history for each new client
  }

  if (key === 'notifications') {
    if (admin) return SEED_NOTIFICATIONS;
    return [
      {
        $id: 'notif-welcome',
        title: 'Welcome to NEXORA',
        message: `Welcome, ${u?.name || 'Member'}! Your private workspace is ready for work.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      }
    ];
  }

  if (key === 'teams') {
    return SEED_TEAMS;
  }

  if (key === 'members') {
    return SEED_MEMBERS;
  }

  if (key === 'subscription') {
    if (admin) {
      return {
        planId: 'enterprise',
        planName: 'Enterprise SLA',
        billingCycle: 'annual',
        status: 'active',
        startDate: new Date(Date.now() - 60 * 86400000).toISOString(),
        nextBillingDate: new Date(Date.now() + 305 * 86400000).toISOString(),
        aiQueriesUsed: 218,
        maxAiQueries: 50000,
        paymentMethod: { brand: 'Mastercard', last4: '8899', exp: '12/29' },
        invoices: [
          {
            id: 'INV-2026-001',
            date: new Date(Date.now() - 60 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            plan: 'Enterprise SLA (Annual)',
            amount: '$468.00',
            status: 'Paid',
            pdfUrl: '#'
          }
        ]
      };
    }
    const initialPlanId = u?.selectedPlan || 'starter';
    const planObj = SUBSCRIPTION_PLANS.find(p => p.id === initialPlanId) || SUBSCRIPTION_PLANS[0];
    const isPaid = planObj.id !== 'starter';

    return {
      planId: planObj.id,
      planName: planObj.name,
      billingCycle: u?.selectedBilling || 'monthly',
      status: isPaid ? 'trialing' : 'active',
      startDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + (isPaid ? 14 : 30) * 86400000).toISOString(),
      aiQueriesUsed: 3,
      maxAiQueries: planObj.maxAiQueries,
      paymentMethod: isPaid
        ? { brand: '14-Day Free Trial', last4: 'TRIAL', exp: '14 Days' }
        : { brand: 'Free Tier', last4: 'N/A', exp: 'N/A' },
      invoices: [
        {
          id: 'INV-' + Date.now().toString().slice(-6),
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          plan: `${planObj.name} ${isPaid ? '(14-Day Free Trial)' : '(Free Tier)'}`,
          amount: '$0.00',
          status: 'Paid',
          pdfUrl: '#'
        }
      ]
    };
  }

  return [];
}

// Scoped Helper to get / set LocalStorage
function getLocal(key, fallbackSeed) {
  const scope = getUserScope();
  const scopedKey = `nexora_${scope}_${key}`;
  try {
    const raw = localStorage.getItem(scopedKey);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${scopedKey}:`, e);
  }
  const seed = getScopedSeed(key) || fallbackSeed;
  localStorage.setItem(scopedKey, JSON.stringify(seed));
  return seed;
}

function setLocal(key, value) {
  const scope = getUserScope();
  const scopedKey = `nexora_${scope}_${key}`;
  try {
    localStorage.setItem(scopedKey, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${scopedKey}:`, e);
  }
}

// -------------------------------------------------------------
// PROJECT OPERATIONS
// -------------------------------------------------------------
export async function getProjects() {
  if (hasAppwrite) {
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROJECTS);
      if (res.documents?.length > 0) return res.documents;
    } catch (e) {
      console.warn('Appwrite projects fetch failed, using local store:', e.message);
    }
  }
  return getLocal('projects', SEED_PROJECTS);
}

export async function createProject(data) {
  const quota = await checkQuota('projects');
  if (!quota.allowed) {
    throw new Error(`Plan limit reached: The ${quota.planName} tier allows up to ${quota.max} projects. Upgrade to Pro for unlimited projects!`);
  }

  const newProj = {
    $id: 'proj-' + Date.now(),
    name: data.name,
    description: data.description || '',
    category: data.category || 'Development',
    priority: data.priority || 'medium',
    status: data.status || 'active',
    deadline: data.deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
    teamLead: data.teamLead || 'You',
    color: data.color || '#3b82f6',
    createdAt: new Date().toISOString(),
  };

  if (hasAppwrite) {
    try {
      const res = await databases.createDocument(DATABASE_ID, COLLECTIONS.PROJECTS, ID.unique(), newProj);
      return res;
    } catch (e) {
      console.warn('Appwrite project create failed, saving to local store:', e.message);
    }
  }

  const list = getLocal('projects', SEED_PROJECTS);
  list.unshift(newProj);
  setLocal('projects', list);
  return newProj;
}

export async function updateProject(id, data) {
  if (hasAppwrite) {
    try {
      const res = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROJECTS, id, data);
      return res;
    } catch (e) {
      console.warn('Appwrite project update failed, updating local store:', e.message);
    }
  }

  const list = getLocal('projects', SEED_PROJECTS);
  const updated = list.map(p => p.$id === id ? { ...p, ...data } : p);
  setLocal('projects', updated);
  return updated.find(p => p.$id === id);
}

export async function deleteProject(id) {
  if (hasAppwrite) {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROJECTS, id);
    } catch (e) {
      console.warn('Appwrite project delete failed:', e.message);
    }
  }

  const list = getLocal('projects', SEED_PROJECTS);
  const filtered = list.filter(p => p.$id !== id);
  setLocal('projects', filtered);

  // Also remove associated tasks
  const tasks = getLocal('tasks', SEED_TASKS);
  setLocal('tasks', tasks.filter(t => t.projectId !== id));
  return true;
}

// -------------------------------------------------------------
// TASK OPERATIONS
// -------------------------------------------------------------
export async function getTasks(projectId = null) {
  if (hasAppwrite) {
    try {
      const queries = projectId ? [Query.equal('projectId', projectId)] : [];
      const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, queries);
      if (res.documents?.length > 0) return res.documents;
    } catch (e) {
      console.warn('Appwrite tasks fetch failed, using local store:', e.message);
    }
  }

  const tasks = getLocal('tasks', SEED_TASKS);
  if (projectId) {
    return tasks.filter(t => t.projectId === projectId);
  }
  return tasks;
}

export async function createTask(data) {
  const quota = await checkQuota('tasks');
  if (!quota.allowed) {
    throw new Error(`Plan limit reached: The ${quota.planName} tier allows up to ${quota.max} tasks. Upgrade to Pro for unlimited tasks!`);
  }

  const newTask = {
    $id: 'task-' + Date.now(),
    projectId: data.projectId || 'proj-1',
    projectName: data.projectName || 'General Workspace',
    title: data.title,
    description: data.description || '',
    priority: data.priority || 'medium',
    status: data.status || 'todo',
    assigneeName: data.assigneeName || 'You',
    assigneeAvatar: (data.assigneeName || 'YO').slice(0, 2).toUpperCase(),
    deadline: data.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
    subtasks: data.subtasks || [],
    createdAt: new Date().toISOString(),
  };

  if (hasAppwrite) {
    try {
      const res = await databases.createDocument(DATABASE_ID, COLLECTIONS.TASKS, ID.unique(), newTask);
      return res;
    } catch (e) {
      console.warn('Appwrite task create failed, saving to local store:', e.message);
    }
  }

  const list = getLocal('tasks', SEED_TASKS);
  list.unshift(newTask);
  setLocal('tasks', list);
  return newTask;
}

export async function updateTask(id, data) {
  if (hasAppwrite) {
    try {
      const res = await databases.updateDocument(DATABASE_ID, COLLECTIONS.TASKS, id, data);
      return res;
    } catch (e) {
      console.warn('Appwrite task update failed, updating local store:', e.message);
    }
  }

  const list = getLocal('tasks', SEED_TASKS);
  const updated = list.map(t => t.$id === id ? { ...t, ...data } : t);
  setLocal('tasks', updated);
  return updated.find(t => t.$id === id);
}

export async function updateTaskStatus(id, status) {
  return updateTask(id, { status });
}

export async function deleteTask(id) {
  if (hasAppwrite) {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TASKS, id);
    } catch (e) {
      console.warn('Appwrite task delete failed:', e.message);
    }
  }

  const list = getLocal('tasks', SEED_TASKS);
  const filtered = list.filter(t => t.$id !== id);
  setLocal('tasks', filtered);
  return true;
}

// -------------------------------------------------------------
// TEAMS & MEMBERS
// -------------------------------------------------------------
export async function getTeams() {
  return getLocal('teams', SEED_TEAMS);
}

export async function createTeam(data) {
  const newTeam = {
    $id: 'team-' + Date.now(),
    name: data.name,
    description: data.description || '',
    memberCount: 1,
    lead: data.lead || 'You',
    createdAt: new Date().toISOString(),
  };
  const list = getLocal('teams', SEED_TEAMS);
  list.unshift(newTeam);
  setLocal('teams', list);
  return newTeam;
}

export async function getMembers() {
  return getLocal('members', SEED_MEMBERS);
}

export async function inviteMember(data) {
  const newMember = {
    $id: 'mem-' + Date.now(),
    name: data.name || data.email.split('@')[0],
    email: data.email,
    role: data.role || 'Member',
    team: data.team || 'Core Engineering Guild',
    status: 'pending',
    joined: 'Just now',
    tasksCount: 0,
  };
  const list = getLocal('members', SEED_MEMBERS);
  list.unshift(newMember);
  setLocal('members', list);
  return newMember;
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
export async function getNotifications() {
  return getLocal('notifications', SEED_NOTIFICATIONS);
}

export async function markNotificationAsRead(id) {
  const list = getLocal('notifications', SEED_NOTIFICATIONS);
  const updated = list.map(n => n.$id === id ? { ...n, read: true } : n);
  setLocal('notifications', updated);
  return updated;
}

export async function markAllNotificationsRead() {
  const list = getLocal('notifications', SEED_NOTIFICATIONS);
  const updated = list.map(n => ({ ...n, read: true }));
  setLocal('notifications', updated);
  return updated;
}

// -------------------------------------------------------------
// AI CONVERSATION HISTORIES
// -------------------------------------------------------------
const SEED_CONVERSATIONS = [];

export async function getConversations() {
  return getLocal('conversations', SEED_CONVERSATIONS);
}

export async function saveConversation(conversation) {
  const list = getLocal('conversations', SEED_CONVERSATIONS);
  const idx = list.findIndex(c => c.id === conversation.id);
  if (idx >= 0) {
    list[idx] = conversation;
  } else {
    list.unshift(conversation);
  }
  setLocal('conversations', list);
  return conversation;
}

export async function deleteConversation(id) {
  const list = getLocal('conversations', SEED_CONVERSATIONS);
  const filtered = list.filter(c => c.id !== id);
  setLocal('conversations', filtered);
  return true;
}

// -------------------------------------------------------------
// SUBSCRIPTIONS & RESOURCE QUOTAS
// -------------------------------------------------------------
export async function getSubscription() {
  const seed = getScopedSeed('subscription');
  const sub = getLocal('subscription', seed);
  return sub;
}

export function getSubscriptionPlans() {
  return SUBSCRIPTION_PLANS;
}

export async function checkQuota(resourceType) {
  const sub = await getSubscription();
  const isLocked = sub.status === 'pending_approval' || sub.status === 'rejected';
  // If subscription is awaiting admin approval or rejected, lock to Starter limits
  const plan = isLocked 
    ? SUBSCRIPTION_PLANS[0] 
    : (SUBSCRIPTION_PLANS.find(p => p.id === sub.planId) || SUBSCRIPTION_PLANS[0]);

  if (resourceType === 'projects') {
    const projects = await getProjects();
    const current = projects.length;
    const max = plan.maxProjects;
    const allowed = max === Infinity || current < max;
    return {
      allowed,
      current,
      max: max === Infinity ? 'Unlimited' : max,
      planId: plan.id,
      planName: plan.name,
      remaining: max === Infinity ? 'Unlimited' : Math.max(0, max - current)
    };
  }

  if (resourceType === 'tasks') {
    const tasks = await getTasks();
    const current = tasks.length;
    const max = plan.maxTasks;
    const allowed = max === Infinity || current < max;
    return {
      allowed,
      current,
      max: max === Infinity ? 'Unlimited' : max,
      planId: plan.id,
      planName: plan.name,
      remaining: max === Infinity ? 'Unlimited' : Math.max(0, max - current)
    };
  }

  if (resourceType === 'ai') {
    const current = sub.aiQueriesUsed || 0;
    const max = plan.maxAiQueries;
    const allowed = current < max;
    return {
      allowed,
      current,
      max,
      planId: plan.id,
      planName: plan.name,
      remaining: Math.max(0, max - current)
    };
  }

  return { allowed: true, current: 0, max: 'Unlimited', planId: plan.id, planName: plan.name };
}

export async function recordAIQuery() {
  const sub = await getSubscription();
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === sub.planId) || SUBSCRIPTION_PLANS[0];
  const updated = {
    ...sub,
    aiQueriesUsed: (sub.aiQueriesUsed || 0) + 1,
    maxAiQueries: plan.maxAiQueries
  };
  setLocal('subscription', updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexora-subscription-changed', { detail: updated }));
  }
  return updated.aiQueriesUsed;
}

export async function updateSubscription({ planId, billingCycle = 'monthly', paymentDetails = null, isTrial = false, promoCode = '' }) {
  const sub = await getSubscription();
  const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!targetPlan) throw new Error('Invalid plan selection');

  let price = billingCycle === 'annual' ? targetPlan.priceAnnual : targetPlan.priceMonthly;
  const isDiscounted = promoCode && ['FREEPRO', 'NEXORA100', 'VIP', 'DISCOUNT100'].includes(promoCode.trim().toUpperCase());
  if (isDiscounted) {
    price = 0;
  }

  const invoiceAmount = isTrial || price === 0 ? '$0.00' : `$${(billingCycle === 'annual' ? price * 12 : price).toFixed(2)}`;
  const invoiceId = 'INV-' + (Math.floor(100000 + Math.random() * 900000));
  
  const newInvoice = {
    id: invoiceId,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    plan: `${targetPlan.name} (${billingCycle === 'annual' ? 'Annual' : 'Monthly'}${isTrial ? ' - 14-Day Trial' : ''}${isDiscounted ? ' - Promo' : ''})`,
    amount: invoiceAmount,
    status: 'Paid',
    pdfUrl: '#'
  };

  const updatedSub = {
    ...sub,
    planId: targetPlan.id,
    planName: targetPlan.name,
    billingCycle,
    status: isTrial ? 'trialing' : 'active',
    startDate: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + (isTrial ? 14 : (billingCycle === 'annual' ? 365 : 30)) * 86400000).toISOString(),
    maxAiQueries: targetPlan.maxAiQueries,
    paymentMethod: paymentDetails || (isTrial ? { brand: '14-Day Free Trial', last4: 'TRIAL', exp: '14 Days' } : { brand: 'Visa', last4: '4242', exp: '12/28' }),
    invoices: [newInvoice, ...(sub.invoices || [])]
  };

  setLocal('subscription', updatedSub);

  try {
    const notifs = getLocal('notifications', SEED_NOTIFICATIONS);
    notifs.unshift({
      $id: 'notif-sub-' + Date.now(),
      title: '🎉 Plan Subscription Active',
      message: `Your workspace has been successfully upgraded to the ${targetPlan.name} tier (${billingCycle}).`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    });
    setLocal('notifications', notifs);
  } catch (e) {
    // ignore
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexora-subscription-changed', { detail: updatedSub }));
  }

  return updatedSub;
}

export async function cancelSubscription() {
  const sub = await getSubscription();
  const starterPlan = SUBSCRIPTION_PLANS[0];
  const updatedSub = {
    ...sub,
    planId: starterPlan.id,
    planName: starterPlan.name,
    status: 'active',
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    maxAiQueries: starterPlan.maxAiQueries,
    paymentMethod: { brand: 'Free Tier', last4: 'N/A', exp: 'N/A' },
  };

  setLocal('subscription', updatedSub);

  try {
    const notifs = getLocal('notifications', SEED_NOTIFICATIONS);
    notifs.unshift({
      $id: 'notif-sub-cancel-' + Date.now(),
      title: 'Subscription Adjusted',
      message: `Your subscription has been switched to the Free Starter tier.`,
      type: 'assignment',
      read: false,
      createdAt: new Date().toISOString(),
    });
    setLocal('notifications', notifs);
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexora-subscription-changed', { detail: updatedSub }));
  }

  return updatedSub;
}

// -------------------------------------------------------------
// MULTI-CLIENT WORKSPACE REGISTRY & ADMIN VISUALIZATION
// -------------------------------------------------------------

const SEED_CLIENTS_REGISTRY = [
  {
    email: 'sarah.jenkins@acme-cloud.io',
    name: 'Sarah Jenkins',
    company: 'Acme Cloud Systems',
    planId: 'pro',
    planName: 'Pro Tier',
    status: 'active',
    joinedDate: '2026-08-14T10:00:00.000Z',
    lastActivity: new Date(Date.now() - 2 * 3600000).toISOString(),
    aiQueriesUsed: 842,
    maxAiQueries: 5000,
    projects: [
      { $id: 'p-sarah-1', name: 'Cloud Migration Pipeline', status: 'active', priority: 'urgent', deadline: '2026-11-20', tasksCount: 14, color: '#3b82f6', category: 'DevOps' },
      { $id: 'p-sarah-2', name: 'Zero Trust Auth Bridge', status: 'active', priority: 'high', deadline: '2026-12-05', tasksCount: 8, color: '#8b5cf6', category: 'Security' }
    ],
    tasks: [
      { $id: 't-s-1', title: 'Audit AWS IAM Least-Privilege Roles', status: 'in-progress', priority: 'urgent', deadline: 'Tomorrow', projectName: 'Zero Trust Auth Bridge' },
      { $id: 't-s-2', title: 'Deploy Terraform VPC peering', status: 'done', priority: 'high', deadline: 'Yesterday', projectName: 'Cloud Migration Pipeline' },
      { $id: 't-s-3', title: 'Configure CloudWatch latency alarms', status: 'todo', priority: 'medium', deadline: 'In 3 days', projectName: 'Cloud Migration Pipeline' }
    ]
  },
  {
    email: 'marcus.v@fintech-core.com',
    name: 'Marcus Vance',
    company: 'FinTech Core Labs',
    planId: 'enterprise',
    planName: 'Enterprise SLA',
    status: 'active',
    joinedDate: '2026-05-10T12:00:00.000Z',
    lastActivity: new Date(Date.now() - 5 * 3600000).toISOString(),
    aiQueriesUsed: 4210,
    maxAiQueries: 50000,
    projects: [
      { $id: 'p-marcus-1', name: 'PCI-DSS v4.0 Compliance Audit', status: 'active', priority: 'urgent', deadline: '2026-11-15', tasksCount: 22, color: '#10b981', category: 'Compliance' },
      { $id: 'p-marcus-2', name: 'Real-time Fraud Detection ML', status: 'active', priority: 'urgent', deadline: '2026-11-30', tasksCount: 19, color: '#ec4899', category: 'AI & Data' },
      { $id: 'p-marcus-3', name: 'Stripe Settlement Reconciliation', status: 'completed', priority: 'high', deadline: '2026-10-28', tasksCount: 11, color: '#f59e0b', category: 'Finance' }
    ],
    tasks: [
      { $id: 't-m-1', title: 'Complete SOC2 Type II external audit report', status: 'done', priority: 'urgent', deadline: 'Oct 28', projectName: 'PCI-DSS v4.0 Compliance' },
      { $id: 't-m-2', title: 'Benchmark XGBoost latency on Kafka stream', status: 'in-progress', priority: 'high', deadline: 'Nov 04', projectName: 'Real-time Fraud Detection' },
      { $id: 't-m-3', title: 'HSM Key Rotation rehearsal', status: 'todo', priority: 'urgent', deadline: 'Nov 12', projectName: 'PCI-DSS v4.0 Compliance' }
    ]
  },
  {
    email: 'elena.rostova@designflow.studio',
    name: 'Elena Rostova',
    company: 'DesignFlow Studio',
    planId: 'pro',
    planName: 'Pro Tier',
    status: 'active',
    joinedDate: '2026-09-01T08:30:00.000Z',
    lastActivity: new Date(Date.now() - 14 * 3600000).toISOString(),
    aiQueriesUsed: 1290,
    maxAiQueries: 5000,
    projects: [
      { $id: 'p-elena-1', name: 'Design Tokens & Tailwind v4 Migration', status: 'active', priority: 'high', deadline: '2026-11-25', tasksCount: 16, color: '#6366f1', category: 'Design System' }
    ],
    tasks: [
      { $id: 't-e-1', title: 'Figma-to-Code component sync test', status: 'done', priority: 'high', deadline: 'Oct 30', projectName: 'Design Tokens Migration' },
      { $id: 't-e-2', title: 'WCAG 2.1 AAA contrast audit in dark mode', status: 'in-progress', priority: 'medium', deadline: 'Nov 06', projectName: 'Design Tokens Migration' }
    ]
  },
  {
    email: 'alex.rivera@solodev.me',
    name: 'Alex Rivera',
    company: 'Indie Builder',
    planId: 'starter',
    planName: 'Starter Free',
    status: 'active',
    joinedDate: '2026-10-18T14:00:00.000Z',
    lastActivity: new Date(Date.now() - 36 * 3600000).toISOString(),
    aiQueriesUsed: 44,
    maxAiQueries: 100,
    projects: [
      { $id: 'p-alex-1', name: 'SaaS Micro-Landing Page', status: 'active', priority: 'medium', deadline: '2026-11-18', tasksCount: 5, color: '#06b6d4', category: 'Productivity' }
    ],
    tasks: [
      { $id: 't-a-1', title: 'Setup Vercel Edge functions', status: 'done', priority: 'medium', deadline: 'Nov 01', projectName: 'SaaS Micro-Landing Page' },
      { $id: 't-a-2', title: 'Implement Stripe checkout webhook', status: 'in-progress', priority: 'high', deadline: 'Nov 05', projectName: 'SaaS Micro-Landing Page' }
    ]
  }
];

// -------------------------------------------------------------
// REAL ADMIN BILLING CONFIG & APPROVAL-BASED SUBSCRIPTIONS
// -------------------------------------------------------------

export const DEFAULT_ADMIN_BILLING = {
  bankName: 'Meezan Bank / HBL / Raast Instant Payment',
  accountTitle: 'WA Admin / NEXORA Official',
  accountNumber: '03404942126',
  raastId: '03404942126',
  easypaisa: '03404942126',
  jazzcash: '03404942126',
  email: 'wa363969@gmail.com',
  whatsapp: '03404942126',
  instructions: 'Please transfer the plan fee to any of the verified accounts below. Once transferred, submit your Transaction ID (TRX) and sender account name. You can also send the payment slip directly to Admin on WhatsApp (03404942126). Your plan will unlock once verified and approved by Admin.'
};

export function getAdminBillingConfig() {
  try {
    const raw = localStorage.getItem('nexora_admin_billing_config');
    if (raw) return { ...DEFAULT_ADMIN_BILLING, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_ADMIN_BILLING;
}

export function saveAdminBillingConfig(config) {
  try {
    localStorage.setItem('nexora_admin_billing_config', JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize starter project, tasks, and subscription for a new client so their workspace is never blank
 */
export function initializeClientScopeIfEmpty(normalizedEmail, clientName, selectedPlan, selectedBilling) {
  const scope = 'user_' + normalizedEmail.replace(/[^a-z0-9]/g, '_');
  const projKey = `nexora_${scope}_projects`;
  const taskKey = `nexora_${scope}_tasks`;
  const subKey = `nexora_${scope}_subscription`;
  
  if (!localStorage.getItem(projKey)) {
    const welcomeProjects = [
      {
        $id: 'proj-' + normalizedEmail.replace(/[^a-z0-9]/g, '-') + '-1',
        name: '🚀 ' + (clientName || 'My') + ' Launch Workspace',
        description: 'Primary project workspace. Track sprint milestones, collaborate with AI, and manage team deliverables.',
        category: 'Productivity',
        priority: 'high',
        status: 'active',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        teamLead: clientName || 'Workspace Owner',
        color: '#3b82f6',
        createdAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(projKey, JSON.stringify(welcomeProjects));
  }

  if (!localStorage.getItem(taskKey)) {
    const welcomeTasks = [
      {
        $id: 'task-' + normalizedEmail.replace(/[^a-z0-9]/g, '-') + '-1',
        projectId: 'proj-' + normalizedEmail.replace(/[^a-z0-9]/g, '-') + '-1',
        projectName: '🚀 ' + (clientName || 'My') + ' Launch Workspace',
        title: 'Review team priorities & setup sprint milestones',
        description: 'Organize backlog into actionable cards with realistic deadlines.',
        priority: 'urgent',
        status: 'in-progress',
        assigneeName: clientName || 'You',
        assigneeAvatar: (clientName || 'U').slice(0, 2).toUpperCase(),
        deadline: new Date(Date.now() + 2 * 86400000).toISOString(),
        subtasks: [
          { id: 'st-1', title: 'Review sprint roadmap', done: true },
          { id: 'st-2', title: 'Assign team members', done: false }
        ],
        createdAt: new Date().toISOString(),
      },
      {
        $id: 'task-' + normalizedEmail.replace(/[^a-z0-9]/g, '-') + '-2',
        projectId: 'proj-' + normalizedEmail.replace(/[^a-z0-9]/g, '-') + '-1',
        projectName: '🚀 ' + (clientName || 'My') + ' Launch Workspace',
        title: 'Query NEXORA AI Co-Pilot for technical spec',
        description: 'Ask AI assistant to break down features and generate user stories.',
        priority: 'high',
        status: 'todo',
        assigneeName: clientName || 'You',
        assigneeAvatar: (clientName || 'U').slice(0, 2).toUpperCase(),
        deadline: new Date(Date.now() + 4 * 86400000).toISOString(),
        subtasks: [],
        createdAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(taskKey, JSON.stringify(welcomeTasks));
  }

  if (!localStorage.getItem(subKey)) {
    const planObj = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan) || SUBSCRIPTION_PLANS[0];
    const initialSub = {
      planId: planObj.id,
      planName: planObj.name,
      billingCycle: selectedBilling || 'monthly',
      status: planObj.id === 'starter' ? 'active' : 'pending_approval',
      startDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      aiQueriesUsed: 2,
      maxAiQueries: planObj.maxAiQueries,
      invoices: []
    };
    localStorage.setItem(subKey, JSON.stringify(initialSub));
  }
}

export function recordClientRegistry(user) {
  if (!user || !user.email) return;
  try {
    const raw = localStorage.getItem('nexora_client_registry');
    const registry = raw ? JSON.parse(raw) : [];
    const normalizedEmail = user.email.toLowerCase().trim();
    const existingIdx = registry.findIndex(c => c.email.toLowerCase() === normalizedEmail);
    const entry = {
      email: normalizedEmail,
      name: user.name || normalizedEmail.split('@')[0],
      role: user.role || 'member',
      planId: user.selectedPlan || 'starter',
      planName: user.selectedPlan === 'enterprise' ? 'Enterprise SLA' : (user.selectedPlan === 'pro' ? 'Pro Tier' : 'Starter Free'),
      status: 'active',
      lastSeen: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      registry[existingIdx] = { ...registry[existingIdx], ...entry };
    } else {
      registry.unshift(entry);
    }
    localStorage.setItem('nexora_client_registry', JSON.stringify(registry));

    // Also guarantee this client's workspace has starter data ready
    initializeClientScopeIfEmpty(normalizedEmail, entry.name, entry.planId, user.selectedBilling);
  } catch (e) {
    console.error('Failed to update client registry:', e);
  }
}

/**
 * Submit real billing payment proof for Admin approval
 */
export async function submitSubscriptionPaymentRequest({
  planId,
  billingCycle = 'monthly',
  paymentMethod = 'Bank Transfer',
  trxId = '',
  senderName = '',
  senderAccount = '',
  notes = ''
}) {
  const u = getCurrentUser();
  if (!u || !u.email) throw new Error('You must be signed in to submit payment');
  
  const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!targetPlan) throw new Error('Invalid plan selected');

  if (!trxId.trim()) throw new Error('Please enter the Transaction ID (TRX) from your payment receipt');
  if (!senderName.trim()) throw new Error('Please enter sender account name');

  const price = billingCycle === 'annual' ? targetPlan.priceAnnual : targetPlan.priceMonthly;
  const totalAmount = billingCycle === 'annual' ? price * 12 : price;

  const requestId = 'REQ-' + Date.now().toString().slice(-6);
  const newRequest = {
    id: requestId,
    clientEmail: u.email.toLowerCase(),
    clientName: u.name || u.email.split('@')[0],
    planId: targetPlan.id,
    planName: targetPlan.name,
    billingCycle,
    amount: `$${totalAmount.toFixed(2)}`,
    paymentMethod,
    trxId: trxId.trim(),
    senderName: senderName.trim(),
    senderAccount: senderAccount.trim() || 'N/A',
    notes: notes.trim(),
    status: 'pending_approval',
    submittedAt: new Date().toISOString()
  };

  // 1. Save to global pending subscriptions list
  try {
    const raw = localStorage.getItem('nexora_pending_subscriptions');
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(r => !(r.clientEmail === u.email.toLowerCase() && r.status === 'pending_approval'));
    filtered.unshift(newRequest);
    localStorage.setItem('nexora_pending_subscriptions', JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save pending subscription:', e);
  }

  // 2. Update user's scoped subscription status to 'pending_approval'
  const sub = await getSubscription();
  const updatedSub = {
    ...sub,
    planId: targetPlan.id,
    planName: targetPlan.name,
    billingCycle,
    status: 'pending_approval',
    pendingRequest: newRequest,
    nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    // Strictly lock maxAiQueries to Starter until admin approves
    maxAiQueries: SUBSCRIPTION_PLANS[0].maxAiQueries
  };
  setLocal('subscription', updatedSub);

  // 3. Add in-app notification
  try {
    const notifs = getLocal('notifications', SEED_NOTIFICATIONS);
    notifs.unshift({
      $id: 'notif-sub-pending-' + Date.now(),
      title: '⏳ Payment Awaiting Admin Approval',
      message: `Your payment request for ${targetPlan.name} (${newRequest.amount}) with TRX ${trxId} was submitted to Admin (wa363969@gmail.com). You will be notified once approved.`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString()
    });
    setLocal('notifications', notifs);
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexora-subscription-changed', { detail: updatedSub }));
  }

  return updatedSub;
}

export function getPendingSubscriptions() {
  try {
    const raw = localStorage.getItem('nexora_pending_subscriptions');
    const list = raw ? JSON.parse(raw) : [];
    // If empty on first boot, include an initial sample so admin can test approval flow immediately
    if (list.length === 0) {
      return [
        {
          id: 'REQ-849201',
          clientEmail: 'sarah.jenkins@acme-cloud.io',
          clientName: 'Sarah Jenkins',
          planId: 'pro',
          planName: 'Pro Tier',
          billingCycle: 'annual',
          amount: '$144.00',
          paymentMethod: 'Bank Transfer (Meezan / Raast)',
          trxId: 'TRX-MEEZAN-984210',
          senderName: 'Sarah Jenkins (Acme Cloud LLC)',
          senderAccount: '0340-4942126 / Raast IBFT',
          notes: 'Paid via Meezan mobile banking to Admin Raast. Please verify and activate workspace.',
          status: 'pending_approval',
          submittedAt: new Date(Date.now() - 45 * 60000).toISOString()
        }
      ];
    }
    return list;
  } catch {
    return [];
  }
}

export function approveSubscriptionPayment(requestId) {
  try {
    const raw = localStorage.getItem('nexora_pending_subscriptions');
    const list = raw ? JSON.parse(raw) : [];
    const item = list.find(r => r.id === requestId);
    if (!item) return false;

    item.status = 'approved';
    item.approvedAt = new Date().toISOString();
    localStorage.setItem('nexora_pending_subscriptions', JSON.stringify(list));

    // Update client's scoped subscription
    const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === item.planId) || SUBSCRIPTION_PLANS[1];
    const scope = 'user_' + item.clientEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const rawSub = localStorage.getItem(`nexora_${scope}_subscription`);
    const sub = rawSub ? JSON.parse(rawSub) : {};

    const invoiceId = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const invoice = {
      id: invoiceId,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      plan: `${targetPlan.name} (${item.billingCycle === 'annual' ? 'Annual' : 'Monthly'})`,
      amount: item.amount,
      status: 'Paid',
      trxId: item.trxId,
      pdfUrl: '#'
    };

    const updatedSub = {
      ...sub,
      planId: targetPlan.id,
      planName: targetPlan.name,
      billingCycle: item.billingCycle,
      status: 'active',
      startDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + (item.billingCycle === 'annual' ? 365 : 30) * 86400000).toISOString(),
      maxAiQueries: targetPlan.maxAiQueries,
      paymentMethod: { brand: item.paymentMethod, last4: item.trxId.slice(-4) || 'VERIF', exp: 'Approved by Admin' },
      invoices: [invoice, ...(sub.invoices || [])],
      pendingRequest: null
    };
    localStorage.setItem(`nexora_${scope}_subscription`, JSON.stringify(updatedSub));

    // Update client registry
    const rawReg = localStorage.getItem('nexora_client_registry');
    if (rawReg) {
      const reg = JSON.parse(rawReg);
      const idx = reg.findIndex(c => c.email.toLowerCase() === item.clientEmail.toLowerCase());
      if (idx >= 0) {
        reg[idx].planId = targetPlan.id;
        reg[idx].planName = targetPlan.name;
        reg[idx].status = 'active';
        localStorage.setItem('nexora_client_registry', JSON.stringify(reg));
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexora-subscription-changed', { detail: updatedSub }));
    }

    return true;
  } catch (e) {
    console.error('Failed to approve subscription:', e);
    return false;
  }
}

export function rejectSubscriptionPayment(requestId, reason = 'Payment verification failed') {
  try {
    const raw = localStorage.getItem('nexora_pending_subscriptions');
    const list = raw ? JSON.parse(raw) : [];
    const item = list.find(r => r.id === requestId);
    if (!item) return false;

    item.status = 'rejected';
    item.rejectedAt = new Date().toISOString();
    item.rejectReason = reason;
    localStorage.setItem('nexora_pending_subscriptions', JSON.stringify(list));

    const starterPlan = SUBSCRIPTION_PLANS[0];
    const scope = 'user_' + item.clientEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const rawSub = localStorage.getItem(`nexora_${scope}_subscription`);
    const sub = rawSub ? JSON.parse(rawSub) : {};

    const updatedSub = {
      ...sub,
      planId: starterPlan.id,
      planName: starterPlan.name,
      status: 'rejected',
      rejectReason: reason,
      maxAiQueries: starterPlan.maxAiQueries,
      pendingRequest: null
    };
    localStorage.setItem(`nexora_${scope}_subscription`, JSON.stringify(updatedSub));

    return true;
  } catch (e) {
    console.error('Failed to reject subscription:', e);
    return false;
  }
}

/**
 * Admin Impersonation: lets the admin switch into any client's view to test what that client sees
 */
export function impersonateClient(email) {
  const norm = email.toLowerCase().trim();
  const rawReg = localStorage.getItem('nexora_client_registry');
  const reg = rawReg ? JSON.parse(rawReg) : [];
  const client = reg.find(c => c.email.toLowerCase() === norm) || {
    email: norm,
    name: norm.split('@')[0],
    role: 'member',
    selectedPlan: 'starter'
  };

  const impersonatedSession = {
    $id: 'user-impersonated-' + Date.now(),
    name: client.name || norm.split('@')[0],
    email: norm,
    role: 'member',
    labels: [],
    isImpersonated: true,
    realAdmin: 'wa363969@gmail.com'
  };
  localStorage.setItem('nexora_user_session', JSON.stringify(impersonatedSession));
  window.location.href = '/dashboard';
}

export function stopImpersonating() {
  const adminSession = {
    $id: 'user-admin-1',
    name: 'WA Admin',
    email: 'wa363969@gmail.com',
    labels: ['admin'],
    role: 'admin',
    prefs: { theme: 'dark' },
  };
  localStorage.setItem('nexora_user_session', JSON.stringify(adminSession));
  window.location.href = '/admin';
}

/**
 * Admin-only: Get all client workspaces by combining registered users, localStorage scans, and seed clients
 */
export function getAllClientWorkspaces() {
  const clientsMap = new Map();

  // 1. Insert seed clients first as baseline
  SEED_CLIENTS_REGISTRY.forEach(seed => {
    clientsMap.set(seed.email.toLowerCase(), {
      ...seed,
      scope: 'seed_' + seed.email.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      totalProjects: seed.projects.length,
      activeProjects: seed.projects.filter(p => p.status === 'active').length,
      totalTasks: seed.tasks.length,
      doneTasks: seed.tasks.filter(t => t.status === 'done').length,
      isSeed: true
    });
  });

  // 2. Scan localStorage for registered users registry
  try {
    const rawRegistry = localStorage.getItem('nexora_client_registry');
    if (rawRegistry) {
      const parsed = JSON.parse(rawRegistry);
      parsed.forEach(client => {
        if (client.email.toLowerCase() === 'wa363969@gmail.com') return; // Admin handled separately
        const normalizedEmail = client.email.toLowerCase();
        const scope = 'user_' + normalizedEmail.replace(/[^a-z0-9]/g, '_');
        
        // Auto-seed if not initialized
        initializeClientScopeIfEmpty(normalizedEmail, client.name, client.planId);

        let projects = [];
        let tasks = [];
        let sub = {};
        try {
          projects = JSON.parse(localStorage.getItem(`nexora_${scope}_projects`) || '[]');
          tasks = JSON.parse(localStorage.getItem(`nexora_${scope}_tasks`) || '[]');
          sub = JSON.parse(localStorage.getItem(`nexora_${scope}_subscription`) || '{}');
        } catch {}

        clientsMap.set(normalizedEmail, {
          email: normalizedEmail,
          name: client.name || normalizedEmail.split('@')[0],
          company: client.company || (normalizedEmail.includes('@') ? normalizedEmail.split('@')[1].split('.')[0].toUpperCase() : 'Client Workspace'),
          planId: sub.planId || client.planId || 'starter',
          planName: sub.planName || client.planName || 'Starter Free',
          status: sub.status || client.status || 'active',
          scope,
          lastActivity: client.lastSeen || new Date().toISOString(),
          aiQueriesUsed: sub.aiQueriesUsed || 0,
          maxAiQueries: sub.maxAiQueries || 100,
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'active').length,
          totalTasks: tasks.length,
          doneTasks: tasks.filter(t => t.status === 'done').length,
          projects,
          tasks,
          isReal: true
        });
      });
    }
  } catch (e) {
    console.warn('Error reading client registry:', e);
  }

  // 3. Scan all localStorage keys for active user scopes
  try {
    const allKeys = Object.keys(localStorage);
    const userScopes = new Set();
    allKeys.forEach(k => {
      const match = k.match(/^nexora_(user_[a-z0-9_]+)_(projects|tasks|subscription)$/);
      if (match) {
        userScopes.add(match[1]);
      }
    });

    userScopes.forEach(scope => {
      const rawProjects = localStorage.getItem(`nexora_${scope}_projects`);
      const rawTasks = localStorage.getItem(`nexora_${scope}_tasks`);
      const rawSub = localStorage.getItem(`nexora_${scope}_subscription`);
      const projects = rawProjects ? JSON.parse(rawProjects) : [];
      const tasks = rawTasks ? JSON.parse(rawTasks) : [];
      const sub = rawSub ? JSON.parse(rawSub) : {};

      const emailGuess = scope.replace('user_', '').replace(/_/g, '.');
      const normalizedEmail = emailGuess.includes('.') ? emailGuess : scope;
      if (normalizedEmail === 'wa363969.gmail.com') return;

      if (!clientsMap.has(normalizedEmail)) {
        clientsMap.set(normalizedEmail, {
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0] || 'Client',
          company: 'Workspace',
          planId: sub.planId || 'starter',
          planName: sub.planName || 'Starter Free',
          status: sub.status || 'active',
          scope,
          lastActivity: new Date().toISOString(),
          aiQueriesUsed: sub.aiQueriesUsed || 0,
          maxAiQueries: sub.maxAiQueries || 100,
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'active').length,
          totalTasks: tasks.length,
          doneTasks: tasks.filter(t => t.status === 'done').length,
          projects,
          tasks,
          isReal: true
        });
      }
    });
  } catch (e) {}

  // 4. Always add Master Admin at the top
  const adminScope = 'admin_master';
  let adminProjects = [];
  let adminTasks = [];
  let adminSub = {};
  try {
    adminProjects = JSON.parse(localStorage.getItem(`nexora_${adminScope}_projects`) || '[]');
    adminTasks = JSON.parse(localStorage.getItem(`nexora_${adminScope}_tasks`) || '[]');
    adminSub = JSON.parse(localStorage.getItem(`nexora_${adminScope}_subscription`) || '{}');
  } catch {}

  const result = Array.from(clientsMap.values());
  result.unshift({
    email: 'wa363969@gmail.com',
    name: 'WA Admin (Owner)',
    company: 'NEXORA Platform HQ',
    planId: 'enterprise',
    planName: 'Enterprise SLA (Owner)',
    status: 'active',
    scope: adminScope,
    isAdmin: true,
    lastActivity: new Date().toISOString(),
    aiQueriesUsed: adminSub.aiQueriesUsed || 218,
    maxAiQueries: 50000,
    totalProjects: adminProjects.length || 4,
    activeProjects: (adminProjects.filter(p => p.status === 'active').length) || 3,
    totalTasks: adminTasks.length || 6,
    doneTasks: (adminTasks.filter(t => t.status === 'done').length) || 2,
    projects: adminProjects,
    tasks: adminTasks
  });

  return result;
}

/**
 * Admin-only: Get complete workspace details for an inspected client
 */
export function getClientWorkspaceDetails(scopeOrEmail) {
  const allClients = getAllClientWorkspaces();
  const found = allClients.find(c => 
    c.email.toLowerCase() === scopeOrEmail.toLowerCase() || 
    c.scope === scopeOrEmail
  );

  if (!found) {
    return {
      client: null,
      projects: [],
      tasks: [],
      subscription: {},
      members: []
    };
  }

  // If client is real, read current storage
  if (found.isReal) {
    try {
      const projects = JSON.parse(localStorage.getItem(`nexora_${found.scope}_projects`) || '[]');
      const tasks = JSON.parse(localStorage.getItem(`nexora_${found.scope}_tasks`) || '[]');
      const subscription = JSON.parse(localStorage.getItem(`nexora_${found.scope}_subscription`) || '{}');
      const members = JSON.parse(localStorage.getItem(`nexora_${found.scope}_members`) || '[]');
      return {
        client: found,
        projects: projects.length > 0 ? projects : (found.projects || []),
        tasks: tasks.length > 0 ? tasks : (found.tasks || []),
        subscription,
        members
      };
    } catch {}
  }

  return {
    client: found,
    projects: found.projects || [],
    tasks: found.tasks || [],
    subscription: {
      planId: found.planId,
      planName: found.planName,
      status: found.status,
      aiQueriesUsed: found.aiQueriesUsed,
      maxAiQueries: found.maxAiQueries
    },
    members: [
      { name: found.name, email: found.email, role: 'Workspace Owner', status: 'active' }
    ]
  };
}

/**
 * Admin action: upgrade a client's plan from the admin console
 */
export function updateClientPlanByAdmin(email, newPlanId) {
  const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === newPlanId);
  if (!targetPlan) return false;
  
  const scope = 'user_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    const rawSub = localStorage.getItem(`nexora_${scope}_subscription`);
    const sub = rawSub ? JSON.parse(rawSub) : {};
    const updated = {
      ...sub,
      planId: targetPlan.id,
      planName: targetPlan.name,
      status: 'active',
      maxAiQueries: targetPlan.maxAiQueries
    };
    localStorage.setItem(`nexora_${scope}_subscription`, JSON.stringify(updated));

    // Update client registry
    const rawReg = localStorage.getItem('nexora_client_registry');
    if (rawReg) {
      const reg = JSON.parse(rawReg);
      const idx = reg.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
      if (idx >= 0) {
        reg[idx].planId = targetPlan.id;
        reg[idx].planName = targetPlan.name;
        reg[idx].status = 'active';
        localStorage.setItem('nexora_client_registry', JSON.stringify(reg));
      }
    }
    return true;
  } catch (e) {
    console.error('Failed to update client plan:', e);
    return false;
  }
}


