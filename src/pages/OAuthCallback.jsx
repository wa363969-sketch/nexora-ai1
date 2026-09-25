import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import { useAuth } from '../contexts/AuthContext';
import { recordClientRegistry } from '../services/dataService';
import { get2FAConfig } from '../services/twoFactorService';
import toast from 'react-hot-toast';
import TwoFactorChallenge from '../components/auth/TwoFactorChallenge';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { complete2FALogin, checkAuth } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying' | '2fa' | 'error'
  const [pending2FAUser, setPending2FAUser] = useState(null);

  useEffect(() => {
    verifyOAuthSession();
  }, []);

  async function verifyOAuthSession() {
    try {
      let oauthUser = null;

      // 1. Check if direct Google/OAuth provider returned id_token or credential in URL hash or params
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const searchParams = new URLSearchParams(window.location.search);

      const idToken = hashParams.get('id_token') || searchParams.get('id_token') || searchParams.get('credential');
      const accessToken = hashParams.get('access_token');
      const errorParam = searchParams.get('error') || hashParams.get('error');

      if (errorParam) {
        throw new Error(`Google authentication cancelled or denied (${errorParam})`);
      }

      if (idToken) {
        try {
          const base64Url = idToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const payload = JSON.parse(jsonPayload);

          if (payload?.email) {
            oauthUser = {
              $id: `user-google-${payload.sub || Date.now()}`,
              name: payload.name || payload.email.split('@')[0],
              email: payload.email,
              labels: payload.email === 'wa363969@gmail.com' ? ['admin'] : ['member'],
              role: payload.email === 'wa363969@gmail.com' ? 'admin' : 'member',
              provider: 'google',
              avatarUrl: payload.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.name || payload.email)}`,
              prefs: { theme: 'dark' }
            };
          }
        } catch (jwtErr) {
          console.warn('JWT token parse error:', jwtErr);
        }
      }

      // 2. If no direct token, check Appwrite session
      if (!oauthUser) {
        try {
          const session = await account.get();
          oauthUser = {
            $id: session.$id,
            name: session.name,
            email: session.email,
            labels: session.labels || [],
            role: (session.labels || []).includes('admin') ? 'admin' : 'member',
            provider: 'oauth2',
            prefs: session.prefs || { theme: 'dark' },
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.name || session.email)}`,
          };
        } catch (appwriteErr) {
          // If neither is present, error out
          throw new Error('No valid Google session found');
        }
      }

      // Check if 2FA is enabled for this account
      const twoFactor = get2FAConfig(oauthUser.email);
      if (twoFactor && twoFactor.enabled) {
        setStatus('2fa');
        setPending2FAUser({ ...oauthUser, twoFactorConfig: twoFactor });
        return;
      }

      // Set user in context and localStorage
      localStorage.setItem('nexora_user_session', JSON.stringify(oauthUser));
      recordClientRegistry(oauthUser);

      // Trigger auth context update via custom event
      window.dispatchEvent(new CustomEvent('nexora_oauth_session_ready', { detail: oauthUser }));

      toast.success(`Google verification complete! Welcome, ${oauthUser.name || oauthUser.email}! 🎉`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('OAuth session verification failed:', err);
      setStatus('error');
      toast.error(err.message || 'Google sign-in failed. Please try again.');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    }
  }

  function handle2FAVerified(authenticatedUser) {
    complete2FALogin(authenticatedUser);
    setPending2FAUser(null);
    toast.success('Identity verified! Welcome to NEXORA.');
    navigate('/dashboard', { replace: true });
  }

  if (status === '2fa' && pending2FAUser) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black gradient-text">NEXORA</h1>
            <p className="text-gray-400 mt-1 text-sm">Two-Step Verification Required</p>
          </div>
          <TwoFactorChallenge
            pendingUser={pending2FAUser}
            onVerified={handle2FAVerified}
            onCancel={() => navigate('/login', { replace: true })}
          />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-white font-bold text-lg">Authentication Failed</h2>
          <p className="text-gray-400 text-sm">Could not verify your Google account. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Default: verifying spinner
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="text-center space-y-5">
        {/* Animated Logo */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-2xl">N</span>
          </div>
          {/* Spinning ring */}
          <div className="absolute -inset-2 rounded-3xl border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
        </div>

        <div className="space-y-1">
          <h2 className="text-white font-bold text-lg">Verifying Identity</h2>
          <p className="text-gray-400 text-sm">
            Completing Google authentication, please wait...
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>

        <p className="text-xs text-gray-500">
          🔒 Secured via OAuth 2.0 • NEXORA never receives your Google password
        </p>
      </div>
    </div>
  );
}
