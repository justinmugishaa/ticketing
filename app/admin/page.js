'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]); // ✅ Always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    try {
      const response = await fetch('/api/admin/tickets', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ Use 'tickets' (not 'data') and ensure it's an array
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      } else {
        setError(data.error || 'Failed to load tickets');
      }
    } catch (err) {
      setError('Network error. Could not connect to server.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // ✅ Update ticket status in state
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === id ? { ...ticket, status: data.data?.status || newStatus } : ticket
          )
        );
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error. Please try again.');
      console.error('Update error:', err);
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // ✅ Remove from state
        setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
        alert('Ticket deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete ticket');
      }
    } catch (err) {
      alert('Network error. Please try again.');
      console.error('Delete error:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return { bg: '#dcfce7', color: '#166534', border: '#10b981' };
      case 'MEDIUM': return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      case 'HIGH': return { bg: '#fed7aa', color: '#c2410c', border: '#f59e0b' };
      case 'URGENT': return { bg: '#fee2e2', color: '#b91c1c', border: '#ef4444' };
      default: return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' };
      case 'IN_PROGRESS': return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      case 'CLOSED': return { bg: '#dcfce7', color: '#166534', border: '#10b981' };
      default: return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' };
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
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
    },
    header: {
      background: 'linear-gradient(120deg, #0f172a, #1e293b)',
      padding: '1.5rem',
      color: 'white',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      margin: 0,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: '1rem',
      opacity: 0.9,
      marginTop: '0.5rem',
      textAlign: 'center',
    },
    tableContainer: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '1rem',
      textAlign: 'left',
      borderBottom: '2px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      color: '#374151',
      fontSize: '0.95rem',
      fontWeight: '600',
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '0.95rem',
      color: '#374151',
      verticalAlign: 'middle',
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
    actionButton: {
      padding: '0.5rem 0.75rem',
      margin: '0 0.25rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.85rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    viewButton: {
      background: '#3b82f6',
      color: 'white',
    },
    closeButton: {
      background: '#10b981',
      color: 'white',
    },
    reopenButton: {
      background: '#6366f1',
      color: 'white',
    },
    deleteButton: {
      background: '#ef4444',
      color: 'white',
    },
    loading: {
      textAlign: 'center',
      padding: '4rem',
      color: '#6b7280',
    },
    error: {
      textAlign: 'center',
      padding: '4rem',
      color: '#dc2626',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>Managing all support tickets</p>
          </div>
          <div style={styles.loading}>Loading tickets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>Error loading tickets</p>
          </div>
          <div style={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Total Tickets: {tickets.length}</p>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Reporter</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => {
                  const priorityStyle = getPriorityColor(ticket.priority);
                  const statusStyle = getStatusColor(ticket.status);
                  return (
                    <tr key={ticket.id}>
                      <td style={styles.td}>
                        <code style={{
                          background: '#f3f4f6',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace'
                        }}>
                          {ticket.id.substring(0, 8)}...
                        </code>
                      </td>
                      <td style={styles.td}>{ticket.title}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderColor: statusStyle.border,
                        }}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: priorityStyle.bg,
                          color: priorityStyle.color,
                          borderColor: priorityStyle.border,
                        }}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {ticket.user ? (
                          <>
                            <div>{ticket.user.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{ticket.user.email}</div>
                          </>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>System</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {new Date(ticket.createdAt).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => router.push(`/tickets/${ticket.id}`)}
                          style={{ ...styles.actionButton, ...styles.viewButton }}
                        >
                          View
                        </button>
                        {ticket.status !== 'CLOSED' && (
                          <button
                            onClick={() => updateTicketStatus(ticket.id, 'CLOSED')}
                            style={{ ...styles.actionButton, ...styles.closeButton }}
                          >
                            Close
                          </button>
                        )}
                        {ticket.status === 'CLOSED' && (
                          <button
                            onClick={() => updateTicketStatus(ticket.id, 'OPEN')}
                            style={{ ...styles.actionButton, ...styles.reopenButton }}
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          style={{ ...styles.actionButton, ...styles.deleteButton }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}