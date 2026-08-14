// First-person expert commentary for each Denago model, written from the
// perspective of a veteran golf cart dealer. Rendered on model detail pages.

export interface ExpertReview {
  intro: string[];
  strengths: string[]; // What it does and what it has
  useCases: string[]; // What you can do with it
  whyBuy: string[];
}

export const expertReviews: Record<string, ExpertReview> = {
  'ev-city': {
    intro: [
      "I've been around golf carts for a long time, and the DENAGO CITY is the cart I point to when someone tells me they want to actually drive on the road, not just around the neighborhood. This is a true street-legal NEV/LSV, built from the ground up for it — not a golf cart with lights bolted on after the fact.",      
      "At $16,500 it's the flagship of the lineup, and when I walk customers around one, they see why. Automotive-style seating, a full glass windshield, turn signals, mirrors, three-point seat belts — it feels closer to a small electric car than a fairway cart.",
    ],
    strengths: [
      'Factory street-legal LSV equipment: headlights, brake lights, turn signals, mirrors, horn, and DOT-rated seat belts',
      '25 mph top speed — the legal maximum for low-speed vehicles',
      '40–50 miles of range from a maintenance-free LiFePO4 lithium battery',
      'Automotive-grade fit and finish with a digital dash',
      'VIN-titled, so it can be registered and insured in states that allow LSVs',
    ],
    useCases: [
      'Commute on roads posted 35 mph or less where your state allows LSVs',
      'Run errands around town — groceries, school pickup, the post office',
      'Daily transportation in golf cart communities, beach towns, and retirement communities',
      'A legitimate second vehicle that costs pennies per mile to run',
    ],
    whyBuy: [
      "Here's my honest take: if you're going to use a cart on public roads, buy one engineered for it. Retrofitting a standard cart for street use gets expensive fast and often still falls short of state requirements. The CITY arrives ready for registration, and the lithium battery means you'll never water batteries or replace lead-acid packs every few years.",
    ],
  },
  'ev-nomad': {
    intro: [
      "If I had to pick one cart that fits the most people, it's the DENAGO NOMAD. Four seats, a lifted all-terrain stance, and a $9,995 price point — this is the cart I sell most often, and it's the one I recommend when a family asks me where to start.",
    ],
    strengths: [
      'Lifted suspension and all-terrain tires that handle gravel, grass, and trails',
      'Seating for 4 with a fold-down rear seat that converts to a flat cargo deck',
      '45 miles of range and a 25 mph top speed',
      'LiFePO4 lithium battery — no watering, no acid, no maintenance',
      'LED light package and a digital display',
    ],
    useCases: [
      'Family cruising around the neighborhood, campground, or lake house',
      'Off-pavement property work where a standard cart would struggle',
      'Beach towns and mountain communities with rough or hilly terrain',
      'Tailgates, trail rides, and weekend trips with the rear seat folded flat for gear',
    ],
    whyBuy: [
      "For under ten grand you get lithium power, a real lift, and four seats. I've watched customers cross-shop this against carts costing thousands more and walk away with the NOMAD. It's the best value-per-dollar cart in the lineup, and the resale demand for used ones tells you everything.",
    ],
  },
  'ev-nomad-xl': {
    intro: [
      "The NOMAD XL is what I hand people who love everything about the NOMAD but ask me for more room. Same $9,995 starting price, same lifted all-terrain attitude — with a stretched platform that gives your rear passengers actual legroom.",
    ],
    strengths: [
      'Extended XL platform with noticeably more cabin and cargo space',
      'Lifted suspension, all-terrain tires, and enhanced ground clearance',
      '4-passenger seating with 45 miles of range and 25 mph top speed',
      'Maintenance-free LiFePO4 lithium battery with regenerative braking',
      'Rugged construction that shrugs off daily outdoor use',
    ],
    useCases: [
      'Carry four adults comfortably — not four adults and two sets of squished knees',
      'Haul coolers, chairs, and gear to the beach, game, or campsite',
      'Navigate rutted lanes, grass, and gravel around larger properties',
      'All-day neighborhood and community driving on a single charge',
    ],
    whyBuy: [
      "Stretched carts usually carry a price premium. The NOMAD XL doesn't — you get the extra room for the same money as the standard NOMAD. If rear-seat passengers are part of your regular routine, this is the smarter buy, plain and simple.",
    ],
  },
  'ev-rover-xl': {
    intro: [
      "Six seats for $10,995 is the headline, but what I appreciate about the DENAGO ROVER XL after years in this business is how well it drives fully loaded. Plenty of six-passenger carts feel gutless with a full cabin — this one doesn't.",
    ],
    strengths: [
      'True 6-passenger seating with a fold-down rear seat for cargo flexibility',
      '45 miles of lithium-powered range at up to 25 mph',
      'Strong AC motor that maintains speed on hills even when loaded',
      'LiFePO4 lithium battery — zero maintenance, 8-year warranty coverage',
      'Full LED lighting and modern digital instrumentation',
    ],
    useCases: [
      'Move the whole family — grandparents and grandkids included — in one trip',
      'Shuttle guests at events, rentals, or large properties',
      'Neighborhood cruising where four seats never seem to be enough',
      'Fold the back seat flat and it doubles as a cargo hauler',
    ],
    whyBuy: [
      "Families outgrow four-seat carts faster than they expect. Buying six seats up front costs less than trading up two years later — and at $10,995 the ROVER XL is one of the most affordable lithium six-seaters you'll find anywhere.",
    ],
  },
  'ev-rover-xl6': {
    intro: [
      "The ROVER XL6 is the six-seater for people who want presence. It takes everything the ROVER XL does and adds a lifted stance, bigger tires, and a more aggressive look. When one rolls off the trailer, people stop and ask about it — I see it every delivery.",
    ],
    strengths: [
      'Lifted suspension with larger all-terrain tires for a commanding stance',
      'Six full seats with 45 miles of range and 25 mph top speed',
      'LiFePO4 lithium battery backed by an 8-year warranty',
      'Premium trim, LED lighting, and digital display',
      'Extra ground clearance for grass, gravel, and uneven terrain',
    ],
    useCases: [
      'Six-passenger family duty on rough or unpaved neighborhood roads',
      'Beach, lake, and mountain communities where clearance matters',
      'Event and property shuttling with a look that impresses guests',
      'Weekend adventures where a standard-height cart would bottom out',
    ],
    whyBuy: [
      "For $2,000 over the standard ROVER XL you get the lift, the tires, and the road presence — the three upgrades customers most often pay aftermarket shops far more to add later. If you're going to want the lifted look eventually, buy it built that way from the factory.",
    ],
  },
  'ev-rover-xxl': {
    intro: [
      "Eight seats. When somebody needs to move the most people, the DENAGO ROVER XXL is the answer, and honestly there isn't much competition at its $12,995 starting price. Most eight-passenger carts I've quoted from other brands run thousands more.",
    ],
    strengths: [
      'Seating for 8 passengers — the largest capacity in the Denago lineup',
      '45 miles of range with a 25 mph top speed, even loaded',
      'High-torque AC motor built for full-cabin duty',
      'Maintenance-free LiFePO4 lithium battery with 8-year warranty',
      'Fold-down rear seating for a huge flat cargo area when you need it',
    ],
    useCases: [
      'Big families and multi-generation households — everyone rides, nobody waits',
      'Resort, rental, campground, and venue guest shuttling',
      'Church, school, and business campus transport',
      'Group outings where two smaller carts would otherwise be required',
    ],
    whyBuy: [
      "Do the math against buying two four-seaters: one XXL costs less to buy, less to charge, less to maintain, and keeps your whole group together. For commercial operators, one driver moving eight guests is an operating-cost win every single day.",
    ],
  },
  oxen: {
    intro: [
      "The DENAGO OXEN is the workhorse of the lineup, and I mean that literally — it's the cart I recommend to property owners, farmers, and facility managers who need to move material, not just people. With 70+ miles of range, it out-distances everything else Denago builds.",
    ],
    strengths: [
      'Heavy-duty electric dump bed for dirt, mulch, feed, firewood, and tools',
      'Class-leading 70+ miles of range from a large LiFePO4 lithium pack',
      '15 mph governed top speed, tuned for work-site control and torque',
      'Rugged utility chassis built for daily commercial abuse',
      'Silent, fume-free operation — safe to run inside barns and buildings',
    ],
    useCases: [
      'Property and land maintenance — hauling, dumping, towing day after day',
      'Farm, nursery, and ranch chores without gas cans or oil changes',
      'Facility, campground, and grounds-crew operations',
      'Indoor/outdoor work where a gas UTV\'s fumes and noise are a problem',
    ],
    whyBuy: [
      "Compare the OXEN's $12,995 price to a gas UTV and then add up what you'll never spend: no fuel, no oil changes, no spark plugs, no winter carburetor headaches. The 70-mile range means even the biggest property gets covered on one charge, and the lithium pack is warrantied for 8 years.",
    ],
  },
  scout2: {
    intro: [
      "At $8,995, the DENAGO SCOUT 2 is the most affordable way into a lithium-powered cart that I can put my name behind. Plenty of carts exist at this price — almost none of them come with a LiFePO4 battery, and that single difference changes the entire ownership experience.",
    ],
    strengths: [
      'LiFePO4 lithium battery at an entry-level price — genuinely rare',
      '40+ miles of range and a 25 mph top speed',
      'Compact 2-passenger footprint that fits tight garages and trailers',
      'Digital display, LED lighting, and modern styling',
      'Light, nimble handling that new cart owners pick up in minutes',
    ],
    useCases: [
      'Golf rounds and course use with range for multiple 18-hole days',
      'Couples cruising the neighborhood or community',
      'A simple runabout for smaller properties and garages',
      'First-time cart ownership without a five-figure commitment',
    ],
    whyBuy: [
      "The trap at this end of the market is the used lead-acid cart that needs a $1,500+ battery pack two summers in. The SCOUT 2 skips that cycle entirely — new cart, new warranty, lithium battery covered for 8 years. For under nine grand, that's the safest money in the lineup.",
    ],
  },
};
