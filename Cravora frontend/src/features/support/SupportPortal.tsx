import React, { useState, useEffect } from 'react';

interface SupportTicket {
  id?: number;
  userId: number;
  userName: string;
  description: string;
  status: string; // "OPEN", "RESOLVED"
  refundRequested: boolean;
  refundAmount: number;
}

interface SupportPortalProps {
  currentUser: { id: number; name: string; role: string } | null;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function SupportPortal({ currentUser, onShowToast }: SupportPortalProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [description, setDescription] = useState('');
  const [refundRequested, setRefundRequested] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    if (!currentUser) return;
    try {
      const endpoint = currentUser.role === 'ADMIN' 
        ? 'http://localhost:8080/api/support/tickets/all'
        : `http://localhost:8080/api/support/tickets/user/${currentUser.id}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || loading) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          description,
          refundRequested,
          refundAmount: refundRequested ? parseFloat(refundAmount) || 0 : 0
        })
      });
      if (res.ok) {
        onShowToast('Support ticket filed successfully!');
        setDescription('');
        setRefundRequested(false);
        setRefundAmount('');
        fetchTickets();
      }
    } catch (err) {
      onShowToast('Could not submit support ticket', true);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (ticketId: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/support/tickets/${ticketId}/resolve`, {
        method: 'POST'
      });
      if (res.ok) {
        onShowToast('Ticket marked as resolved.');
        fetchTickets();
      }
    } catch (e) {
      onShowToast('Error resolving ticket', true);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: currentUser?.role === 'ADMIN' ? '1fr' : '1fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
      {/* Customer Ticket Submission Form */}
      {currentUser?.role !== 'ADMIN' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Open Support Ticket</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Need help with your food order? Submit your query or file a refund claim below.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Issue Description</label>
              <textarea
                required
                rows={4}
                className="form-control"
                placeholder="Briefly describe what happened..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                id="refundCheckbox"
                checked={refundRequested}
                onChange={e => setRefundRequested(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="refundCheckbox" style={{ cursor: 'pointer', margin: 0 }}>Request Order Refund</label>
            </div>
            {refundRequested && (
              <div className="form-group">
                <label>Refund Amount Claimed (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="form-control"
                  placeholder="Order value to return"
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                />
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Support Ticket'}
            </button>
          </form>
        </div>
      )}

      {/* Tickets List Area */}
      <div className="glass-card" style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>
          {currentUser?.role === 'ADMIN' ? 'Customer Tickets Log' : 'Your Tickets History'}
        </h3>
        {tickets.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <span style={{ fontSize: '2.5rem' }}>✉️</span>
            <p style={{ marginTop: '0.5rem' }}>No ticket submissions found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
            {tickets.map(t => (
              <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Ticket #{t.id}</span>
                    {currentUser?.role === 'ADMIN' && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                        by {t.userName}
                      </span>
                    )}
                  </div>
                  <span className={`status-badge ${t.status.toLowerCase()}`}>
                    {t.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>{t.description}</p>
                {t.refundRequested && (
                  <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem' }}>
                    🚨 Refund Claimed: ₹{t.refundAmount}
                  </div>
                )}
                {t.status === 'OPEN' && currentUser?.role === 'ADMIN' && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', marginTop: '0.8rem' }}
                    onClick={() => handleResolve(t.id!)}
                  >
                    Mark Resolved &amp; Refund
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
