import React, { useState, useEffect } from 'react';

interface Review {
  id?: number;
  foodId: number;
  userName: string;
  content: string;
  rating: number;
  likes: number;
  restaurantReply?: string;
  mediaUrl?: string;
}

interface ReviewsSectionProps {
  foodId: number;
  currentUser: { name: string; role: string } | null;
}

const MOCK_MEDIA_OPTIONS = [
  { name: 'None', url: '' },
  { name: 'Delicious Pizza Photo 🍕', url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=60' },
  { name: 'Gourmet Burger Photo 🍔', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60' },
  { name: 'Gourmet Plate Photo 🍛', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60' }
];

export default function ReviewsSection({ foodId, currentUser }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/reviews/food/${foodId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [foodId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const res = await fetch('http://localhost:8080/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodId,
          userName: currentUser.name,
          content,
          rating,
          mediaUrl
        })
      });
      if (res.ok) {
        setContent('');
        setMediaUrl('');
        setRating(5);
        fetchReviews();
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleLike = async (reviewId: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/reviews/${reviewId}/like`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleReplySubmit = async (reviewId: number) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`http://localhost:8080/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: text })
      });
      if (res.ok) {
        setReplyText(prev => ({ ...prev, [reviewId]: '' }));
        fetchReviews();
      }
    } catch (e) {
      // Ignore
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
      <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Customer Reviews &amp; Ratings</h4>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>No reviews yet. Be the first to share your thoughts!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {reviews.map(rev => (
            <div key={rev.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{rev.userName}</strong>
                  <span style={{ marginLeft: '0.8rem', color: '#ffb300', fontSize: '0.8rem' }}>
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </span>
                </div>
                <button
                  onClick={() => handleLike(rev.id!)}
                  style={{ background: 'transparent', border: 'none', color: '#ff5a36', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  👍 Helpful ({rev.likes})
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>{rev.content}</p>

              {/* Review media photo upload mock */}
              {rev.mediaUrl && (
                <div style={{ margin: '0.6rem 0' }}>
                  <img src={rev.mediaUrl} alt="Review attachment" style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover' }} />
                </div>
              )}

              {/* Merchant response reply display */}
              {rev.restaurantReply ? (
                <div style={{ background: 'rgba(255, 90, 54, 0.05)', borderLeft: '3px solid var(--primary-color)', padding: '0.5rem 0.8rem', borderRadius: '4px', marginTop: '0.6rem', fontSize: '0.8rem' }}>
                  <strong style={{ color: 'var(--primary-color)' }}>Store Owner:</strong> {rev.restaurantReply}
                </div>
              ) : (
                /* Admin reply input form if user is store owner */
                currentUser?.role === 'ADMIN' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                    <input
                      type="text"
                      placeholder="Write restaurant reply..."
                      className="form-control"
                      value={replyText[rev.id!] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [rev.id!]: e.target.value }))}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1 }}
                    />
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleReplySubmit(rev.id!)}>
                      Reply
                    </button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Form (Only for logged in users) */}
      {currentUser && currentUser.role !== 'ADMIN' && (
        <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-light)', padding: '1rem', borderRadius: '8px' }}>
          <h5 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem' }}>Write a Review</h5>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rating:</label>
              <select
                className="select-control"
                value={rating}
                onChange={e => setRating(parseInt(e.target.value))}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            
            {/* Mock Media Attachments */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Attach Photo:</label>
              <select
                className="select-control"
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
              >
                {MOCK_MEDIA_OPTIONS.map(opt => (
                  <option key={opt.url} value={opt.url}>{opt.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Tell us about the taste, service, or delivery..."
              required
              className="form-control"
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ padding: '0.5rem', fontSize: '0.85rem', flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
              Post
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
