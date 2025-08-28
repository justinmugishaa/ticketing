'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TicketDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
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
  const isOwner = currentUser && ticket && ticket.userId === currentUser.userId;
  const canDelete = isOwner && ticket.status === 'OPEN';

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

  // ✅ Add comment
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

  // ✅ Delete ticket
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

  // ✅ Logout
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

  // ✅ Badge Colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return { bg: '#dcfce7', color: '#166534', border: '#22c55e' };
      case 'MEDIUM': return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      case 'HIGH': return { bg: '#fee2e2', color: '#b91c1c', border: '#ef4444' };
      case 'URGENT': return { bg: '#fecaca', color: '#9f1239', border: '#f43f5e' };
      default: return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return { bg: '#eff6ff', color: '#1e40af', border: '#3b82f6' };
      case 'IN_PROGRESS': return { bg: '#fffbeb', color: '#92400e', border: '#f59e0b' };
      case 'CLOSED': return { bg: '#dcfce7', color: '#166534', border: '#22c55e' };
      default: return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' };
    }
  };

  // ✅ Improved Styles (Clean, Modern, No Scroll)
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px 16px',
      fontFamily: "'Inter', 'Poppins', sans-serif",
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    card: {
      width: '100%',
      maxWidth: '800px',
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
    },
    header: {
      background: 'linear-gradient(120deg, #4f46e5, #7c3aed)',
      padding: '24px',
      color: 'white',
      position: 'relative',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    navigationButtons: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      borderRadius: '8px',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.2s ease',
    },
    homeButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      background: 'rgba(16, 185, 129, 0.9)',
      color: 'white',
      borderRadius: '8px',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
    },
    logoutButton: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      background: 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
    },
    content: {
      padding: '24px',
    },
    section: {
      marginBottom: '24px',
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 6px rgba(0, 0, 0, 0.05)',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 12px',
      borderRadius: '24px',
      fontSize: '12px',
      fontWeight: '600',
      border: '1px solid',
      marginRight: '8px',
      textTransform: 'uppercase',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      margin: '0 0 4px 0',
      color: 'white',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    },
    subtitle: {
      opacity: 0.9,
      margin: 0,
      fontSize: '14px',
      fontWeight: '400',
      color: 'rgba(255, 255, 255, 0.9)',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#1e293b',
      paddingBottom: '6px',
      borderBottom: '2px solid #e2e8f0',
    },
    textContent: {
      padding: '12px',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.6',
      fontSize: '14px',
      color: '#334155',
      maxHeight: '120px',
      overflowY: 'auto',
      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    infoBox: {
      padding: '12px',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    commentBox: {
      padding: '12px',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #bfdbfe',
      marginBottom: '8px',
      boxShadow: '0 1px 4px rgba(59, 130, 246, 0.1)',
    },
    commentAuthor: {
      fontWeight: '600',
      color: '#1e40af',
      fontSize: '13px',
    },
    commentContent: {
      margin: '4px 0 0 0',
      color: '#334155',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    commentMeta: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '4px',
    },
    deleteButton: {
      background: '#ef4444',
      color: 'white',
      padding: '10px 16px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    actionButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '16px', color: '#64748b' }}>Loading ticket...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '16px', color: '#dc2626', marginBottom: '16px' }}>
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
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '16px', color: '#64748b' }}>Ticket not found</div>
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
                ← Back
              </Link>
              <Link href="/tickets/homl" style={styles.homeButton}>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <div
                style={{
                  ...styles.badge,
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  borderColor: statusStyle.border,
                }}
              >
                {ticket.status.replace('_', ' ')}
              </div>
              <div
                style={{
                  ...styles.badge,
                  background: priorityStyle.bg,
                  color: priorityStyle.color,
                  borderColor: priorityStyle.border,
                }}
              >
                {ticket.priority}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Description</h3>
            <div style={styles.textContent}>{ticket.description}</div>
          </div>

          {/* Reporter */}
          {ticket.user && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Reporter</h3>
              <div style={styles.infoBox}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                  {ticket.user.name}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                  {ticket.user.email}
                </p>
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
              <p style={{ color: '#64748b', fontSize: '14px' }}>No comments yet.</p>
            )}

            {/* Add Comment */}
            {(isOwner || isAdmin) && (
              <div style={{ marginTop: '16px' }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '80px',
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={isSubmitting || !comment.trim()}
                  style={{
                    ...styles.actionButton,
                    background: '#3b82f6',
                    color: 'white',
                    marginTop: '8px',
                  }}
                >
                  {isSubmitting ? 'Sending...' : '💬 Add Comment'}
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

          {/* Admin Actions */}
          {isAdmin && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Admin Actions</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {ticket.status === 'OPEN' && (
                  <button
                    onClick={() => updateTicketStatus('IN_PROGRESS')}
                    style={{
                      ...styles.actionButton,
                      background: '#f59e0b',
                      color: 'white',
                    }}
                  >
                    ▶️ Start Progress
                  </button>
                )}
                {ticket.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateTicketStatus('CLOSED')}
                    style={{
                      ...styles.actionButton,
                      background: '#10b981',
                      color: 'white',
                    }}
                  >
                    ✅ Close Ticket
                  </button>
                )}
                {ticket.status === 'CLOSED' && (
                  <button
                    onClick={() => updateTicketStatus('OPEN')}
                    style={{
                      ...styles.actionButton,
                      background: '#3b82f6',
                      color: 'white',
                    }}
                  >
                    🔁 Reopen Ticket
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
