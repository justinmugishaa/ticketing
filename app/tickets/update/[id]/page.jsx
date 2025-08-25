'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', sans-serif",
    background: '#f8fafc',
  },
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    padding: '32px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '24px',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '12px 0',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    margin: '12px 0',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    minHeight: '120px',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '12px',
    margin: '12px 0',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  button: {
    padding: '12px 24px',
    background: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  cancelButton: {
    marginLeft: '12px',
    background: '#6b7280',
  },
  actions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  error: {
    color: 'red',
    marginBottom: '12px',
  },
};

export default function UpdateTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/tickets/${id}`);
        const data = await res.json();

        if (res.ok && data.success && data.data.status !== 'CLOSED') {
          setFormData({
            title: data.data.title,
            description: data.data.description,
            priority: data.data.priority,
          });
        } else {
          setError('Ticket not found or already closed.');
        }
      } catch (err) {
        setError('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTicket();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/tickets/${id}`);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Update Ticket</h1>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title"
            style={styles.input}
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            style={styles.textarea}
            required
          />
          <select
            name="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            style={styles.select}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ ...styles.button, ...styles.cancelButton }}
            >
              Cancel
            </button>
            <button type="submit" style={styles.button}>
              {loading ? 'Updating...' : 'Update Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}