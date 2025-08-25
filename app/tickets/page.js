'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('USER');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      if (typeof window === 'undefined') return false;

      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) return false;

      try {
        const user = JSON.parse(userStr);
        if (!user || !user.email) return false;

        setUserEmail(user.email);
        setUserRole(user.role || 'USER');
        setIsAuthenticated(true);

        fetchTickets(user.email, user.role);
        return true;
      } catch (err) {
        setError('Invalid user data. Please login again.');
        return false;
      }
    };

    const isAuth = checkAuthentication();

    if (!isAuth) {
      setError('You must be logged in to view tickets.');
      setLoading(false);
      setTimeout(() => router.push('/login'), 3000);
    }
  }, [router]);

  const fetchTickets = async (email, role) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('No authentication token found.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const response = await fetch('/api/tickets/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, role })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTickets(data.tickets);
      } else {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.clear();
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setError(data.error || 'Failed to load tickets');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      sessionStorage.clear();
      router.push('/login');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#3b82f6';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'CLOSED': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return '#10b981';
      case 'MEDIUM': return '#f59e0b';
      case 'HIGH': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      padding: '1rem',
      fontFamily: "'Poppins', sans-serif",
    },
    navigation: {
      maxWidth: '1200px',
      margin: '0 auto 1rem auto',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      padding: '1rem 1.5rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    navButton: {
      padding: '0.6rem 1.2rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
    },
    secondaryButton: {
      background: 'rgba(107, 114, 128, 0.1)',
      color: '#374151',
      border: '1px solid rgba(107, 114, 128, 0.2)',
    },
    dangerButton: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#dc2626',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    homeButton: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
    card: {
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
    },
    header: {
      background: 'linear-gradient(120deg, #6366f1 0%, #4f46e5 100%)',
      padding: '1.5rem',
      color: 'white',
      textAlign: 'center',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      margin: 0,
    },
    ticketsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
      padding: '2rem',
    },
    ticketCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    ticketTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      margin: '0 0 0.5rem 0',
      color: '#1f2937',
    },
    ticketDescription: {
      color: '#6b7280',
      fontSize: '0.9rem',
      lineHeight: '1.5',
      margin: '0 0 1rem 0',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    ticketMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      color: 'white',
    },
    priorityBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      color: 'white',
    },
    commentBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: 'white',
      background: '#8b5cf6',
    },
    ticketActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
    },
    actionButton: {
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.8rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      flex: 1,
    },
    viewButton: {
      background: '#3b82f6',
      color: 'white',
    },
    editButton: {
      background: '#f59e0b',
      color: 'white',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Loading...</h1>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            Loading tickets...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.navigation}>
          <div>
            <Link href="/" style={{ ...styles.navButton, ...styles.homeButton }}>
              🏠 Home
            </Link>
          </div>
          <div>
            <Link href="/login" style={{ ...styles.navButton, ...styles.primaryButton }}>
              🔐 Login Again
            </Link>
            <button onClick={handleLogout} style={{ ...styles.navButton, ...styles.dangerButton }}>
              🧹 Clear Data
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Authentication Required</h1>
          </div>
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#dc2626',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            margin: '1rem'
          }}>
            <h3>⚠️ {error}</h3>
            <p>Redirecting in 3 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.navigation}>
        <div>
          <Link href="/" style={{ ...styles.navButton, ...styles.homeButton }}>
            🏠 Home
          </Link>
          <span>✅ {userEmail} ({userRole})</span>
        </div>
        <div>
          <Link href="/tickets/create" style={{ ...styles.navButton, ...styles.primaryButton }}>
            ➕ Create New
          </Link>
          <button onClick={handleLogout} style={{ ...styles.navButton, ...styles.dangerButton }}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Tickets ({tickets.length})</h1>
        </div>

        {tickets.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <h3>No tickets found</h3>
            <p>You haven't created any tickets yet.</p>
            <Link href="/tickets/create" style={{ ...styles.navButton, ...styles.primaryButton }}>
              Create Your First Ticket
            </Link>
          </div>
        ) : (
          <div style={styles.ticketsGrid}>
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                style={styles.ticketCard}
                onClick={() => router.push(`/tickets/${ticket.id}`)}
              >
                <h3 style={styles.ticketTitle}>{ticket.title}</h3>
                <p style={styles.ticketDescription}>{ticket.description}</p>

                <div style={styles.ticketMeta}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(ticket.status)
                    }}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor: getPriorityColor(ticket.priority)
                    }}
                  >
                    {ticket.priority}
                  </span>
                </div>

                {/* ✅ Show comment count */}
                {ticket.comments && ticket.comments.length > 0 && (
                  <div style={styles.commentBadge}>
                    💬 {ticket.comments.length} {ticket.comments.length === 1 ? 'Comment' : 'Comments'}
                  </div>
                )}

                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
                  Created: {new Date(ticket.createdAt).toLocaleDateString()}
                </div>

                <div style={styles.ticketActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/tickets/${ticket.id}`);
                    }}
                    style={{ ...styles.actionButton, ...styles.viewButton }}
                  >
                    👁️ View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}