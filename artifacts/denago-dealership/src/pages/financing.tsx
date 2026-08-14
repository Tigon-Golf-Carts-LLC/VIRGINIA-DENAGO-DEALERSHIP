import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import {
  Phone,
  BadgePercent,
  Clock,
  Landmark,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

const heroBadges = [
  { icon: BadgePercent, title: '0% APR Available', text: 'On qualifying new carts' },
  { icon: Clock, title: 'Same-Day Approval', text: 'Decisions in minutes' },
  { icon: Landmark, title: '6 Lending Partners', text: 'Sheffield, DLL, Octane & more' },
  { icon: ShieldCheck, title: 'No Hidden Fees', text: 'Transparent terms always' },
];

const lenders = [
  {
    name: 'Sheffield Financial',
    tagline: 'Prequalify Now!',
    text: 'Get prequalified with no impact to your credit.*',
    url: 'https://prequalify.sheffieldfinancial.com/Apply/Dealer/56712?source=web',
  },
  {
    name: 'BLI Heartland',
    tagline: 'Rent To Own',
    text: 'Helping golf cart customers achieve ownership.*',
    url: 'https://blirentals.com/app/TIGON_GOLFCARTS_LLC',
  },
  {
    name: 'DLL Financial Solutions',
    tagline: 'DLL Financial Solutions',
    text: 'Get the lowest APR without hidden fees.*',
    url: 'https://applynow-cica-prd.dllgroup.com/?entityId=4&dealerCode=015639',
  },
  {
    name: 'Roadrunner / Octane',
    tagline: 'Consumer Financing',
    text: 'Get ready to ride with consumer financing.',
    url: 'https://octane.co/flex/034170',
  },
  {
    name: 'Univest Capital',
    tagline: 'Univest Capital',
    text: 'A customized solution for your specific business needs.',
    url: 'https://form.jotform.com/UnivestCapital/credit-application-bakos?utm_source=TIGON+Golf+Carts&utm_medium=Financing&utm_campaign=Business&utm_term=Best+Golf+Cart+Financing',
  },
  {
    name: 'Dealer Direct',
    tagline: 'Dealer Direct Financing',
    text: 'Buy now, pay later with Dealer Direct Financing.*',
    url: 'https://dealerdirect.apptraker.com/my/guest?dealer=10735',
  },
];

const programs = [
  { name: '0% APR Financing', badge: 'Best Rate', terms: '12–60 months', credit: 'Good–Excellent (650+)', bestFor: 'New carts, lowest total cost' },
  { name: 'Standard Installment', terms: '24–72 months', credit: 'Fair–Good (580+)', bestFor: 'New & used, flexible monthly' },
  { name: 'Rent-to-Own', terms: '12–48 months', credit: 'All credit types', bestFor: 'No credit / rebuilding credit' },
  { name: 'Business / Commercial', terms: '24–60 months', credit: 'Business credit', bestFor: 'Fleets, golf courses, resorts' },
  { name: 'Buy Now, Pay Later', terms: 'Up to 48 months', credit: 'Soft-pull pre-qual', bestFor: 'Fastest approval path' },
  { name: 'In-House Financing', terms: 'Custom terms', credit: 'Bad credit OK', bestFor: 'Last-resort / special cases' },
];

const steps = [
  {
    title: 'Choose Your Cart',
    text: 'Browse the Denago lineup online or visit any of our 16 locations. Our team will help you match a cart to your budget and use case.',
  },
  {
    title: 'Apply in Minutes',
    text: 'Select a lending partner and complete the short online application. Most programs require only basic personal and income information — no long forms.',
  },
  {
    title: 'Get Approved & Drive Away',
    text: "Receive your decision — often same-day. Sign your agreement, arrange pickup or delivery, and you're done. That's it.",
  },
];

const whyPoints = [
  '6 financing partners covering every credit profile — good, fair, bad, and no credit',
  '0% APR available on qualifying new golf cart purchases',
  'Loan terms from 12 to 72 months — choose the monthly payment that fits your budget',
  'Soft-pull pre-qualification available with no impact to your credit score',
  'Rent-to-own and in-house financing for buyers who don\u2019t qualify elsewhere',
  'Financing available on new carts, street-legal LSVs, NEVs, and fleet orders',
  '16 dealership pickup locations — or take delivery nationwide',
  `Financing team available by phone 6 days a week at ${DEALERSHIP.phoneDisplay}`,
];

const faqs = [
  {
    q: 'What credit score do I need to finance a golf cart?',
    a: 'Our 0% APR promotional financing typically requires good-to-excellent credit (650+). Standard installment loans are available from around 580, and our rent-to-own and in-house programs accept all credit types — including no credit history and past bankruptcies.',
  },
  {
    q: 'How does in-house golf cart financing work?',
    a: 'With in-house financing, the dealership finances you directly instead of a bank. Approval is based primarily on your income and ability to pay, not your credit score, making it a strong option for buyers with bad credit or no credit.',
  },
  {
    q: 'Is no down payment golf cart financing available?',
    a: 'Yes. Qualified buyers may be eligible for $0-down financing through several of our lending partners. Zero-down programs are available for good, fair, and even challenged credit — call us to see which lenders you qualify with.',
  },
  {
    q: 'What are typical golf cart loan terms and monthly payments?',
    a: 'Terms range from 12 to 72 months depending on the program. As an example, a $9,500 cart with $1,000 down at 0% APR over 48 months works out to roughly $177/month. Use the payment calculator on this page to estimate your own payment.',
  },
  {
    q: 'How quickly can I get approved for golf cart financing?',
    a: 'Most of our lending partners return decisions in minutes, and many buyers complete the entire process — application, approval, and signing — the same day.',
  },
  {
    q: 'Can I refinance my existing golf cart loan?',
    a: 'In many cases, yes. If you financed at a higher rate or want to change your term, call our financing team and we can review refinancing and trade-in/upgrade options with our lending partners.',
  },
];

function formatMoney(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function PaymentCalculator() {
  const [price, setPrice] = useState(9995);
  const [down, setDown] = useState(1999);
  const [apr, setApr] = useState(0);
  const [months, setMonths] = useState(48);

  const { monthly, financed, totalPaid } = useMemo(() => {
    const safePrice = Number.isFinite(price) ? Math.max(price, 0) : 0;
    const safeDown = Number.isFinite(down) ? Math.min(Math.max(down, 0), safePrice) : 0;
    const principal = Math.max(safePrice - safeDown, 0);
    if (principal === 0 || months <= 0) return { monthly: 0, financed: principal, totalPaid: principal };
    const r = apr / 100 / 12;
    const payment = r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
    return { monthly: payment, financed: principal, totalPaid: payment * months };
  }, [price, down, apr, months]);

  const inputClass =
    'w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50';

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 max-w-2xl">
      <h3 className="font-display font-bold text-xl uppercase tracking-tight mb-6">Payment Calculator</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <label className="block">
          <span className="text-sm font-semibold text-muted-foreground">Cart Price ($)</span>
          <input type="number" min={0} value={price} onChange={(e) => setPrice(Math.max(Number(e.target.value) || 0, 0))} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-muted-foreground">Down Payment ($)</span>
          <input type="number" min={0} value={down} onChange={(e) => setDown(Math.max(Number(e.target.value) || 0, 0))} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-muted-foreground">Annual Interest Rate (%)</span>
          <select value={apr} onChange={(e) => setApr(Number(e.target.value))} className={inputClass}>
            <option value={0}>0% — Promotional APR</option>
            <option value={4.99}>4.99%</option>
            <option value={7.99}>7.99%</option>
            <option value={9.99}>9.99%</option>
            <option value={12.99}>12.99%</option>
            <option value={17.99}>17.99%</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-muted-foreground">Loan Term (months)</span>
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className={inputClass}>
            {[12, 24, 36, 48, 60, 72].map((m) => (
              <option key={m} value={m}>{m} months</option>
            ))}
          </select>
        </label>
      </div>
      <div className="bg-secondary rounded-lg p-6 text-center mb-4">
        <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mb-1">Estimated Monthly Payment</div>
        <div className="text-4xl font-display font-bold text-primary">{formatMoney(Math.round(monthly))}/mo</div>
        <div className="text-sm text-muted-foreground mt-2">
          Total financed: {formatMoney(financed)} · Total paid: {formatMoney(Math.round(totalPaid))}
        </div>
      </div>
      <a
        href={`tel:${DEALERSHIP.phone}`}
        className="block w-full text-center bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Apply Now
      </a>
      <p className="text-xs text-muted-foreground mt-3">
        Estimate only. Actual rate and payment depend on credit approval, lender, and cart details. 0% APR on qualifying purchases.
      </p>
    </div>
  );
}

export default function Financing() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <Seo
        title={`Golf Cart Financing — 0% APR & All Credit Types | ${DEALERSHIP.name}`}
        description="Finance your Denago golf cart with 0% APR on qualifying new carts, same-day approval, and 6 lending partners covering good, fair, bad, and no credit. Apply online in minutes."
        url={`${DEALERSHIP.domain}/financing`}
        schema={faqJsonLd}
      />
      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="mb-10 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              GOLF CART <span className="text-primary">FINANCING</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              We partner with 6 trusted lenders covering every credit type — good, fair, bad, and no credit
              history. Click any partner below to start your application.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${DEALERSHIP.phone}`}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Phone className="h-5 w-5" /> Call {DEALERSHIP.phoneDisplay}
              </a>
              <a
                href="#apply"
                className="inline-flex items-center gap-2 bg-card border border-border font-bold px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
              >
                Apply Online
              </a>
            </div>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16 max-w-5xl">
            {heroBadges.map((b) => (
              <div key={b.title} className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
                <div className="bg-secondary p-2.5 rounded-full text-primary shrink-0">
                  <b.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold">{b.title}</div>
                  <div className="text-sm text-muted-foreground">{b.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Denago Direct Financing */}
          <section className="mb-16 max-w-6xl">
            <div className="bg-foreground text-background rounded-xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex-1">
                  <div className="inline-block bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                    Exclusive Offer
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-white mb-3">
                    DENAGO <span className="text-primary">DIRECT FINANCING</span>
                  </h2>
                  <p className="text-white/70 max-w-xl">
                    0% financing for 48 months — monthly payments starting at{' '}
                    <span className="text-white font-bold">$166.58</span>. Call to get DENAGO DIRECT
                    FINANCING.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0">
                  <div className="text-center lg:text-right">
                    <div className="text-4xl font-display font-bold text-primary">0% APR</div>
                    <div className="text-sm text-white/60 uppercase tracking-wide font-semibold">for 48 months</div>
                  </div>
                  <a
                    href={`tel:${DEALERSHIP.phone}`}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="h-5 w-5" /> Call {DEALERSHIP.phoneDisplay}
                  </a>
                </div>
              </div>
              <p className="relative text-[11px] text-white/50 leading-relaxed mt-6">
                $166.58/month based on $9,995 MSRP with 20% down, financed for 48 months at 0% APR with
                approved credit through participating lenders. Taxes, fees, and optional equipment not
                included. Offer subject to change and availability.
              </p>
            </div>
          </section>

          {/* Lenders */}
          <section id="apply" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight mb-2">Apply with Any of Our Partner LENDERS.
</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Flexible options, quick approval, competitive rates, and no hidden fees. Every application goes
              directly to the lender — most return a decision in minutes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl">
              {lenders.map((l) => (
                <div key={l.name} className="bg-card border border-border rounded-xl p-6 flex flex-col">
                  <h3 className="font-bold text-lg">{l.name}</h3>
                  <div className="text-primary font-semibold text-sm mb-2">{l.tagline}</div>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{l.text}</p>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Quick Apply <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Calculator */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight mb-2">
              Estimate Your Monthly Payment
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Adjust the fields below to see your estimated payment for any cart at any APR.
            </p>
            <PaymentCalculator />
          </section>

          {/* Programs table */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight mb-2">
              Financing Programs at a Glance
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Every program available — compare terms, credit requirements, and ideal use case.
            </p>
            <div className="overflow-x-auto max-w-5xl">
              <table className="w-full text-sm bg-card border border-border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-secondary text-left">
                    <th className="px-4 py-3 font-bold uppercase tracking-wide">Program</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wide">Terms</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wide">Credit Required</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wide">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p) => (
                    <tr key={p.name} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold">
                        {p.name}
                        {p.badge && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.terms}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.credit}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4 max-w-3xl">
              Credit requirements vary by lender. Call{' '}
              <a href={`tel:${DEALERSHIP.phone}`} className="text-primary font-semibold hover:underline">
                {DEALERSHIP.phoneDisplay}
              </a>{' '}
              for a no-obligation consultation — our team will match you with the right program.
            </p>
          </section>

          {/* How it works */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight mb-2">
              How Golf Cart Financing Works
            </h2>
            <p className="text-muted-foreground mb-8">Three steps from application to keys in your hand.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
              {steps.map((s, i) => (
                <div key={s.title} className="bg-card border border-border rounded-xl p-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-display font-bold flex items-center justify-center mb-4">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why finance */}
          <section className="mb-16 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight mb-4">
              Why Finance Your Golf Cart with {DEALERSHIP.name}?
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
              <p>
                Buying a golf cart outright isn't always the right move — and it doesn't have to be.{' '}
                {DEALERSHIP.name} works with a network of six national lenders so we can offer competitive
                financing for almost every buyer, regardless of credit history. Whether you're financing a
                compact <Link href="/scout2" className="text-primary font-semibold hover:underline">SCOUT 2</Link> or
                a street-legal 8-passenger{' '}
                <Link href="/denago/ev-rover-xxl" className="text-primary font-semibold hover:underline">ROVER XXL</Link>,
                our finance team will walk you through every option and help you choose the terms that work
                for your budget.
              </p>
              <p>
                Our 0% APR promotional financing (on qualifying new cart purchases) means you pay exactly the
                sticker price — spread over 12 to 60 months with no interest added. For buyers with fair or
                challenged credit, our rent-to-own and in-house programs ensure that a credit score never
                stands between you and your cart.
              </p>
            </div>
            <ul className="space-y-2">
              {whyPoints.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ */}
          <section className="mb-16 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground mb-8">Answers to common golf cart financing questions.</p>
            <div className="space-y-4">
              {faqs.map((f) => (
                <details key={f.q} className="bg-card border border-border rounded-xl p-5 group">
                  <summary className="font-bold cursor-pointer list-none flex justify-between items-center gap-4">
                    {f.q}
                    <span className="text-primary transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                  </summary>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-card border border-border rounded-xl p-8 md:p-10 max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight mb-3">
              Ready to Apply? Call or Apply Online Now.
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our financing team is available 6 days a week. Call to speak with someone directly, or click to
              start your application with any of our lending partners.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={`tel:${DEALERSHIP.phone}`}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Phone className="h-5 w-5" /> {DEALERSHIP.phoneDisplay}
              </a>
              <a
                href="#apply"
                className="inline-flex items-center gap-2 bg-secondary font-bold px-6 py-3 rounded-lg hover:bg-secondary/70 transition-colors"
              >
                Apply Online
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
