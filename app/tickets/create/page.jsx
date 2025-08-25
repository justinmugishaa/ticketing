'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateTicketPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    userEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length > 200) newErrors.title = 'Max 200 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = 'Invalid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      // ✅ Get auth token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (!token) {
        setMessage('⚠️ Authentication required. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Critical!
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          userEmail: formData.userEmail || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const ticketId = data.data?.id || data.ticket?.id;
        if (ticketId) {
          setMessage('✨ Ticket created! Redirecting...');
          setTimeout(() => {
            router.push(`/tickets/${ticketId}`);
          }, 1200);
        } else {
          setMessage('✅ Ticket created successfully!');
          setTimeout(() => {
            router.push('/tickets');
          }, 1500);
        }
        setFormData({ title: '', description: '', priority: 'MEDIUM', userEmail: '' });
        setErrors({});
      } else {
        let errorMessage = 'Failed to create ticket';

        switch (response.status) {
          case 400:
            errorMessage = data.error || 'Invalid request';
            break;
          case 401:
            errorMessage = 'Session expired. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to create tickets.';
            break;
          case 405:
            errorMessage = 'Method not allowed. Contact admin.';
            break;
          default:
            errorMessage = data.error || `Error: ${response.status}`;
        }

        setMessage(`⚠️ ${errorMessage}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      setMessage('🔌 Network error. Check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
      padding: '2rem 1rem',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    navigation: {
      width: '100%',
      maxWidth: '32rem',
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    navButton: {
      padding: '0.75rem 1.25rem',
      borderRadius: '0.875rem',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    homeButton: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
    ticketsButton: {
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
    },
    card: {
      width: '100%',
      maxWidth: '32rem',
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '1.5rem',
      overflow: 'hidden',
      boxShadow: '0 10px 50px -20px rgba(0,0,0,0.3)',
    },
    header: {
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      padding: '2.5rem 2rem',
      textAlign: 'center',
      color: 'white',
    },
    title: { 
      fontSize: '1.75rem', 
      fontWeight: '700', 
      margin: 0,
      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    subtitle: { 
      fontSize: '1rem', 
      opacity: 0.95, 
      margin: '0.5rem 0 0',
      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    },
    formContainer: { 
      padding: '2.5rem', 
      background: 'white',
    },
    fieldGroup: { 
      marginBottom: '1.75rem',
    },
    label: { 
      display: 'block', 
      fontSize: '0.95rem', 
      fontWeight: '600', 
      color: '#1f2937', 
      marginBottom: '0.75rem',
    },
    input: {
      width: '100%',
      padding: '1rem 1.25rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.875rem',
      fontSize: '1rem',
      backgroundColor: '#f9fafb',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      color: '#1f2937',
    },
    inputFocus: {
      borderColor: '#8b5cf6',
      backgroundColor: 'white',
    },
    select: {
      width: '100%',
      padding: '1rem 1.25rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.875rem',
      fontSize: '1rem',
      backgroundColor: '#f9fafb',
      cursor: 'pointer',
      color: '#1f2937',
    },
    textarea: {
      width: '100%',
      padding: '1rem 1.25rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.875rem',
      fontSize: '1rem',
      resize: 'vertical',
      minHeight: '8rem',
      backgroundColor: '#f9fafb',
      color: '#1f2937',
      fontFamily: 'inherit',
    },
    button: {
      width: '100%',
      padding: '1.125rem',
      fontSize: '1.0625rem',
      fontWeight: '600',
      color: 'white',
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      border: 'none',
      borderRadius: '0.875rem',
      cursor: 'pointer',
      opacity: isSubmitting ? 0.7 : 1,
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
    },
    messageBox: {
      textAlign: 'center',
      marginTop: '1rem',
      padding: '1rem',
      borderRadius: '0.5rem',
      fontSize: '0.9rem',
      fontWeight: '500',
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fca5a5',
    },
    successBox: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
    },
    errorText: {
      color: '#dc2626', 
      fontSize: '0.8rem', 
      marginTop: '0.5rem',
      fontWeight: '500',
    },
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <div style={styles.navigation}>
        <Link 
          href="/tickets/homl" 
          style={{ ...styles.navButton, ...styles.homeButton }}
        >
          🏠 Back to Home
        </Link>
        <Link 
          href="/tickets" 
          style={{ ...styles.navButton, ...styles.ticketsButton }}
        >
          📋 View Tickets
        </Link>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Support Ticket</h1>
          <p style={styles.subtitle}>We're here to help solve your issue</p>
        </div>

        <div style={styles.formContainer}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address (Optional)</label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="your@email.com"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b5cf6';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
            />
            {errors.userEmail && (
              <p style={styles.errorText}>{errors.userEmail}</p>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Issue Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Briefly describe your issue"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b5cf6';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
            />
            {errors.title && (
              <p style={styles.errorText}>{errors.title}</p>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Priority Level</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="LOW">🟢 Low Priority</option>
              <option value="MEDIUM">🟡 Medium Priority</option>
              <option value="HIGH">🟠 High Priority</option>
              <option value="URGENT">🔴 Urgent</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide detailed information about your issue..."
              rows="5"
              style={styles.textarea}
              onFocus={(e) => {
                e.target.style.borderColor = '#8b5cf6';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
              }}
            />
            {errors.description && (
              <p style={styles.errorText}>{errors.description}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            style={styles.button}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.3)';
              }
            }}
          >
            {isSubmitting ? 'Creating Ticket...' : '🚀 Submit Ticket'}
          </button>

          {message && (
            <div style={{
              ...styles.messageBox,
              ...(message.includes('⚠️') || message.includes('🔌') ? styles.errorBox : styles.successBox)
            }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}