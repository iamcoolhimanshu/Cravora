
export default function AnalyticsDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Visual SVG charts container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        
        {/* Revenue Trends Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>📈 Sales Revenue Trend (Weekly)</h3>
          <div style={{ position: 'relative', width: '100%', height: '200px' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
              <line x1="50" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" />
              <line x1="50" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" />
              <line x1="50" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

              {/* Area path */}
              <path d="M 50 170 L 50 130 Q 120 70 180 110 T 310 50 T 440 30 L 440 170 Z" fill="url(#chartGrad)" />

              {/* Line path */}
              <path d="M 50 130 Q 120 70 180 110 T 310 50 T 440 30" fill="none" stroke="var(--primary-color)" strokeWidth="3" />

              {/* Data dots */}
              <circle cx="50" cy="130" r="5" fill="var(--primary-color)" />
              <circle cx="180" cy="110" r="5" fill="var(--primary-color)" />
              <circle cx="310" cy="50" r="5" fill="var(--primary-color)" />
              <circle cx="440" cy="30" r="5" fill="var(--primary-color)" />

              {/* Y Axis Labels */}
              <text x="15" y="25" fill="var(--text-secondary)" fontSize="10">₹15K</text>
              <text x="15" y="75" fill="var(--text-secondary)" fontSize="10">₹10K</text>
              <text x="15" y="125" fill="var(--text-secondary)" fontSize="10">₹5K</text>
              <text x="15" y="175" fill="var(--text-secondary)" fontSize="10">₹0</text>

              {/* X Axis Labels */}
              <text x="45" y="195" fill="var(--text-secondary)" fontSize="10">Mon</text>
              <text x="175" y="195" fill="var(--text-secondary)" fontSize="10">Wed</text>
              <text x="305" y="195" fill="var(--text-secondary)" fontSize="10">Fri</text>
              <text x="430" y="195" fill="var(--text-secondary)" fontSize="10">Sun</text>
            </svg>
          </div>
        </div>

        {/* Daily Orders Bar Chart */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>📊 Daily Orders Volume</h3>
          <div style={{ position: 'relative', width: '100%', height: '200px' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
              <line x1="50" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" />
              <line x1="50" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" />
              <line x1="50" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

              {/* Columns */}
              <rect x="75" y="90" width="30" height="80" rx="3" fill="#3b82f6" />
              <rect x="145" y="50" width="30" height="120" rx="3" fill="#3b82f6" />
              <rect x="215" y="70" width="30" height="100" rx="3" fill="#3b82f6" />
              <rect x="285" y="40" width="30" height="130" rx="3" fill="var(--primary-color)" />
              <rect x="355" y="60" width="30" height="110" rx="3" fill="#3b82f6" />
              <rect x="425" y="30" width="30" height="140" rx="3" fill="var(--primary-color)" />

              {/* Y Axis Labels */}
              <text x="20" y="25" fill="var(--text-secondary)" fontSize="10">150</text>
              <text x="20" y="75" fill="var(--text-secondary)" fontSize="10">100</text>
              <text x="20" y="125" fill="var(--text-secondary)" fontSize="10">50</text>
              <text x="20" y="175" fill="var(--text-secondary)" fontSize="10">0</text>

              {/* X Axis Labels */}
              <text x="78" y="195" fill="var(--text-secondary)" fontSize="10">Tue</text>
              <text x="148" y="195" fill="var(--text-secondary)" fontSize="10">Thu</text>
              <text x="218" y="195" fill="var(--text-secondary)" fontSize="10">Sat</text>
              <text x="288" y="195" fill="var(--text-secondary)" fontSize="10">Sun</text>
              <text x="358" y="195" fill="var(--text-secondary)" fontSize="10">Mon</text>
              <text x="428" y="195" fill="var(--text-secondary)" fontSize="10">Today</text>
            </svg>
          </div>
        </div>

      </div>

      {/* Numerical Metrics Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        
        {/* Top foods */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🏆 Top Selling Food Items</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>1. Royal Chicken Biryani</span>
              <strong>142 Orders</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>2. Cheese Pizza Extra Loaded</span>
              <strong>98 Orders</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>3. Onion Cheese Burger</span>
              <strong>74 Orders</strong>
            </li>
          </ul>
        </div>

        {/* Peak Hours */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>⏰ Peak Order Hours</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Dinner (08:00 PM - 10:00 PM)</span>
              <strong style={{ color: 'var(--primary-color)' }}>65% Volume</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Lunch (01:00 PM - 03:00 PM)</span>
              <strong>25% Volume</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Evening Snacks (05:00 PM - 07:00 PM)</span>
              <strong>10% Volume</strong>
            </li>
          </ul>
        </div>

        {/* User Growth & Loyalty */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📈 Loyalty &amp; Retention</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Repeat Customers Ratio</span>
              <strong style={{ color: '#10b981' }}>72.4%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Cancellation Rate</span>
              <strong style={{ color: '#ef4444' }}>1.8%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Active Promos Applied</span>
              <strong>46% checkouts</strong>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
