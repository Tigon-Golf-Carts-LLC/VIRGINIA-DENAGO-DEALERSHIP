import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ClipboardList, MessageCircle, MessagesSquare, Phone, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LeadForm, type LeadCart } from '@/components/lead-form';
import { DEALERSHIP, getModelBySlug } from '@/data/denago-models';

/**
 * One floating contact bubble (bottom-right) that combines:
 *   1. Send Us a Message -> the TIGON lead form ("Contact form") in a modal
 *   2. Direct Message    -> the Tigon DMS chat plugin (loaded in index.html)
 *   3. Call Now          -> tel: link to the dealership phone
 *
 * The chat plugin renders in an open shadow root on #chat-plugin-host and
 * brings its own floating bubble. We hide that bubble (and its "Chat With Us"
 * callout), recolour the plugin to the site's orange, and open/close its popup
 * by clicking the hidden bubble, so all of the plugin's own logic still runs.
 */

const BRAND_ORANGE = '#f76503'; // hsl(24 98% 49%) = --primary
const CHAT_STYLE_ID = 'denago-chat-overrides';
const CHAT_WAIT_MS = 10_000;

const TEL_HREF = `tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`;

function chatRoot(): ShadowRoot | null {
  return document.getElementById('chat-plugin-host')?.shadowRoot ?? null;
}

/** Hide the plugin's own launcher and match the site's branding. Idempotent. */
function patchChat(root: ShadowRoot): boolean {
  if (!root.getElementById('chat-bubble')) return false;
  if (!root.getElementById(CHAT_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = CHAT_STYLE_ID;
    style.textContent = `
      #chat-bubble, #chat-callout { display: none !important; }
      .bg-primary { background-color: ${BRAND_ORANGE} !important; }
      .border-primary { border-color: ${BRAND_ORANGE} !important; }
      #chat-plugin-container { right: 20px; bottom: 20px; }
    `;
    root.appendChild(style);
  }
  return true;
}

function chatIsOpen(root: ShadowRoot | null): boolean {
  const popup = root?.getElementById('chat-popup');
  return !!popup && !popup.classList.contains('hidden');
}

/** The cart shown on a model page, so a lead sent from the bubble says which one. */
function cartForPath(path: string): LeadCart | undefined {
  const clean = path.replace(/\/$/, '');
  const slug = clean === '/oxen' ? 'oxen' : clean === '/scout2' ? 'scout2' : clean.match(/^\/denago\/([^/]+)$/)?.[1];
  const model = slug ? getModelBySlug(slug) : undefined;
  return model ? { brand: 'DENAGO', model: model.name, sku: model.slug } : undefined;
}

export function ContactWidget() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [chatReady, setChatReady] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState('');
  const [chatError, setChatError] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Wait for the async plugin script, patch it, then mirror its state.
  useEffect(() => {
    let observer: MutationObserver | null = null;
    let timer = 0;
    const started = Date.now();

    const attach = () => {
      const root = chatRoot();
      if (!root || !patchChat(root)) {
        if (Date.now() - started < 60_000) timer = window.setTimeout(attach, 250);
        return;
      }
      setChatReady(true);
      const sync = () => {
        setChatOpen(chatIsOpen(root));
        const badge = root.getElementById('chat-unread-badge');
        setUnread(badge && !badge.classList.contains('hidden') ? badge.textContent ?? '' : '');
      };
      sync();
      observer = new MutationObserver(sync);
      observer.observe(root, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true, characterData: true });
    };
    attach();
    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);

  const closeMenu = useCallback((returnFocus = true) => {
    setMenuOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // Escape and outside clicks close the menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !toggleRef.current?.contains(t)) closeMenu(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    panelRef.current?.querySelector<HTMLElement>('[data-first]')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [menuOpen, closeMenu]);

  // Close the menu when the route changes.
  useEffect(() => setMenuOpen(false), [location]);

  function toggleChat(): boolean {
    const root = chatRoot();
    const bubble = root?.getElementById('chat-bubble') as HTMLElement | null;
    if (!root || !bubble) return false;
    bubble.click();
    // The plugin's popup has its own focusable elements; move focus into it.
    window.setTimeout(() => {
      if (chatIsOpen(root)) {
        root.querySelector<HTMLElement>('#chat-popup button:not(#close-popup), #chat-popup input, #chat-popup textarea')?.focus();
      }
    }, 50);
    return true;
  }

  async function openChat() {
    setChatError(false);
    let root = chatRoot();
    const started = Date.now();
    while ((!root || !patchChat(root)) && Date.now() - started < CHAT_WAIT_MS) {
      await new Promise((r) => setTimeout(r, 200));
      root = chatRoot();
    }
    if (!root || !patchChat(root)) {
      setChatError(true);
      return;
    }
    closeMenu(false);
    if (!chatIsOpen(root)) toggleChat();
  }

  function onBubbleClick() {
    // While the chat window is open the bubble acts as its close button.
    if (chatOpen) {
      toggleChat();
      return;
    }
    setChatError(false);
    setMenuOpen((v) => !v);
  }

  const optionClass =
    'group flex w-full items-center gap-4 rounded-xl border border-border bg-background p-4 min-h-[72px] text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';
  const iconClass =
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground';

  const bubbleLabel = chatOpen ? 'Close chat' : menuOpen ? 'Close contact options' : 'Contact us';
  const cart = cartForPath(location);

  return (
    <>
      <div
        hidden={formOpen}
        className="fixed z-[60] flex flex-col items-end gap-3"
        style={{
          right: 'max(1.25rem, env(safe-area-inset-right))',
          bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        }}
      >
        {menuOpen && (
          <div
            ref={panelRef}
            id="contact-widget-menu"
            role="dialog"
            aria-modal="false"
            aria-labelledby="contact-widget-title"
            className="w-[min(22rem,calc(100vw-2.5rem))] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-150"
          >
            <div className="flex items-center justify-between gap-3 rounded-t-2xl bg-primary px-5 py-4 text-primary-foreground">
              <div>
                <h2 id="contact-widget-title" className="font-display text-base font-bold uppercase tracking-tight">
                  How can we help?
                </h2>
                <p className="text-sm opacity-90">{DEALERSHIP.name}</p>
              </div>
              <button
                type="button"
                onClick={() => closeMenu()}
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close contact options"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <ul className="flex flex-col gap-3 p-4">
              <li>
                <button
                  type="button"
                  data-first
                  className={optionClass}
                  onClick={() => {
                    closeMenu(false);
                    setFormOpen(true);
                  }}
                >
                  <span className={iconClass} aria-hidden="true">
                    <ClipboardList className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block text-base font-bold text-foreground">Send Us a Message</span>
                    <span className="block text-sm text-muted-foreground">Submit a contact form, for us to contact you.</span>
                  </span>
                </button>
              </li>
              <li>
                <button type="button" className={optionClass} onClick={openChat} aria-describedby={chatError ? 'contact-widget-chat-error' : undefined}>
                  <span className={iconClass} aria-hidden="true">
                    <MessagesSquare className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block text-base font-bold text-foreground">Direct Message</span>
                    <span className="block text-sm text-muted-foreground">Start a direct message with customer service.</span>
                  </span>
                </button>
                {chatError && (
                  <p id="contact-widget-chat-error" role="alert" className="mt-2 px-1 text-sm font-medium text-destructive">
                    Chat isn't available right now. Please send us a message or call {DEALERSHIP.phoneDisplay}.
                  </p>
                )}
              </li>
              <li>
                <a href={TEL_HREF} className={optionClass} onClick={() => closeMenu(false)}>
                  <span className={iconClass} aria-hidden="true">
                    <Phone className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block text-base font-bold text-foreground">Call Now</span>
                    <span className="block text-sm text-muted-foreground">
                      Call us directly. <span className="font-semibold text-foreground">{DEALERSHIP.phoneDisplay}</span>
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        )}

        <button
          ref={toggleRef}
          type="button"
          onClick={onBubbleClick}
          aria-label={bubbleLabel}
          aria-expanded={chatOpen ? undefined : menuOpen}
          aria-controls={menuOpen ? 'contact-widget-menu' : undefined}
          data-chat-ready={chatReady || undefined}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          {menuOpen || chatOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
          {unread && !chatOpen && (
            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
              {unread}
              <span className="sr-only"> unread chat messages</span>
            </span>
          )}
        </button>
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) window.setTimeout(() => toggleRef.current?.focus(), 0);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[92dvh] w-[calc(100vw-1.5rem)] rounded-2xl p-6 sm:p-8 [&>button:last-child]:h-11 [&>button:last-child]:w-11 [&>button:last-child]:flex [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child>svg]:h-6 [&>button:last-child>svg]:w-6 [&>button:last-child]:right-3 [&>button:last-child]:top-3">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold uppercase tracking-tight">
              {cart ? `Ask About the ${cart.model}` : 'Send Us a Message'}
            </DialogTitle>
            <DialogDescription>Submit a contact form, for us to contact you.</DialogDescription>
          </DialogHeader>
          <LeadForm bare idPrefix="widget" cart={cart} />
        </DialogContent>
      </Dialog>
    </>
  );
}
