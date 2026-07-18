import { useRef, useState, useEffect } from 'react';

const PRIZES = [
  { name: '10% OFF', code: 'SPIN10', discount: 0.10 },
  { name: '20% OFF', code: 'SPIN20', discount: 0.20 },
  { name: 'FREE DRINK', code: 'FREEDRINK', discount: 0.15 },
  { name: '30% OFF', code: 'SPIN30', discount: 0.30 },
  { name: 'NO PRIZE', code: '', discount: 0 },
  { name: '50% OFF', code: 'SPIN50', discount: 0.50 }
];

export default function GamificationWheel({ onApplyDiscount }: { onApplyDiscount: (code: string, discount: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<{ name: string; code: string; discount: number } | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const sliceAngle = (2 * Math.PI) / PRIZES.length;

    ctx.clearRect(0, 0, size, size);

    // Draw slices
    PRIZES.forEach((prize, index) => {
      const angle = index * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + sliceAngle);
      ctx.closePath();

      // Alternate colors
      ctx.fillStyle = index % 2 === 0 ? '#ff5a36' : '#222530';
      ctx.fill();
      ctx.strokeStyle = '#383b4c';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(prize.name, radius - 15, 5);
      ctx.restore();
    });

    // Draw center peg
    ctx.beginPath();
    ctx.arc(center, center, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#ff5a36';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer arrow
    ctx.beginPath();
    ctx.moveTo(center + radius - 5, center - 10);
    ctx.lineTo(center + radius + 15, center);
    ctx.lineTo(center + radius - 5, center + 10);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  };

  useEffect(() => {
    drawWheel();
  }, []);

  const spin = () => {
    if (spinning || hasSpun) return;
    setSpinning(true);
    setWonPrize(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    let rotation = 0;
    let currentSpeed = 15;

    const animate = () => {
      rotation += currentSpeed;
      canvas.style.transform = `rotate(${rotation}deg)`;

      if (currentSpeed > 0.2) {
        currentSpeed *= 0.98; // decelerate slowly
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setHasSpun(true);
        // Calculate stopping slice
        const normalizedAngle = (rotation % 360);
        // Canvas rotation is clockwise. Angle of stopping index:
        // stopping peg is at 0 degrees (pointing right)
        const stopIndex = Math.floor(((360 - normalizedAngle) / 360) * PRIZES.length) % PRIZES.length;
        const result = PRIZES[stopIndex];
        setWonPrize(result);
      }
    };

    animate();
  };

  const handleApply = () => {
    if (wonPrize && wonPrize.code) {
      onApplyDiscount(wonPrize.code, wonPrize.discount);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '2rem auto' }}>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>🎁 Cravora Rewards</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Spin the wheel daily to earn exciting mock coupon vouchers!
      </p>

      {/* Canvas container with pointer indicator */}
      <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 1.5rem auto' }}>
        <div style={{ position: 'absolute', top: '50%', right: '-8px', transform: 'translateY(-50%) rotate(180deg)', zIndex: 10, fontSize: '1.4rem' }}>
          📐
        </div>
        <canvas
          ref={canvasRef}
          width={220}
          height={220}
          style={{
            borderRadius: '50%',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            transition: spinning ? 'none' : 'transform 0.4s ease-out',
            transformOrigin: '50% 50%'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          className="btn btn-primary"
          onClick={spin}
          disabled={spinning || hasSpun}
          style={{ width: '100%' }}
        >
          {spinning ? 'Spinning...' : hasSpun ? 'Daily Limit Reached' : '🎡 Spin Now'}
        </button>

        {wonPrize && (
          <div style={{ animation: 'slideIn 0.3s forwards', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
            <h4 style={{ color: '#10b981', margin: '0 0 0.25rem 0' }}>Congratulations! 🎉</h4>
            <p style={{ fontSize: '0.85rem', margin: '0 0 0.8rem 0' }}>
              You won <strong>{wonPrize.name}</strong>
            </p>
            {wonPrize.code ? (
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                <code style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>{wonPrize.code}</code>
                <button className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }} onClick={handleApply}>
                  Apply to Cart
                </button>
              </div>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Better luck next time!</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
