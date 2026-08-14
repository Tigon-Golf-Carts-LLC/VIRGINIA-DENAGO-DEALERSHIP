export interface ResourceSection {
  heading: string;
  text: string;
}

export interface DenagoResource {
  slug: string; // top-level URL path
  cardTitle: string; // shown on the resource card
  title: string; // page H1 (first part)
  titleAccent: string; // page H1 accent (colored)
  seoTitle: string;
  seoDescription: string;
  intro: string;
  sections: ResourceSection[];
}

export const denagoResources: DenagoResource[] = [
  {
    slug: 'dealership',
    cardTitle: 'DENAGO Dealership',
    title: 'DENAGO',
    titleAccent: 'DEALERSHIP',
    seoTitle: 'Authorized DENAGO Golf Cart Dealership | 16 Locations',
    seoDescription:
      'Buy your Denago golf cart from an authorized dealership — transparent MSRP pricing, factory warranty registration, financing, trade-ins, and in-house service at 16 locations.',
    intro:
      'We are an authorized Denago EV dealership group with 16 showroom locations across ten states, offering the complete Denago lineup with transparent pricing and full factory support.',
    sections: [
      {
        heading: 'Why Buy From an Authorized Dealer',
        text: 'Every cart we sell includes pre-delivery inspection, factory warranty registration, and local service support. Marketplace and private-party purchases can\'t match that — and often void warranty coverage.',
      },
      {
        heading: 'Test Drive Before You Buy',
        text: 'Visit any of our 16 showrooms to sit in, drive, and compare Denago models side by side. Our staff will walk you through options, colors, and street-legal configurations for your area.',
      },
      {
        heading: 'Trade-Ins Welcome',
        text: 'Have an older gas or lead-acid cart? Ask about trade-in credit toward a new lithium-powered Denago.',
      },
    ],
  },
  {
    slug: 'service-center',
    cardTitle: 'DENAGO Service Center',
    title: 'DENAGO SERVICE',
    titleAccent: 'CENTER',
    seoTitle: 'DENAGO Golf Cart Service Center | Factory-Trained Technicians',
    seoDescription:
      'Factory-trained Denago golf cart service: maintenance, diagnostics, warranty repairs, tire and brake work, and software updates at 16 dealership locations.',
    intro:
      'Our factory-trained technicians keep your Denago running like new — from routine maintenance and diagnostics to warranty repairs and accessory installation.',
    sections: [
      {
        heading: 'Full-Service Maintenance',
        text: 'Brakes, tires, suspension, lighting, and controller diagnostics — all performed with genuine Denago parts and factory service procedures.',
      },
      {
        heading: 'Warranty Repairs',
        text: 'As an authorized dealer network, we process Denago warranty claims directly — no shipping your cart anywhere or fighting with a manufacturer hotline.',
      },
      {
        heading: 'Schedule Service',
        text: 'Call your nearest location to book a service appointment. Mobile and pickup options may be available depending on your area.',
      },
    ],
  },
  {
    slug: 'parts',
    cardTitle: 'DENAGO Parts',
    title: 'DENAGO',
    titleAccent: 'PARTS',
    seoTitle: 'Genuine DENAGO Golf Cart Parts & Replacement Parts',
    seoDescription:
      'Genuine Denago golf cart replacement parts — chargers, controllers, tires, wheels, brakes, lights, seats, and body panels — in stock through our dealership parts departments.',
    intro:
      'Keep your cart 100% Denago with genuine replacement parts, stocked and ordered through our dealership parts departments.',
    sections: [
      {
        heading: 'Genuine Replacement Parts',
        text: 'Chargers, controllers, motors, tires and wheels, brake components, lighting, seats, and body panels — factory parts that fit right and preserve your warranty.',
      },
      {
        heading: 'Fast Ordering',
        text: 'If we don\'t have your part on the shelf, we can order it directly from Denago EV and have it shipped to your closest location.',
      },
      {
        heading: 'Installation Available',
        text: 'Our service centers can install any part we sell — or hand it over the counter if you prefer to wrench yourself.',
      },
    ],
  },
  {
    slug: 'manuals',
    cardTitle: 'DENAGO Manuals',
    title: 'DENAGO',
    titleAccent: 'MANUALS',
    seoTitle: 'DENAGO Golf Cart Manuals | Owner\'s & Service Manuals',
    seoDescription:
      'Get the owner\'s manual for any Denago golf cart model — operation guides, battery care, charging instructions, maintenance schedules, and troubleshooting.',
    intro:
      'Owner\'s manuals for every Denago model — operation, battery care, charging, maintenance schedules, and troubleshooting — available through our dealerships.',
    sections: [
      {
        heading: 'Owner\'s Manuals',
        text: 'Operation guides covering controls, the 10.1-inch touchscreen, charging procedures, and safe driving practices for every current Denago model.',
      },
      {
        heading: 'Battery & Charging Guides',
        text: 'LiFePO4 lithium batteries are maintenance-free, but proper charging and storage habits maximize their 8-year-warranty lifespan. Our guides cover it all.',
      },
      {
        heading: 'Need a Copy?',
        text: 'Call or visit any location and we\'ll supply the manual for your model — including replacement copies for used carts.',
      },
    ],
  },
  {
    slug: 'warranty',
    cardTitle: 'DENAGO Warranty',
    title: 'DENAGO',
    titleAccent: 'WARRANTY',
    seoTitle: 'DENAGO Golf Cart Warranty | 8-Year Battery Warranty',
    seoDescription:
      'Denago golf cart warranty coverage explained — 8-year lithium battery warranty, factory component coverage, and how authorized-dealer registration protects your purchase.',
    intro:
      'Every new Denago sold through our dealerships is registered for full factory warranty coverage — including the industry-leading 8-year lithium battery warranty.',
    sections: [
      {
        heading: '8-Year Battery Warranty',
        text: 'Denago\'s LiFePO4 lithium battery packs are backed for 8 years — among the longest battery warranties in the golf cart industry.',
      },
      {
        heading: 'Factory Component Coverage',
        text: 'Motors, controllers, chargers, and structural components carry factory warranty terms. Ask our team for the current coverage schedule for your model.',
      },
      {
        heading: 'Registration Matters',
        text: 'Warranty coverage starts with proper registration at an authorized dealer. Buying from marketplaces or unauthorized resellers can leave you without coverage.',
      },
    ],
  },
  {
    slug: 'battery',
    cardTitle: 'DENAGO Battery',
    title: 'DENAGO',
    titleAccent: 'BATTERY',
    seoTitle: 'DENAGO Golf Cart Batteries | LiFePO4 Lithium Explained',
    seoDescription:
      'Everything about Denago golf cart batteries: LiFePO4 lithium chemistry, 40–70+ mile range, 8-hour charging, zero maintenance, and 8-year warranty coverage.',
    intro:
      'Denago carts run on lithium iron phosphate (LiFePO4) batteries — sealed, maintenance-free packs that deliver consistent power and last for thousands of cycles.',
    sections: [
      {
        heading: 'Range & Charging',
        text: 'Depending on model, expect 40 to 70+ miles per charge, with a full recharge in roughly 8 hours from a standard household outlet.',
      },
      {
        heading: 'Zero Maintenance',
        text: 'No watering, no acid, no corrosion, no memory effect. LiFePO4 packs hold steady voltage until empty, so performance doesn\'t fade as the charge drops.',
      },
      {
        heading: 'Replacement & Upgrades',
        text: 'Need a replacement pack or want to verify battery health? Our service centers test, service, and replace Denago batteries with genuine factory packs.',
      },
    ],
  },
  {
    slug: 'owners',
    cardTitle: 'DENAGO Owners',
    title: 'DENAGO',
    titleAccent: 'OWNERS',
    seoTitle: 'DENAGO Owners | Support, Care Tips & Owner Resources',
    seoDescription:
      'Resources for Denago golf cart owners: care and storage tips, charging best practices, accessory upgrades, service scheduling, and owner support from 16 dealership locations.',
    intro:
      'Already own a Denago? We support you long after the sale — with service, parts, accessories, and straight answers from people who know these carts inside out.',
    sections: [
      {
        heading: 'Care & Storage Tips',
        text: 'Store your cart plugged in or at partial charge per the manual, keep tires at spec, and rinse off salt and fertilizer — small habits that add years of life.',
      },
      {
        heading: 'Upgrades & Accessories',
        text: 'Enclosures, covers, cargo racks, lift kits, wheels, and audio upgrades — personalize your cart through our parts departments.',
      },
      {
        heading: 'Owner Support',
        text: 'Questions about your touchscreen, charger, or street-legal registration? Call any of our 16 locations and talk to a Denago specialist.',
      },
    ],
  },
  {
    slug: 'reviews',
    cardTitle: 'DENAGO Reviews',
    title: 'DENAGO',
    titleAccent: 'REVIEWS',
    seoTitle: 'DENAGO Golf Cart Reviews | What Owners Are Saying',
    seoDescription:
      'Denago golf cart reviews highlight lithium power, 8-year battery warranties, and standard tech like CarPlay touchscreens and backup cameras at prices below comparable brands.',
    intro:
      'Denago reviews consistently point to the same thing: more standard equipment and lithium power for thousands less than comparable brands.',
    sections: [
      {
        heading: 'What Reviewers Highlight',
        text: 'LiFePO4 lithium batteries with 8-year warranties, smooth 5kW–6.3kW AC motors, and standard 10.1-inch CarPlay touchscreens, backup cameras, and soundbars — features competitors sell as upgrades.',
      },
      {
        heading: 'Value for Money',
        text: 'With MSRPs from $8,995 to $16,500, Denago models undercut comparable lithium carts from legacy brands while including more equipment out of the box.',
      },
      {
        heading: 'Judge for Yourself',
        text: 'The best review is a test drive. Visit a showroom, drive the models back to back, and compare the spec sheets — we\'re confident in the comparison.',
      },
    ],
  },
  {
    slug: 'financing',
    cardTitle: 'DENAGO Financing',
    title: 'DENAGO',
    titleAccent: 'FINANCING',
    seoTitle: 'DENAGO Golf Cart Financing | Flexible Payment Options',
    seoDescription:
      'Finance your Denago golf cart with flexible payment options through our dealership network — quick applications, competitive rates, and trade-in credit toward your purchase.',
    intro:
      'Put a new Denago in your garage without paying all at once — our dealerships offer flexible financing options with quick approval.',
    sections: [
      {
        heading: 'Flexible Terms',
        text: 'Financing programs are available on all new Denago models, with terms structured to fit your budget. Applications take just minutes at any location.',
      },
      {
        heading: 'Trade-In Credit',
        text: 'Apply the value of your current cart toward your down payment and lower your monthly cost.',
      },
      {
        heading: 'Get Pre-Qualified',
        text: 'Call your nearest location to discuss current financing offers and get pre-qualified before you visit.',
      },
    ],
  },
];

export function getResourceBySlug(slug: string): DenagoResource | undefined {
  return denagoResources.find((r) => r.slug === slug);
}
