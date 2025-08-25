'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TicketDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params); // ✅ Required for Next.js 15
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Get current user from localStorage
  const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      console.error('Failed to parse user from localStorage', err);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const canDelete = currentUser && ticket && ticket.userId === currentUser.userId && ticket.status === 'OPEN';

  // ✅ Fetch ticket with comments
  useEffect(() => {
    if (resolvedParams.id) {
      fetchTicket();
    }
  }, [resolvedParams.id]);

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError("You must be logged in to view this ticket.");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/tickets/${resolvedParams.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to load ticket");
        return;
      }

      const data = await response.json();
      if (data.success && data.data) {
        setTicket(data.data);
      } else {
        setError("Invalid response format");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add comment (Admin only)
  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('auth_token');

    try {
      const res = await fetch(`/api/tickets/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment }),
      });

      const data = await res.json();
      if (res.ok) {
        setTicket(prev => ({
          ...prev,
          comments: [...prev.comments, data.comment],
        }));
        setComment('');
      } else {
        alert(data.error || "Failed to add comment");
      }
    } catch (err) {
      alert("Network error. Could not send comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Delete ticket (User or Admin)
  const handleDeleteTicket = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const token = localStorage.getItem('auth_token');

    try {
      const res = await fetch(`/api/tickets/${resolvedParams.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Ticket deleted successfully!");
        router.push('/tickets');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      alert("Network error. Could not delete ticket.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Update ticket status
  const updateTicketStatus = async (newStatus) => {
    if (!currentUser) {
      alert("You must be logged in to update the ticket.");
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/tickets/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setTicket(data.data);
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      alert("Network error. Could not update status.");
    }
  };

  // ✅ LOGOUT FUNCTION
  const handleLogout = async () => {
    setIsDeleting(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        sessionStorage.clear();
      }
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Get colors for badges
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return { bg: 'rgba(209, 250, 229, 0.95)', color: '#065f46', border: '#10b981' };
      case 'MEDIUM': return { bg: 'rgba(253, 230, 138, 0.95)', color: '#92400e', border: '#f59e0b' };
      case 'HIGH': return { bg: 'rgba(254, 202, 202, 0.95)', color: '#991b1b', border: '#ef4444' };
      case 'URGENT': return { bg: 'rgba(253, 164, 175, 0.95)', color: '#9f1239', border: '#f43f5e' };
      default: return { bg: 'rgba(243, 244, 246, 0.95)', color: '#374151', border: '#9ca3af' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return { bg: 'rgba(191, 219, 254, 0.95)', color: '#1e40af', border: '#3b82f6' };
      case 'IN_PROGRESS': return { bg: 'rgba(253, 230, 138, 0.95)', color: '#92400e', border: '#f59e0b' };
      case 'CLOSED': return { bg: 'rgba(209, 250, 229, 0.95)', color: '#065f46', border: '#10b981' };
      default: return { bg: 'rgba(243, 244, 246, 0.95)', color: '#374151', border: '#9ca3af' };
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      padding: '1rem',
      fontFamily: "'Poppins', sans-serif",
    },
    card: {
      maxWidth: '900px',
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
      position: 'relative',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    navigationButtons: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '0.85rem',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.2s ease',
    },
    homeButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      background: 'rgba(16, 185, 129, 0.9)',
      color: 'white',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '0.85rem',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
    },
    logoutButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      background: 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.85rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
    },
    content: {
      padding: '1.5rem',
    },
    section: {
      marginBottom: '1.5rem',
      background: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid rgba(229, 231, 235, 0.8)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.4rem 0.8rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      border: '1px solid',
      marginRight: '0.5rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      margin: '0 0 0.25rem 0',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    },
    subtitle: {
      opacity: 0.95,
      margin: 0,
      fontSize: '0.9rem',
      fontWeight: '400',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '0.8rem',
      color: '#1f2937',
      paddingBottom: '0.4rem',
      borderBottom: '2px solid rgba(79, 70, 229, 0.2)',
    },
    textContent: {
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '8px',
      border: '1px solid rgba(229, 231, 235, 0.8)',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.6',
      fontSize: '0.95rem',
      color: '#374151',
      maxHeight: '150px',
      overflowY: 'auto',
      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    infoBox: {
      padding: '0.8rem',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '8px',
      border: '1px solid rgba(229, 231, 235, 0.8)',
      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    commentBox: {
      padding: '0.8rem',
      background: 'rgba(240, 249, 255, 0.9)',
      borderRadius: '8px',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      marginBottom: '0.5rem',
    },
    commentAuthor: {
      fontWeight: '600',
      color: '#1e40af',
      fontSize: '0.9rem',
    },
    commentContent: {
      margin: '0.25rem 0 0 0',
      color: '#374151',
      fontSize: '0.9rem',
      lineHeight: '1.5',
    },
    commentMeta: {
      fontSize: '0.8rem',
      color: '#6b7280',
      marginTop: '0.25rem',
    },
    deleteButton: {
      background: '#ef4444',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    cancelButton: {
      background: '#6b7280',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: '#4b5563' }}>Loading ticket...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: '#dc2626', marginBottom: '1rem' }}>
            {error}
          </div>
          <Link href="/tickets" style={styles.backButton}>
            ← Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: '#4b5563' }}>Ticket not found</div>
          <Link href="/tickets" style={styles.backButton}>
            ← Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const priorityStyle = getPriorityColor(ticket.priority);
  const statusStyle = getStatusColor(ticket.status);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div style={styles.navigationButtons}>
              <Link href="/tickets" style={styles.backButton}>
                ← Back to Tickets
              </Link>
              <Link href="/" style={styles.homeButton}>
                🏠 Home
              </Link>
            </div>
            <button
              onClick={handleLogout}
              disabled={isDeleting}
              style={{
                ...styles.logoutButton,
                opacity: isDeleting ? 0.7 : 1,
                cursor: isDeleting ? 'not-allowed' : 'pointer',
              }}
            >
              {isDeleting ? 'Logging out...' : '🚪 Logout'}
            </button>
          </div>
          <h1 style={styles.title}>{ticket.title}</h1>
          <p style={styles.subtitle}>Ticket ID: {ticket.id}</p>
        </div>

        <div style={styles.content}>
          {/* Status and Priority */}
          <div style={styles.section}>
            <div>
              <div style={{ ...styles.badge, background: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}>
                Status: {ticket.status.replace('_', ' ')}
              </div>
              <div style={{ ...styles.badge, background: priorityStyle.bg, color: priorityStyle.color, borderColor: priorityStyle.border }}>
                Priority: {ticket.priority}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Description</h3>
            <div style={styles.textContent}>
              {ticket.description}
            </div>
          </div>

          {/* Reporter */}
          {ticket.user && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Reporter</h3>
              <div style={styles.infoBox}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem', color: '#1f2937' }}>{ticket.user.name}</p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#4b5563', fontSize: '0.85rem' }}>{ticket.user.email}</p>
              </div>
            </div>
          )}

          {/* Comments */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Comments</h3>
            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((cmt) => (
                <div key={cmt.id} style={styles.commentBox}>
                  <div style={styles.commentAuthor}>
                    {cmt.user.name} ({cmt.user.role})
                  </div>
                  <div style={styles.commentContent}>{cmt.content}</div>
                  <div style={styles.commentMeta}>
                    {new Date(cmt.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}

            {/* Admin Add Comment */}
            {isAdmin && (
              <div style={{ marginTop: '1rem' }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={isSubmitting || !comment.trim()}
                  style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px' }}
                >
                  {isSubmitting ? 'Sending...' : 'Add Comment'}
                </button>
              </div>
            )}
          </div>

          {/* Delete Ticket */}
          {canDelete && (
            <div style={styles.section}>
              <button
                onClick={handleDeleteTicket}
                disabled={isDeleting}
                style={styles.deleteButton}
              >
                {isDeleting ? 'Deleting...' : '🗑️ Delete Ticket'}
              </button>
            </div>
          )}

          {/* Status Actions */}
          {ticket.status !== 'CLOSED' && 
           (currentUser && (currentUser.role === 'ADMIN' || ticket.userId === currentUser.userId)) && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Status Actions</h3>
              <div>
                {ticket.status === 'OPEN' && (
                  <button
                    onClick={() => updateTicketStatus('IN_PROGRESS')}
                    style={{
                      ...styles.button,
                      background: '#f59e0b',
                      color: 'white',
                      boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    Start Progress
                  </button>
                )}
                {ticket.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateTicketStatus('CLOSED')}
                    style={{
                      ...styles.button,
                      background: '#10b981',
                      color: 'white',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    Close Ticket
                  </button>
                )}
                {ticket.status !== 'OPEN' && (
                  <button
                    onClick={() => updateTicketStatus('OPEN')}
                    style={{
                      ...styles.button,
                      background: '#3b82f6',
                      color: 'white',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    Reopen Ticket
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}