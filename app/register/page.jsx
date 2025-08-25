'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ✅ 1. Define styles FIRST
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
};

// ✅ 2. Component
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const router = useRouter();

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setMessage('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setMessage('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Registration successful! Redirecting to login...');
        setFormData({ name: '', email: '', password: '' });

        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        setMessage(`⚠️ ${data.error || 'Registration failed'}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('🔌 Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.background} />

      {/* Logo */}
      <div style={styles.logoContainer}>
        <h1 style={styles.logo}>🎫 HelpDesk Pro</h1>
        <p style={styles.subtitle}>Secure, fast, and user-friendly support</p>
      </div>

      {/* Form Card */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create Your Account</h2>
          <p style={styles.description}>Join thousands of users managing tickets efficiently</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Name */}
          <div style={styles.field}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={styles.input}
            />
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              style={styles.input}
            />
          </div>

          {/* Submit Button */}
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
                <span style={styles.spinner} /> Creating Account...
              </>
            ) : (
              '📝 Register Now'
            )}
          </button>

          {/* Message */}
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

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <a href="/login" style={styles.link}>
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ✅ 3. Inject animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}