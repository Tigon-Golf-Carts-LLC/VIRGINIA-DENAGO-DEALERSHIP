import { useEffect, useState, type ComponentProps, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DEALERSHIP } from '@/data/denago-models';
import { CheckCircle2, Loader2 } from 'lucide-react';

/**
 * TIGON IOT "Webhook Flows" lead form — form_name "Contact form".
 *
 * The browser posts to the site's own Worker at /api/lead (same origin). The
 * Worker (worker/index.js) forwards the untouched multipart body to the TIGON
 * webhook URL held in the LEAD_WEBHOOK_URL secret, so the webhook key never
 * ships in the JavaScript bundle.
 */
const ENDPOINT = '/api/lead';
const FORM_NAME = 'Contact form';
const HONEYPOT = 'website';
const MAX_FILE_MB = 10;
const ALLOWED_IMAGE = /\.(jpe?g|png|gif|webp|heic|heif)$/i;
const TRACK = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'] as const;
const STORE_KEY = 'tigon_first_touch';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const ERROR_TEXT = `Sorry, something went wrong. Please try again or call us at ${DEALERSHIP.phoneDisplay}.`;

/** A specific cart the lead is about; pre-fills brand / model / VIN / SKU. */
export interface LeadCart {
  brand: string;
  model: string;
  vin?: string;
  sku?: string;
}

type TrackingKey = (typeof TRACK)[number];

/** First-touch attribution: the first utm_* / gclid / fbclid seen are kept for 30 days. */
function firstTouch(): Record<TrackingKey, string> {
  const current: Partial<Record<TrackingKey, string>> = {};
  let found = false;
  try {
    const q = new URLSearchParams(window.location.search);
    TRACK.forEach((k) => {
      const v = q.get(k);
      if (v) {
        current[k] = v;
        found = true;
      }
    });
  } catch {
    /* ignore */
  }
  let saved: { ts: number; v: Partial<Record<TrackingKey, string>> } | null = null;
  try {
    saved = JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null');
  } catch {
    saved = null;
  }
  if (saved && (!saved.ts || Date.now() - saved.ts > MAX_AGE_MS)) saved = null;
  if (!saved && found) {
    saved = { ts: Date.now(), v: current };
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(saved));
    } catch {
      /* private mode */
    }
  }
  const out = {} as Record<TrackingKey, string>;
  TRACK.forEach((k) => {
    out[k] = saved?.v?.[k] || current[k] || '';
  });
  return out;
}

/** Google Analytics client id from the _ga cookie: GA1.1.123456.789012 -> 123456.789012 */
function gaClientId(): string {
  const m = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!m) return '';
  const parts = decodeURIComponent(m[1]).split('.');
  return parts.length >= 4 ? parts.slice(-2).join('.') : '';
}

function tracking(): Record<string, string> {
  return {
    ...firstTouch(),
    url: window.location.href,
    referrer: document.referrer || '',
    ga_client_id: gaClientId(),
  };
}

type Errors = Partial<Record<string, string>>;

function validate(form: HTMLFormElement): Errors {
  const fd = new FormData(form);
  const val = (k: string) => String(fd.get(k) ?? '').trim();
  const errors: Errors = {};
  if (!val('first_name')) errors.first_name = 'Please enter your first name.';
  if (!val('last_name')) errors.last_name = 'Please enter your last name.';
  const email = val('email');
  if (!email) errors.email = 'Please enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  const phone = val('phone1');
  if (!phone) errors.phone1 = 'Please enter your phone number.';
  else if (phone.replace(/\D/g, '').length < 10) errors.phone1 = 'Phone number needs at least 10 digits.';
  const phone2 = val('phone2');
  if (phone2 && phone2.replace(/\D/g, '').length < 10) errors.phone2 = 'Alternate phone needs at least 10 digits.';
  (['image_1', 'image_2', 'image_3'] as const).forEach((name) => {
    const input = form.elements.namedItem(name) as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) errors[name] = `Each photo must be smaller than ${MAX_FILE_MB} MB.`;
    else if (!file.type.startsWith('image/') && !ALLOWED_IMAGE.test(file.name))
      errors[name] = 'Photos must be jpg, png, gif, webp or heic.';
  });
  return errors;
}

function buildData(form: HTMLFormElement): FormData {
  const fd = new FormData(form);
  // Leave out empty file inputs so no blank images are sent.
  form.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => {
    if (input.name && !input.files?.length) fd.delete(input.name);
  });
  Object.entries(tracking()).forEach(([k, v]) => fd.set(k, v));
  fd.set('form_name', FORM_NAME);
  if (!fd.has(HONEYPOT)) fd.set(HONEYPOT, '');
  return fd;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function reportLead() {
  try {
    if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form_name: FORM_NAME });
    else if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'generate_lead', form_name: FORM_NAME });
  } catch {
    /* analytics must never break the form */
  }
}

const fieldClass = 'h-11 bg-background';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

export function LeadForm({
  cart,
  title = 'Send Us a Message',
  intro = "Tell us what you're looking for and our team will get back to you shortly.",
}: {
  cart?: LeadCart;
  title?: string;
  intro?: string;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [hidden, setHidden] = useState<Record<string, string>>({});

  useEffect(() => {
    setHidden(tracking());
  }, []);

  const id = (name: string) => `lead-${name}`;
  const describedBy = (name: string) => (errors[name] ? `${id(name)}-error` : undefined);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const found = validate(form);
    setErrors(found);
    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      setStatus({ ok: false, text: 'Please fix the highlighted fields.' });
      (form.elements.namedItem(firstBad) as HTMLElement | null)?.focus();
      return;
    }

    setSending(true);
    setStatus({ ok: true, text: 'Sending…' });
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', body: buildData(form) });
      let data: { ok?: boolean; error?: string; message?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (res.status === 429) throw new Error('Too many tries. Please wait a minute and try again.');
      if (!res.ok || !data || data.ok === false) throw new Error(data?.error || data?.message || ERROR_TEXT);
      form.reset();
      setHidden(tracking());
      setErrors({});
      setStatus({ ok: true, text: 'Thank you! We received your message and will contact you shortly.' });
      reportLead();
    } catch (err) {
      const msg = err instanceof Error && err.message && err.message !== 'Failed to fetch' ? err.message : ERROR_TEXT;
      setStatus({ ok: false, text: msg });
    } finally {
      setSending(false);
    }
  }

  const text = (
    name: string,
    label: string,
    props: ComponentProps<'input'> = {},
    half = true,
  ) => (
    <div className={`flex flex-col gap-2 ${half ? '' : 'sm:col-span-2'}`}>
      <Label htmlFor={id(name)}>
        {label}
        {props.required && <span className="text-primary"> *</span>}
      </Label>
      <Input
        id={id(name)}
        name={name}
        className={fieldClass}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={describedBy(name)}
        {...props}
      />
      <FieldError id={`${id(name)}-error`} message={errors[name]} />
    </div>
  );

  return (
    <div className="bg-card border border-border p-8 md:p-12 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-display font-bold mb-2 uppercase tracking-tight">{title}</h2>
      <p className="text-muted-foreground mb-8">{intro}</p>

      <form
        id="tigon-form-p48nmmgd"
        method="post"
        action={ENDPOINT}
        encType="multipart/form-data"
        noValidate
        onSubmit={onSubmit}
        className="relative"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {text('first_name', 'First name', { autoComplete: 'given-name', required: true })}
          {text('last_name', 'Last name', { autoComplete: 'family-name', required: true })}
          {text('email', 'Email', { type: 'email', autoComplete: 'email', required: true })}
          {text('phone1', 'Phone', { type: 'tel', autoComplete: 'tel', required: true })}
          {text('phone2', 'Alternate phone', { type: 'tel' })}
          {text('zip_code', 'ZIP code', { inputMode: 'numeric', autoComplete: 'postal-code' })}
          {text('address', 'Address', { autoComplete: 'street-address' }, false)}

          {cart ? (
            <div className="sm:col-span-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground mb-1">You're asking about</p>
              <p className="font-display font-bold text-lg uppercase">
                {cart.brand} — {cart.model}
              </p>
              {(cart.sku || cart.vin) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {cart.sku && <>Stock # / SKU: {cart.sku}</>}
                  {cart.sku && cart.vin && ' · '}
                  {cart.vin && <>VIN: {cart.vin}</>}
                </p>
              )}
              <input type="hidden" name="brand" value={cart.brand} />
              <input type="hidden" name="model" value={cart.model} />
              <input type="hidden" name="vin_number" value={cart.vin ?? ''} />
              <input type="hidden" name="sku_number" value={cart.sku ?? ''} />
            </div>
          ) : (
            <>
              {text('brand', 'Brand', { defaultValue: 'DENAGO' })}
              {text('model', 'Model you are interested in', { placeholder: 'e.g. DENAGO NOMAD XL' })}
              {text('vin_number', 'VIN (optional)')}
              {text('sku_number', 'Stock # / SKU (optional)')}
            </>
          )}

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor={id('comments')}>Message</Label>
            <Textarea id={id('comments')} name="comments" rows={4} placeholder="How can we help?" className="bg-background" />
          </div>

          {(['image_1', 'image_2', 'image_3'] as const).map((name, i) => (
            <div key={name} className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor={id(name)}>Photo {i + 1} (optional)</Label>
              <Input
                id={id(name)}
                name={name}
                type="file"
                accept="image/*,.heic,.heif"
                className="h-11 bg-background pt-2"
                aria-invalid={errors[name] ? true : undefined}
                aria-describedby={describedBy(name)}
              />
              <FieldError id={`${id(name)}-error`} message={errors[name]} />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Photos: up to {MAX_FILE_MB} MB each — jpg, png, gif, webp or heic.</p>

        {/* Spam trap: real visitors never see this field. It must be sent empty. */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
          <label htmlFor="lead-website">Leave this field empty</label>
          <input type="text" id="lead-website" name={HONEYPOT} tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        {/* Filled in automatically (again right before sending). */}
        <input type="hidden" name="form_name" value={FORM_NAME} />
        {['url', 'referrer', ...TRACK, 'ga_client_id'].map((k) => (
          <input key={k} type="hidden" name={k} value={hidden[k] ?? ''} readOnly />
        ))}

        <button
          type="submit"
          disabled={sending}
          className="mt-8 w-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-wait"
        >
          {sending && <Loader2 className="h-5 w-5 animate-spin" />}
          {sending ? 'Sending…' : 'Send Message'}
        </button>

        <p
          role="status"
          aria-live="polite"
          className={`mt-4 font-semibold flex items-start gap-2 ${status?.ok ? 'text-primary' : 'text-destructive'}`}
        >
          {status?.ok && !sending && <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />}
          {status?.text}
        </p>
      </form>
    </div>
  );
}
