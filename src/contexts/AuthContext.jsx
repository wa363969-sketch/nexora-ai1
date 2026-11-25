import { createContext, useContext, useState, useEffect } from 'react';
import { account, avatars } from '../lib/appwrite';
import { ID, OAuthProvider } from 'appwrite';
import { recordClientRegistry } from '../services/dataService';
import { get2FAConfig } from '../services/twoFactorService';

const AuthContext = createContext(null);

export const hasAppwrite = Boolean(
  import.meta.env.VITE_APPWRITE_PROJECT_ID &&
  import.meta.env.VITE_APPWRITE_PROJECT_ID !== 'your_project_id'
);

const CREDENTIALS_STORE_KEY = 'nexora_auth_credentials';
const RESET_TOKENS_KEY = 'nexora_password_reset_tokens';
const ADMIN_EMAIL = 'wa363969@gmail.com';

// Precomputed salted SHA-256 hashes for bootstrap admin verification when Appwrite is offline/paused
const ADMIN_BOOTSTRAP_HASHES = [
  '570823b4695f462d86480853f00385c204f7a1f60af415e402df2fc3fa104b4e',
  'e1517358e8c1e110cce896dbfdaeb9a3ac04050ab22ab2d3c1059e4de3d4fc8f',
  '62a89d29d9fb4621134fc82f6245d39a1d548db5cf5d5c66f6a467fa16e212da',
  '7ddd2dfb1dc99e0035f1d70539399bb48700d2a07cdf0855a234e9ae55878636',
];

async function hashPassword(password, email) {
  const input = `nexora_v1:${email.toLowerCase().trim()}:${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Deterministic fallback hash for non-secure contexts
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

function getLocalCredentials() {
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalCredentials(creds) {
  try {
    localStorage.setItem(CREDENTIALS_STORE_KEY, JSON.stringify(creds));
  } catch {}
}

function isAppwriteServiceUnavailableError(err) {
  if (!err) return true;
  const code = err.code;
  const type = err.type || '';
  const msg = (err.message || '').toLowerCase();
  return (
    code === 403 ||
    type === 'project_paused' ||
    msg.includes('paused') ||
    msg.includes('failed to fetch') ||
    msg.includes('network')
  );
}

async function isAppwriteActive() {
  if (!hasAppwrite) return false;
  try {
    const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
    const res = await fetch(`${endpoint}/health/version`, {
      headers: { 'X-Appwrite-Project': projectId },
    });
    if (!res.ok) return false;
    return true;
  } catch {
    return false;
  }
}

function normalizeUserObject(rawUser, fallbackEmail) {
  const email = (rawUser?.email || fallbackEmail || '').toLowerCase().trim();
  const isAdmin = (rawUser?.labels || []).includes('admin') || email === ADMIN_EMAIL;
  return {
    ...rawUser,
    $id: rawUser?.$id || 'user-' + Date.now(),
    name: rawUser?.name || (email === ADMIN_EMAIL ? 'WA Admin' : email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
    email,
    labels: isAdmin ? Array.from(new Set([...(rawUser?.labels || []), 'admin'])) : (rawUser?.labels || ['member']),
    role: isAdmin ? 'admin' : 'member',
    prefs: rawUser?.prefs || { theme: 'dark' },
  };
}

export async function verifyStoredPassword(email, password) {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail || !password) return false;

  const creds = getLocalCredentials();
  const pwHash = await hashPassword(password, cleanEmail);

  if (creds[cleanEmail]?.passwordHash) {
    return creds[cleanEmail].passwordHash === pwHash;
  }

  if (cleanEmail === ADMIN_EMAIL) {
    return ADMIN_BOOTSTRAP_HASHES.includes(pwHash);
  }

  return false;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexora_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasAppwrite) {
      checkAuth();
    }
    const handleOAuthReady = (e) => {
      if (e.detail) {
        setUser(e.detail);
      }
    };
    window.addEventListener('nexora_oauth_session_ready', handleOAuthReady);
    return () => window.removeEventListener('nexora_oauth_session_ready', handleOAuthReady);
  }, []);

  async function checkAuth() {
    if (!hasAppwrite) return;
    try {
      const session = await account.get();
      const normalized = normalizeUserObject(session, session.email);
      setUser(normalized);
      localStorage.setItem('nexora_user_session', JSON.stringify(normalized));
    } catch {
      // Keep existing local session if present
    }
  }

  async function login(email, password) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !password) {
      throw new Error('Please enter both your email and password.');
    }
    if (password.length < 6) {
      throw new Error('Invalid email or password.');
    }

    setLoading(true);
    try {
      let authenticatedUser = null;
      let shouldFallbackToLocal = !hasAppwrite;

      if (hasAppwrite) {
        try {
          try {
            await account.deleteSession('current');
          } catch {
            // No active session to clear
          }
          await account.createEmailPasswordSession(cleanEmail, password);
          const session = await account.get();
          authenticatedUser = normalizeUserObject(session, cleanEmail);

          // Sync verified password hash locally for offline continuity
          const creds = getLocalCredentials();
          const passwordHash = await hashPassword(password, cleanEmail);
          creds[cleanEmail] = {
            ...creds[cleanEmail],
            $id: authenticatedUser.$id,
            name: authenticatedUser.name,
            email: cleanEmail,
            role: authenticatedUser.role,
            labels: authenticatedUser.labels,
            passwordHash,
            updatedAt: new Date().toISOString(),
          };
          saveLocalCredentials(creds);
        } catch (err) {
          if (isAppwriteServiceUnavailableError(err)) {
            shouldFallbackToLocal = true;
          } else {
            // Check if the account exists in the local credential store (e.g. registered while Appwrite was paused)
            const creds = getLocalCredentials();
            if (creds[cleanEmail]) {
              shouldFallbackToLocal = true;
            } else {
              throw new Error(err.message || 'Invalid email or password. Please try again.');
            }
          }
        }
      }

      if (shouldFallbackToLocal && !authenticatedUser) {
        const creds = getLocalCredentials();
        const existingRecord = creds[cleanEmail];
        const pwHash = await hashPassword(password, cleanEmail);

        if (existingRecord) {
          if (existingRecord.passwordHash !== pwHash) {
            throw new Error('Incorrect password. Please check your password and try again.');
          }
          authenticatedUser = normalizeUserObject(existingRecord, cleanEmail);
        } else if (cleanEmail === ADMIN_EMAIL) {
          if (!ADMIN_BOOTSTRAP_HASHES.includes(pwHash)) {
            throw new Error('Incorrect password for this account.');
          }
          authenticatedUser = normalizeUserObject(
            {
              $id: 'user-admin-1',
              name: 'WA Admin',
              email: ADMIN_EMAIL,
              labels: ['admin'],
              role: 'admin',
            },
            ADMIN_EMAIL
          );
        } else {
          throw new Error('No account found with this email address. Please sign up first.');
        }
      }

      // Check Two-Factor Authentication for this verified user
      const twoFactor = get2FAConfig(cleanEmail);
      if (twoFactor && twoFactor.enabled) {
        if (hasAppwrite) {
          try {
            await account.deleteSession('current');
          } catch {}
        }
        return {
          requires2FA: true,
          pendingUser: { ...authenticatedUser, twoFactorConfig: twoFactor },
        };
      }

      setUser(authenticatedUser);
      localStorage.setItem('nexora_user_session', JSON.stringify(authenticatedUser));
      recordClientRegistry(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  }

  function complete2FALogin(authenticatedUser) {
    setUser(authenticatedUser);
    localStorage.setItem('nexora_user_session', JSON.stringify(authenticatedUser));
    recordClientRegistry(authenticatedUser);
    return authenticatedUser;
  }

  async function register(email, password, name, planMeta = {}) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanName = (name || '').trim();
    if (!cleanName) throw new Error('Please enter your full name.');
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    setLoading(true);
    const selectedPlan = planMeta?.selectedPlan || 'starter';
    const selectedBilling = planMeta?.selectedBilling || 'monthly';

    try {
      let registeredUser = null;
      let useLocalRegistration = !hasAppwrite;

      if (hasAppwrite) {
        try {
          try {
            await account.deleteSession('current');
          } catch {}

          await account.create(ID.unique(), cleanEmail, password, cleanName);
          await account.createEmailPasswordSession(cleanEmail, password);
          const session = await account.get();
          registeredUser = normalizeUserObject(
            { ...session, selectedPlan, selectedBilling },
            cleanEmail
          );
        } catch (err) {
          if (isAppwriteServiceUnavailableError(err)) {
            useLocalRegistration = true;
          } else if (err.code === 409) {
            throw new Error('An account with this email already exists. Please sign in instead.');
          } else {
            throw new Error(err.message || 'Registration failed.');
          }
        }
      }

      const creds = getLocalCredentials();
      const passwordHash = await hashPassword(password, cleanEmail);

      if (useLocalRegistration) {
        if (creds[cleanEmail]) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        registeredUser = normalizeUserObject(
          {
            $id: 'user-' + Date.now(),
            name: cleanName,
            email: cleanEmail,
            selectedPlan,
            selectedBilling,
            createdAt: new Date().toISOString(),
          },
          cleanEmail
        );
      }

      // Persist hashed password credential locally
      creds[cleanEmail] = {
        $id: registeredUser.$id,
        name: registeredUser.name,
        email: cleanEmail,
        role: registeredUser.role,
        labels: registeredUser.labels,
        selectedPlan,
        selectedBilling,
        passwordHash,
        createdAt: creds[cleanEmail]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveLocalCredentials(creds);

      setUser(registeredUser);
      localStorage.setItem('nexora_user_session', JSON.stringify(registeredUser));
      recordClientRegistry(registeredUser);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  }

  function persistPendingOAuthPlan(planMeta = {}) {
    try {
      if (planMeta && (planMeta.selectedPlan || planMeta.selectedBilling)) {
        localStorage.setItem('nexora_pending_oauth_plan', JSON.stringify(planMeta));
      }
    } catch {}
  }

  async function loginWithGoogle(email = null, name = null, planMeta = {}) {
    if (await isAppwriteActive()) {
      try {
        persistPendingOAuthPlan(planMeta);
        account.createOAuth2Session(
          OAuthProvider.Google,
          `${window.location.origin}/auth/callback`,
          `${window.location.origin}/login?oauth_error=google_failed`
        );
        return { redirected: true };
      } catch (err) {
        console.warn('Google OAuth2 redirect failed:', err.message);
      }
    }
    return { redirected: false, paused: true };
  }

  async function loginWithMicrosoft(email = null, name = null, planMeta = {}) {
    if (await isAppwriteActive()) {
      try {
        persistPendingOAuthPlan(planMeta);
        account.createOAuth2Session(
          OAuthProvider.Microsoft,
          `${window.location.origin}/auth/callback`,
          `${window.location.origin}/login?oauth_error=microsoft_failed`
        );
        return { redirected: true };
      } catch (err) {
        console.warn('Microsoft OAuth2 redirect failed:', err.message);
      }
    }
    return { redirected: false, paused: true };
  }

  async function loginWithGithub(email = null, name = null, planMeta = {}) {
    if (await isAppwriteActive()) {
      try {
        persistPendingOAuthPlan(planMeta);
        account.createOAuth2Session(
          OAuthProvider.Github,
          `${window.location.origin}/auth/callback`,
          `${window.location.origin}/login?oauth_error=github_failed`
        );
        return { redirected: true };
      } catch (err) {
        console.warn('GitHub OAuth2 redirect failed:', err.message);
      }
    }
    return { redirected: false, paused: true };
  }

  async function loginWithOAuthProvider(provider = 'google', email, name, planMeta = {}) {
    setLoading(true);
    const cleanEmail = (email || `user@${provider}.com`).toLowerCase().trim();
    const selectedPlan = planMeta?.selectedPlan || (cleanEmail === ADMIN_EMAIL ? 'enterprise' : 'starter');
    const selectedBilling = planMeta?.selectedBilling || 'monthly';
    try {
      const oauthUser = normalizeUserObject(
        {
          $id: `user-${provider}-` + Date.now(),
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          selectedPlan,
          selectedBilling,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || cleanEmail || 'NX')}`,
          provider,
        },
        cleanEmail
      );

      const twoFactor = get2FAConfig(cleanEmail);
      if (twoFactor && twoFactor.enabled) {
        return {
          requires2FA: true,
          pendingUser: { ...oauthUser, twoFactorConfig: twoFactor },
        };
      }

      setUser(oauthUser);
      localStorage.setItem('nexora_user_session', JSON.stringify(oauthUser));
      recordClientRegistry(oauthUser);
      return oauthUser;
    } finally {
      setLoading(false);
    }
  }

  async function loginWithAppwriteOAuth() {
    return loginWithGoogle();
  }

  async function logout() {
    try {
      if (hasAppwrite) {
        await account.deleteSession('current');
      }
    } catch {}
    setUser(null);
    localStorage.removeItem('nexora_user_session');
  }

  async function forgotPassword(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (await isAppwriteActive()) {
      return await account.createRecovery(cleanEmail, `${window.location.origin}/reset-password`);
    }

    // Local recovery token when Appwrite is paused/offline
    const creds = getLocalCredentials();
    if (!creds[cleanEmail] && cleanEmail !== ADMIN_EMAIL) {
      throw new Error('No registered account found with this email address.');
    }

    const userId = creds[cleanEmail]?.$id || 'user-admin-1';
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    let tokens = {};
    try {
      tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}');
    } catch {}

    tokens[secret] = {
      userId,
      email: cleanEmail,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));

    return {
      localRecovery: true,
      resetUrl: `/reset-password?userId=${encodeURIComponent(userId)}&secret=${encodeURIComponent(secret)}`,
    };
  }

  async function resetPassword(userId, secret, newPassword) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    if (await isAppwriteActive()) {
      return await account.updateRecovery(userId, secret, newPassword);
    }

    let tokens = {};
    try {
      tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}');
    } catch {}

    const tokenData = tokens[secret];
    if (!tokenData || tokenData.userId !== userId) {
      throw new Error('Invalid or expired password recovery link.');
    }
    if (Date.now() > tokenData.expiresAt) {
      delete tokens[secret];
      localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
      throw new Error('This password recovery link has expired. Please request a new one.');
    }

    const cleanEmail = tokenData.email.toLowerCase().trim();
    const creds = getLocalCredentials();
    const newHash = await hashPassword(newPassword, cleanEmail);

    creds[cleanEmail] = {
      ...creds[cleanEmail],
      $id: tokenData.userId,
      name: creds[cleanEmail]?.name || (cleanEmail === ADMIN_EMAIL ? 'WA Admin' : cleanEmail.split('@')[0]),
      email: cleanEmail,
      role: cleanEmail === ADMIN_EMAIL ? 'admin' : (creds[cleanEmail]?.role || 'member'),
      labels: cleanEmail === ADMIN_EMAIL ? ['admin'] : (creds[cleanEmail]?.labels || ['member']),
      passwordHash: newHash,
      updatedAt: new Date().toISOString(),
    };
    saveLocalCredentials(creds);

    delete tokens[secret];
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
    return true;
  }

  async function updateProfile(name) {
    if (hasAppwrite) {
      try {
        await account.updateName(name);
      } catch {}
    }
    const updated = { ...user, name };
    setUser(updated);
    localStorage.setItem('nexora_user_session', JSON.stringify(updated));
  }

  async function updateEmail(email, password) {
    if (hasAppwrite) {
      try {
        await account.updateEmail(email, password);
      } catch {}
    }
    const updated = { ...user, email };
    setUser(updated);
    localStorage.setItem('nexora_user_session', JSON.stringify(updated));
  }

  async function updatePassword(oldPassword, newPassword) {
    if (!oldPassword) {
      throw new Error('Please enter your current password.');
    }
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }
    if (oldPassword === newPassword) {
      throw new Error('New password must be different from your current password.');
    }

    const cleanEmail = (user?.email || '').toLowerCase().trim();
    if (!cleanEmail) {
      throw new Error('You must be signed in to update your password.');
    }

    if (await isAppwriteActive()) {
      await account.updatePassword(newPassword, oldPassword);
    } else {
      const creds = getLocalCredentials();
      const hasSavedCred = Boolean(creds[cleanEmail]?.passwordHash);
      if (hasSavedCred || cleanEmail === ADMIN_EMAIL) {
        const isValidOld = await verifyStoredPassword(cleanEmail, oldPassword);
        if (!isValidOld) {
          throw new Error('Current password is incorrect.');
        }
      }
    }

    const creds = getLocalCredentials();
    const newHash = await hashPassword(newPassword, cleanEmail);
    creds[cleanEmail] = {
      ...creds[cleanEmail],
      $id: user.$id,
      name: user.name,
      email: cleanEmail,
      role: user.role,
      labels: user.labels,
      passwordHash: newHash,
      updatedAt: new Date().toISOString(),
    };
    saveLocalCredentials(creds);
    return true;
  }

  function getAvatar(name) {
    if (hasAppwrite) {
      try {
        return avatars.getInitials(name || user?.name || 'U');
      } catch {}
    }
    return null;
  }

  const value = {
    user,
    loading,
    login,
    complete2FALogin,
    register,
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithGithub,
    loginWithOAuthProvider,
    loginWithAppwriteOAuth,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword,
    getAvatar,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
