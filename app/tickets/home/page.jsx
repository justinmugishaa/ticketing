'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = checking, true/false = result

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
  }, []);

  // Show loading while checking auth
  if (isLoggedIn === null) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading...</p>
      </div>
    );
  }

  // Handler: Redirect to login if not authenticated
  const requireAuth = (path) => {
    if (isLoggedIn) {
      router.push(path);
    } else {
      alert('You must be logged in to access this page.');
      router.push('/login');
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.background} />

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <h1 style={styles.logo}>🎫 TICKETING SUPPORT</h1>
          <div style={styles.navButtons}>
            {isLoggedIn ? (
              <button
                style={styles.navButton}
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  setIsLoggedIn(false);
                  router.push('/login');
                }}
              >
                🔓 Logout
              </button>
            ) : (
              <>
                <button
                  style={styles.navButton}
                  onClick={() => router.push('/login')}
                >
                  🔐 Login
                </button>
                <button
                  style={styles.navButtonPrimary}
                  onClick={() => router.push('/register')}
                >
                  📝 Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>
            {isLoggedIn ? 'WELCOME BACK TO TICKETING SUPPORT' : 'WELCOME TO TICKETING SUPPORT'}
          </h1>
          <p style={styles.subtitle}>
            Your comprehensive support ticketing system. Create, manage, and resolve support tickets with ease.
          </p>

          <div style={styles.buttonGroup}>
            <button
              style={styles.button}
              onClick={() => requireAuth('Home_page')}
            >
              <span style={styles.icon}>📝</span> Create Ticket
            </button>
            <button
              style={styles.button}
              onClick={() => requireAuth('/tickets')}
            >
              <span style={styles.icon}>📋</span> View Tickets
            </button>
          </div>

          {/* Show additional options if logged in */}
          {isLoggedIn && (
            <div style={styles.welcomeMessage}>
              <p style={styles.welcomeText}>You are logged in and can access all features.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ✅ CSS-in-JS Styles (No External Files)
const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    color: '#ffffff',
  },
  loading: {
    color: 'white',
    fontSize: '1.2rem',
    marginTop: '20px',
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
  nav: {
    width: '100%',
    padding: '1rem 2rem',
    position: 'relative',
    zIndex: 3,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#8b5cf6',
    margin: 0,
  },
  navButtons: {
    display: 'flex',
    gap: '12px',
  },
  navButton: {
    padding: '8px 16px',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#8b5cf6',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navButtonPrimary: {
    padding: '8px 16px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)',
    transition: 'all 0.2s ease',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '0 20px',
    zIndex: 2,
  },
  content: {
    textAlign: 'center',
    maxWidth: '800px',
    padding: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 1rem 0',
    textShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1.1rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    padding: '14px 24px',
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
  icon: {
    fontSize: '1.2rem',
  },
  welcomeMessage: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '8px',
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
};

// Optional: Add hover effects
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    ${`
      .navButton:hover, .navButtonPrimary:hover {
        transform: translateY(-1px);
        box-shadow: 0 5px 15px rgba(124, 58, 237, 0.4);
      }
      .button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(124, 58, 237, 0.5);
      }
    `}
  `;
  document.head.appendChild(style);
}