import { useState, useEffect } from 'react';

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
}

export default function DeliveryPortal({ onShowToast }: { onShowToast: (msg: string, isError?: boolean) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riderEarnings, setRiderEarnings] = useState(0);
  const [riderOrdersCount, setRiderOrdersCount] = useState(0);

  const fetchDeliveryQueue = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/delivery/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchDeliveryQueue();
    // Load local driver stats
    const earnings = localStorage.getItem('rider_earnings') || '0';
    const count = localStorage.getItem('rider_orders') || '0';
    setRiderEarnings(parseFloat(earnings));
    setRiderOrdersCount(parseInt(count));
  }, []);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/delivery/orders/${orderId}/status?status=${status}`, {
        method: 'PUT'
      });
      if (res.ok) {
        onShowToast(`Order #${orderId} marked as ${status.replace('_', ' ')}!`);
        if (status === 'DELIVERED') {
          const newEarnings = riderEarnings + 45; // ₹45 delivery incentive per drop
          const newCount = riderOrdersCount + 1;
          setRiderEarnings(newEarnings);
          setRiderOrdersCount(newCount);
          localStorage.setItem('rider_earnings', newEarnings.toString());
          localStorage.setItem('rider_orders', newCount.toString());
        }
        fetchDeliveryQueue();
      }
    } catch (e) {
      onShowToast('Could not update delivery status', true);
    }
  };

  return (
    <div>
      {/* Driver earnings metrics */}
      <div className="admin-stats-grid">
        <div className="stats-card">
          <div className="stats-info">
            <span className="stats-label">Rider Income</span>
            <span className="stats-value">₹{riderEarnings}</span>
          </div>
          <div className="stats-icon text-success">🚴</div>
        </div>
        <div className="stats-card">
          <div className="stats-info">
            <span className="stats-label">Completed Drops</span>
            <span className="stats-value">{riderOrdersCount}</span>
          </div>
          <div className="stats-icon text-info">📦</div>
        </div>
        <div className="stats-card">
          <div className="stats-info">
            <span className="stats-label">Delivery Incentive</span>
            <span className="stats-value">₹45 / trip</span>
          </div>
          <div className="stats-icon text-warning">✨</div>
        </div>
      </div>

      {/* Orders queue */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Active Rider Jobs Queue</h3>
        {orders.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🍕</span>
            <p style={{ marginTop: '0.5rem' }}>No orders currently require delivery partner dispatch.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(o => (
              <div
                key={o.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-light)',
                  padding: '1.2rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>Job Order #{o.id}</h4>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Value: ₹{o.totalAmount} | Status: <span style={{ color: '#ffb300', fontWeight: 700 }}>{o.status}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  {o.status === 'PENDING' && (
                    <button className="btn btn-secondary" disabled>
                      Waiting for restaurant prep...
                    </button>
                  )}
                  {o.status === 'PREPARING' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleUpdateStatus(o.id, 'OUT_FOR_DELIVERY')}
                      style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: '#3b82f6' }}
                    >
                      🚀 Pick Up Order
                    </button>
                  )}
                  {o.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleUpdateStatus(o.id, 'DELIVERED')}
                      style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: '#10b981' }}
                    >
                      ✅ Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
