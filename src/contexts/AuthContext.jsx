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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check local storage for persistent session
    const saved = localStorage.getItem('nexora_user_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      $id: 'user-admin-1',
      name: 'WA Admin',
      email: 'wa363969@gmail.com',
      labels: ['admin'],
      role: 'admin',
      prefs: { theme: 'dark' },
    };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasAppwrite) {
      checkAuth();
    }
    // Listen for OAuth session ready event from OAuthCallback page
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
      const isAdmin = (session.labels || []).includes('admin') || session.email?.toLowerCase() === 'wa363969@gmail.com';
      const normalized = {
        ...session,
        labels: isAdmin ? Array.from(new Set([...(session.labels || []), 'admin'])) : (session.labels || ['member']),
        role: isAdmin ? 'admin' : 'member',
      };
      setUser(normalized);
      localStorage.setItem('nexora_user_session', JSON.stringify(normalized));
    } catch {
      // Keep existing session or state
    }
  }

  async function login(email, password) {
    setLoading(true);
    try {
      if (hasAppwrite) {
        // Clear any stale session first to avoid "prohibited when session is active"
        try {
          await account.deleteSession('current');
        } catch (e) {
          // No active session
        }
        await account.createEmailPasswordSession(email, password);
        const session = await account.get();
        setUser(session);
        localStorage.setItem('nexora_user_session', JSON.stringify(session));
        return session;
      }
    } catch (e) {
      console.warn('Appwrite login failed, attempting local authentication:', e.message);
    } finally {
      setLoading(false);
    }

    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase() === 'wa363969@gmail.com';
    const role = isAdmin ? 'admin' : 'member';
    const sessionUser = {
      $id: 'user-' + Date.now(),
      name: email === 'wa363969@gmail.com' ? 'WA Admin' : email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      labels: role === 'admin' ? ['admin'] : [],
      role,
      prefs: { theme: 'dark' },
    };

    // Check if Two-Factor Authentication is enabled for this account
    const twoFactor = get2FAConfig(email);
    if (twoFactor && twoFactor.enabled) {
      return {
        requires2FA: true,
        pendingUser: { ...sessionUser, twoFactorConfig: twoFactor }
      };
    }

    setUser(sessionUser);
    localStorage.setItem('nexora_user_session', JSON.stringify(sessionUser));
    recordClientRegistry(sessionUser);
    return sessionUser;
  }

  function complete2FALogin(authenticatedUser) {
    setUser(authenticatedUser);
    localStorage.setItem('nexora_user_session', JSON.stringify(authenticatedUser));
    recordClientRegistry(authenticatedUser);
    return authenticatedUser;
  }

  async function register(email, password, name, planMeta = {}) {
    setLoading(true);
    const selectedPlan = planMeta?.selectedPlan || 'starter';
    const selectedBilling = planMeta?.selectedBilling || 'monthly';
    try {
      if (hasAppwrite) {
        // Clear any previous session
        try {
          await account.deleteSession('current');
        } catch (e) {
          // No active session
        }

        // Create new account
        await account.create(ID.unique(), email, password, name);
        
        // Immediately start session
        await account.createEmailPasswordSession(email, password);
        const session = await account.get();
        session.selectedPlan = selectedPlan;
        session.selectedBilling = selectedBilling;
        setUser(session);
        localStorage.setItem('nexora_user_session', JSON.stringify(session));
        recordClientRegistry(session);
        return session;
      }
    } catch (e) {
      console.warn('Appwrite register failed, using persistent fallback:', e.message);
    } finally {
      setLoading(false);
    }

    const sessionUser = {
      $id: 'user-' + Date.now(),
      name: name || email.split('@')[0],
      email,
      labels: email.includes('admin') ? ['admin'] : [],
      role: email.includes('admin') ? 'admin' : 'member',
      selectedPlan,
      selectedBilling,
      prefs: { theme: 'dark' },
    };
    setUser(sessionUser);
    localStorage.setItem('nexora_user_session', JSON.stringify(sessionUser));
    recordClientRegistry(sessionUser);
    return sessionUser;
  }

  function persistPendingOAuthPlan(planMeta = {}) {
    try {
      if (planMeta && (planMeta.selectedPlan || planMeta.selectedBilling)) {
        localStorage.setItem('nexora_pending_oauth_plan', JSON.stringify(planMeta));
      }
    } catch {}
  }

  async function loginWithGoogle(email = null, name = null, planMeta = {}) {
    if (hasAppwrite) {
      // Real OAuth2 redirect to Google – user gets Google login page
      try {
        persistPendingOAuthPlan(planMeta);
        account.createOAuth2Session(
          OAuthProvider.Google,
          `${window.location.origin}/auth/callback`,  // success → back to app
          `${window.location.origin}/login?oauth_error=google_failed` // failure → back to login
        );
        return { redirected: true };
      } catch (err) {
        console.warn('Google OAuth2 redirect failed:', err.message);
      }
    }
    // Fallback for non-Appwrite environments
    return loginWithOAuthProvider('google', email || 'user@gmail.com', name || 'Google User', planMeta);
  }

  async function loginWithMicrosoft(email = null, name = null, planMeta = {}) {
    if (hasAppwrite) {
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
    return loginWithOAuthProvider('microsoft', email || 'user@outlook.com', name || 'Microsoft User', planMeta);
  }

  async function loginWithGithub(email = null, name = null, planMeta = {}) {
    if (hasAppwrite) {
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
    return loginWithOAuthProvider('github', email || 'user@github.com', name || 'GitHub User', planMeta);
  }

  async function loginWithOAuthProvider(provider = 'google', email, name, planMeta = {}) {
    setLoading(true);
    const selectedPlan = planMeta?.selectedPlan || (email === 'wa363969@gmail.com' ? 'enterprise' : 'starter');
    const selectedBilling = planMeta?.selectedBilling || 'monthly';
    try {
      const oauthUser = {
        $id: `user-${provider}-` + Date.now(),
        name: name || (email ? email.split('@')[0] : 'User'),
        email: email || `user@${provider}.com`,
        labels: email === 'wa363969@gmail.com' ? ['admin'] : ['member'],
        role: email === 'wa363969@gmail.com' ? 'admin' : 'member',
        selectedPlan,
        selectedBilling,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email || 'NX')}`,
        provider,
        prefs: { theme: 'dark' },
      };

      // Check if 2FA is active on this email
      const twoFactor = get2FAConfig(email);
      if (twoFactor && twoFactor.enabled) {
        return {
          requires2FA: true,
          pendingUser: { ...oauthUser, twoFactorConfig: twoFactor }
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
    setLoading(true);
    try {
      if (hasAppwrite) {
        try {
          await account.deleteSession('current');
        } catch (e) {
          // ignore
        }
        account.createOAuth2Session(
          'google',
          `${window.location.origin}/dashboard`,
          `${window.location.origin}/login`
        );
      }
    } catch (e) {
      console.warn('Appwrite Google OAuth2 redirect failed:', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      if (hasAppwrite) {
        await account.deleteSession('current');
      }
    } catch (e) {
      // Ignore
    }
    setUser(null);
    localStorage.removeItem('nexora_user_session');
  }

  async function forgotPassword(email) {
    if (hasAppwrite) {
      return await account.createRecovery(email, `${window.location.origin}/reset-password`);
    }
    return true;
  }

  async function resetPassword(userId, secret, password) {
    if (hasAppwrite) {
      return await account.updateRecovery(userId, secret, password);
    }
    return true;
  }

  async function updateProfile(name) {
    if (hasAppwrite) {
      try {
        await account.updateName(name);
      } catch (e) { /* ignore */ }
    }
    const updated = { ...user, name };
    setUser(updated);
    localStorage.setItem('nexora_user_session', JSON.stringify(updated));
  }

  async function updateEmail(email, password) {
    if (hasAppwrite) {
      try {
        await account.updateEmail(email, password);
      } catch (e) { /* ignore */ }
    }
    const updated = { ...user, email };
    setUser(updated);
    localStorage.setItem('nexora_user_session', JSON.stringify(updated));
  }

  async function updatePassword(oldPassword, newPassword) {
    if (hasAppwrite) {
      await account.updatePassword(newPassword, oldPassword);
    }
    return true;
  }

  function getAvatar(name) {
    if (hasAppwrite) {
      try {
        return avatars.getInitials(name || user?.name || 'U');
      } catch (e) { /* ignore */ }
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
