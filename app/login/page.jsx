'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ Enhanced CSS-in-JS Styles
const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 20%),
      radial-gradient(circle at 90% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 20%),
      radial-gradient(circle at 50% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 20%)
    `,
    zIndex: 1,
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '30px',
    zIndex: 2,
  },
  logo: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#8b5cf6',
    margin: '0 0 8px 0',
    textShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.1rem',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '16px',
    boxShadow: `
      0 10px 30px -10px rgba(0, 0, 0, 0.3),
      0 20px 40px -20px rgba(0, 0, 0, 0.4)
    `,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
  },
  header: {
    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    padding: '32px 24px',
    color: 'white',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  description: {
    fontSize: '0.95rem',
    opacity: 0.9,
    margin: 0,
  },
  form: {
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  input: {
    padding: '14px 16px',
    fontSize: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  button: {
    padding: '14px',
    fontSize: '1.05rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
    transition: 'all 0.2s ease',
  },
  buttonDisabled: {
    background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
    cursor: 'not-allowed',
    opacity: 0.8,
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid white',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'rotate 1s linear infinite',
  },
  messageBox: {
    padding: '14px',
    borderRadius: '10px',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '0.95rem',
    marginTop: '10px',
  },
  successBox: {
    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    color: '#166534',
    border: '1px solid #22c55e',
  },
  errorBox: {
    background: 'linear-gradient(135deg, #fef2f2, #fecaca)',
    color: '#b91c1c',
    border: '1px solid #ef4444',
  },
  footer: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
  },
  footerText: {
    color: '#475569',
    fontSize: '0.9rem',
  },
  link: {
    color: '#7c3aed',
    fontWeight: '600',
    textDecoration: 'none',
  },
  debugPanel: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    fontFamily: 'monospace',
    maxWidth: '300px',
    zIndex: 1000,
  },
};

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!formData.email || !formData.password) {
      setMessage("⚠️ Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔐 Attempting login for:", formData.email);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("🔐 Login response:", { 
        ok: res.ok, 
        status: res.status, 
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user 
      });

      setDebugInfo({
        loginAttempt: new Date().toISOString(),
        responseStatus: res.status,
        responseOk: res.ok,
        dataSuccess: data.success,
        hasToken: !!data.token,
        tokenLength: data.token ? data.token.length : 0,
        hasUser: !!data.user,
        userEmail: data.user?.email,
        userRole: data.user?.role,
      });

      if (res.ok && data.success) {
        const token = data.token;
        if (!token) {
          console.error("❌ No token received from server");
          setMessage("❌ Login failed: No token received.");
          setIsLoading(false);
          return;
        }

        console.log("✅ Token received, length:", token.length);

        localStorage.clear();
        sessionStorage.clear();

        localStorage.setItem('auth_token', token);
        console.log("✅ Token saved to localStorage");

        if (!data.user || !data.user.email) {
          console.error("❌ Invalid user data received:", data.user);
          setMessage("❌ Login failed: Invalid user data.");
          setIsLoading(false);
          return;
        }

        const user = {
          userId: data.user.id,
          name: data.user.name || formData.email.split('@')[0],
          email: data.user.email,
          role: data.user.role || 'USER',
        };

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user_role', user.role);
        
        console.log("✅ User data saved:", user);

        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        
        console.log("✅ Verification - savedToken exists:", !!savedToken);
        console.log("✅ Verification - savedUser exists:", !!savedUser);
        
        if (!savedToken || !savedUser) {
          console.error("❌ Failed to save data to localStorage");
          setMessage("❌ Login failed: Could not save session data.");
          setIsLoading(false);
          return;
        }

        setMessage("✅ Login successful! Redirecting...");

        setTimeout(() => {
          console.log("🔄 Redirecting to:", user.role === 'ADMIN' ? '/admin' : '/tickets');
          if (user.role === 'ADMIN') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/tickets';
          }
        }, 1500);
        
      } else {
        console.error("❌ Login failed:", data.error);
        setMessage(`⚠️ ${data.error || "Login failed. Please try again."}`);
      }
    } catch (error) {
      console.error("❌ Login network error:", error);
      setMessage("🔌 Network error. Please try again.");
      setDebugInfo(prev => ({
        ...prev,
        networkError: error.message
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const DebugPanel = () => {
    if (!debugInfo) return null;
    
    return (
      <div style={styles.debugPanel}>
        <strong>🔍 Login Debug:</strong>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        <hr />
        <strong>LocalStorage:</strong>
        <div>Token: {localStorage.getItem('auth_token') ? '✅' : '❌'}</div>
        <div>User: {localStorage.getItem('user') ? '✅' : '❌'}</div>
      </div>
    );
  };

  return (
    <>
      <DebugPanel />
      
      <div style={styles.container}>
        <div style={styles.background} />

        <div style={styles.logoContainer}>
          <h1 style={styles.logo}>🎫 HelpDesk Pro</h1>
          <p style={styles.subtitle}>Secure, fast, and user-friendly support</p>
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Welcome Back</h2>
            <p style={styles.description}>Sign in to manage your tickets</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {}),
              }}
            >
              {isLoading ? (
                <>
                  <span style={styles.spinner} /> Signing In...
                </>
              ) : (
                '🔐 Sign In'
              )}
            </button>

            {message && (
              <div
                style={
                  message.includes('successful')
                    ? { ...styles.messageBox, ...styles.successBox }
                    : { ...styles.messageBox, ...styles.errorBox }
                }
              >
                {message}
              </div>
            )}
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don't have an account?{' '}
              <Link href="/register" style={styles.link}>
                Register here
              </Link>
            </p>
          </div>
        </div>

        <style jsx global>{`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}