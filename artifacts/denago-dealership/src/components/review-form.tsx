import { useRef, useState } from 'react';
import { Star } from 'lucide-react';

const API_URL = `${import.meta.env.BASE_URL}api/reviews`;

const MODELS = [
  'EV City',
  'EV Nomad',
  'EV Nomad XL',
  'EV Rover',
  'EV Rover XL',
  'EV Rover XXL',
  'Scout 2',
  'OXEN',
];

export function ReviewForm() {
  const startedAt = useRef(Date.now());
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (rating === 0) {
      setError('Please choose a star rating.');
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus('submitting');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: data.get('author'),
          location: data.get('location'),
          model: data.get('model') || undefined,
          rating,
          title: data.get('title'),
          text: data.get('text'),
          website: data.get('website'), // honeypot
          startedAt: startedAt.current,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? 'Something went wrong. Please try again.');
      }
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (status === 'done') {
    return (
      <div className="max-w-3xl bg-card border border-border rounded-xl p-8" id="write-review">
        <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-3">
          Thank You for <span className="text-primary">Your Review</span>
        </h2>
        <p className="text-muted-foreground">
          Your review has been received and will appear on this page once it's verified by our
          team. We review every submission to keep this page genuine and spam-free.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl bg-card border border-border rounded-xl p-8" id="write-review">
      <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">
        Write a <span className="text-primary">Review</span>
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Reviews are verified before publishing to keep this page genuine.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot — hidden from real users, bots fill it in */}
        <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div>
          <span className="block text-sm font-semibold mb-2">Your Rating *</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${i} star${i === 1 ? '' : 's'}`}
                className="p-1"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    i <= (hoverRating || rating)
                      ? 'text-primary fill-primary'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="review-author">
              Name *
            </label>
            <input
              id="review-author"
              name="author"
              required
              minLength={2}
              maxLength={80}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="First name, last initial"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="review-location">
              City / State
            </label>
            <input
              id="review-location"
              name="location"
              maxLength={80}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. Hatfield, PA"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="review-model">
              Your Model
            </label>
            <select
              id="review-model"
              name="model"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              defaultValue=""
            >
              <option value="">Select a model (optional)</option>
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="review-title">
              Review Title *
            </label>
            <input
              id="review-title"
              name="title"
              required
              minLength={3}
              maxLength={120}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Sum it up in a sentence"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="review-text">
            Your Review *
          </label>
          <textarea
            id="review-text"
            name="text"
            required
            minLength={20}
            maxLength={2000}
            rows={5}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="What do you like about your Denago? Battery life, tech, the buying experience... (no links, please)"
          />
        </div>

        {error && (
          <p className="text-sm font-semibold text-destructive" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
