import { useState, useCallback, useEffect } from 'react';
import { Seo } from '../components/seo';
import { Star, CheckCircle, XCircle, LogOut, Clock, AlertTriangle, X, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = `${import.meta.env.BASE_URL}api`;
interface PendingReview {
  id: number;
  author: string;
  location: string;
  model: string | null;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (secret: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="mb-6">
          <div className="text-xs font-bold tracking-widest text-green-500 uppercase mb-2">
            DENAGO Admin
          </div>
          <h1 className="text-2xl font-bold text-white">Review Moderation</h1>
          <p className="text-sm text-gray-400 mt-1">Enter your admin secret to continue.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onLogin(value.trim());
          }}
        >
          <input
            type="password"
            autoFocus
            placeholder="Admin secret"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 mb-4"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-semibold rounded-lg py-3 text-sm transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  secret,
  onDone,
}: {
  review: PendingReview;
  secret: string;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<'idle' | 'approving' | 'rejecting' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const act = useCallback(
    async (action: 'approve' | 'reject') => {
      setStatus(action === 'approve' ? 'approving' : 'rejecting');
      setError(null);
      try {
        const res =
          action === 'approve'
            ? await fetch(`${API_BASE}/admin/reviews/${review.id}/approve`, {
                method: 'POST',
                headers: { 'x-admin-secret': secret },
              })
            : await fetch(`${API_BASE}/admin/reviews/${review.id}`, {
                method: 'DELETE',
                headers: { 'x-admin-secret': secret },
              });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
        }
        setStatus('done');
        setTimeout(onDone, 400);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
        setStatus('idle');
      }
    },
    [review.id, secret, onDone],
  );

  if (status === 'done') {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 opacity-0 transition-opacity duration-300" />
    );
  }

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Stars rating={review.rating} />
          <h2 className="font-semibold text-white leading-snug">{review.title}</h2>
        </div>
        <time className="text-xs text-gray-500 shrink-0 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(review.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>
      </div>

      {/* Body */}
      <p className="text-sm text-gray-300 leading-relaxed">{review.text}</p>

      {/* Author */}
      <div className="text-sm border-t border-gray-800 pt-3">
        <span className="font-semibold text-white">{review.author}</span>
        {review.location && (
          <span className="text-gray-400"> — {review.location}</span>
        )}
        {review.model && (
          <div className="text-xs text-green-500 font-semibold uppercase tracking-wider mt-1">
            {review.model} owner
          </div>
        )}
      </div>

      {/* Actions */}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => act('approve')}
          disabled={status !== 'idle'}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
        >
          <CheckCircle className="h-4 w-4" />
          {status === 'approving' ? 'Publishing…' : 'Approve'}
        </button>
        <button
          onClick={() => act('reject')}
          disabled={status !== 'idle'}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-900/60 disabled:opacity-50 text-gray-300 hover:text-red-300 border border-gray-700 hover:border-red-800 font-semibold rounded-lg py-2.5 text-sm transition-colors"
        >
          <XCircle className="h-4 w-4" />
          {status === 'rejecting' ? 'Deleting…' : 'Reject'}
        </button>
      </div>
    </article>
  );
}
interface NotificationStatus {
  error: string | null;
  updatedAt?: string | null;
}
export default function AdminReviews() {
  const [secret, setSecret] = useState<string | null>(
    () => sessionStorage.getItem('admin_secret'),
  );
  const [authError, setAuthError] = useState(false);
  const queryClient = useQueryClient();

  const handleLogin = (s: string) => {
    sessionStorage.setItem('admin_secret', s);
    setSecret(s);
    setAuthError(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_secret');
    setSecret(null);
    setAuthError(false);
  };

  const {
    data: reviews = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<PendingReview[]>({
    queryKey: ['admin-reviews', secret],
    enabled: !!secret,
    retry: false,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/reviews`, {
        headers: { 'x-admin-secret': secret! },
      });
      if (res.status === 401) {
        setAuthError(true);
        sessionStorage.removeItem('admin_secret');
        setSecret(null);
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAuthError(false);
      return res.json();
    },
  });

  const { data: notificationStatus } = useQuery<NotificationStatus>({
    queryKey: ['admin-notification-status', secret],
    enabled: !!secret,
    retry: false,
    refetchInterval: 60_000,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/notification-status`, {
        headers: { 'x-admin-secret': secret! },
      });
      if (!res.ok) return { error: null };
      return res.json();
    },
  });

  const dismissBanner = useMutation({
    mutationFn: async () => {
      await fetch(`${API_BASE}/admin/notification-status`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': secret! },
      });
    },
    onSuccess: () => {
      queryClient.setQueryData<NotificationStatus>(
        ['admin-notification-status', secret],
        { error: null },
      );
    },
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'failure'>('idle');
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  // Countdown tick
  useEffect(() => {
    if (rateLimitCountdown <= 0) return;
    const timer = setTimeout(() => setRateLimitCountdown((c) => Math.max(0, c - 1)), 1_000);
    return () => clearTimeout(timer);
  }, [rateLimitCountdown]);

  const sendTestEmail = useCallback(async () => {
    if (rateLimitCountdown > 0) return;
    setTestStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/admin/test-notification`, {
        method: 'POST',
        headers: { 'x-admin-secret': secret! },
      });
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        const retryAfter: number = (body as { retryAfter?: number }).retryAfter ?? 60;
        setRateLimitCountdown(retryAfter);
        setTestStatus('idle');
        return;
      }
      if (res.ok) {
        setTestStatus('success');
        setRateLimitCountdown(60);
        // Clear the error banner since the send succeeded.
        queryClient.setQueryData<NotificationStatus>(
          ['admin-notification-status', secret],
          { error: null },
        );
      } else {
        const body = await res.json().catch(() => ({}));
        setTestStatus('failure');
        // Reflect the new error in the banner.
        queryClient.setQueryData<NotificationStatus>(
          ['admin-notification-status', secret],
          { error: (body as { error?: string }).error ?? `HTTP ${res.status}` },
        );
      }
    } catch {
      setTestStatus('failure');
    }
    // Reset button label after 4 s.
    setTimeout(() => setTestStatus('idle'), 4_000);
  }, [secret, queryClient, rateLimitCountdown]);

  useEffect(() => {
    const base = 'Review Moderation';
    if (secret && !isLoading && !isError) {
      document.title = reviews.length > 0 ? `(${reviews.length}) ${base}` : base;
    } else {
      document.title = base;
    }
    return () => {
      document.title = base;
    };
  }, [reviews.length, isLoading, isError, secret]);

  if (!secret) {
    return (
      <>
        <Seo
          title="Admin — DENAGO Dealership"
          description=""
          noindex
        />
        <LoginForm onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
    <Seo
      title="Review Moderation — DENAGO Admin"
      description=""
      noindex
    />
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest text-green-500 uppercase">
              DENAGO Admin
            </span>
            <span className="text-gray-600">›</span>
            <span className="text-sm font-semibold text-white">Review Moderation</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={sendTestEmail}
              disabled={testStatus === 'sending' || rateLimitCountdown > 0}
              title={rateLimitCountdown > 0 ? `Rate limited — wait ${rateLimitCountdown}s` : undefined}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                rateLimitCountdown > 0
                  ? 'text-gray-500 cursor-not-allowed'
                  : testStatus === 'success'
                  ? 'text-green-400'
                  : testStatus === 'failure'
                  ? 'text-red-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              {testStatus === 'sending'
                ? 'Sending…'
                : rateLimitCountdown > 0
                ? `Wait ${rateLimitCountdown}s`
                : testStatus === 'success'
                ? 'Email sent!'
                : testStatus === 'failure'
                ? 'Send failed'
                : 'Send test email'}
            </button>
            <span className="text-gray-700">|</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Notification error banner */}
        {notificationStatus?.error && (
          <div className="mb-6 flex items-start gap-3 bg-amber-950/60 border border-amber-700/60 text-amber-200 rounded-xl px-5 py-4 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-300 mb-0.5">
                Email notifications are failing — check your Gmail connection
              </p>
              <p className="text-amber-400/80 text-xs">
                Last error: {notificationStatus.error}
              </p>
            </div>
            <button
              onClick={() => dismissBanner.mutate()}
              disabled={dismissBanner.isPending}
              aria-label="Dismiss notification error"
              className="shrink-0 text-amber-500 hover:text-amber-300 transition-colors disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Status */}
        {authError && (
          <div className="mb-6 bg-red-900/30 border border-red-800 text-red-300 rounded-xl px-5 py-4 text-sm">
            Incorrect admin secret. Please sign in again.
          </div>
        )}

        {isLoading && (
          <p className="text-gray-400 text-sm">Loading pending reviews…</p>
        )}

        {isError && !authError && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-sm text-gray-400">
            Failed to load reviews.{' '}
            <button
              onClick={() => refetch()}
              className="text-green-500 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && reviews.length === 0 && (
          <div className="text-center py-24">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4 opacity-60" />
            <p className="text-lg font-semibold text-white mb-1">All caught up</p>
            <p className="text-sm text-gray-400">No reviews are waiting for approval.</p>
          </div>
        )}

        {reviews.length > 0 && (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white">
                {reviews.length} pending review{reviews.length === 1 ? '' : 's'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Approve to publish publicly, or reject to permanently delete.
              </p>
            </div>
            <div className="grid gap-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  secret={secret}
                  onDone={() =>
                    queryClient.setQueryData<PendingReview[]>(
                      ['admin-reviews', secret],
                      (prev) => prev?.filter((r) => r.id !== review.id) ?? [],
                    )
                  }
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
    </>
  );
}
