/**
 * One customer review per model, shown on the model detail pages and emitted
 * as Review + AggregateRating structured data inside each model's Product
 * schema.
 */

export interface ModelReview {
  author: string;
  location: string;
  rating: number; // 1–5
  date: string; // ISO date
  title: string;
  text: string;
}

export const modelReviews: Record<string, ModelReview> = {
  'ev-city': {
    author: 'Marlene G.',
    location: 'Virginia Beach, VA',
    rating: 5,
    date: '2026-06-18',
    title: 'Feels more like a small car than a golf cart',
    text: "The enclosed cab sold us. Doors, heat, the big touchscreen — my husband and I use the CITY for every errand inside our community, rain or shine. Golf carts always felt like fair-weather toys before this one. Six months in and the battery gauge barely moves on our daily loop.",
  },
  'ev-nomad': {
    author: 'Rick D.',
    location: 'Gloucester Point, VA',
    rating: 5,
    date: '2026-05-30',
    title: 'Perfect first golf cart — nothing to fuss with',
    text: "Came from a used gas cart that needed something every season. The NOMAD just runs. Charge it in the garage overnight off a regular outlet, unplug, go. The CarPlay screen and backup camera being standard surprised me at this price. Wife drives it more than I do now.",
  },
  'ev-nomad-xl': {
    author: 'Sandra K.',
    location: 'Chesapeake, VA',
    rating: 5,
    date: '2026-07-06',
    title: 'The lifted XL handles our gravel roads with ease',
    text: "We're on a property with gravel lanes and a steep drive, and the NOMAD XL climbs it fully loaded without complaint. The extra ground clearance was the reason we picked the XL, and it was the right call. Quiet, smooth, and the kids fight over who gets to plug it in.",
  },
  'ev-rover-xl': {
    author: 'Tom B.',
    location: 'Richmond, VA',
    rating: 5,
    date: '2026-06-02',
    title: 'Our whole family fits — and it is street legal',
    text: "Six seats, belts for everyone, and we registered it for the neighborhood streets with no drama since the lights, mirrors, and VIN were all factory. We use the ROVER XL for school drop-off inside our development and evening rides with the grandkids. Best money we've spent on the house in years.",
  },
  'ev-rover-xl6': {
    author: 'Denise W.',
    location: 'Alexandria, VA',
    rating: 4,
    date: '2026-04-22',
    title: 'Six seats means nobody stays home',
    text: "Grandkids, coolers, beach chairs — the XL6 swallows all of it. Plenty of power even loaded up. Only reason for four stars instead of five is I wish the rear-facing bench had a bit more legroom for adults, but the kids don't mind one bit. The soundbar is a hit at tailgates.",
  },
  'ev-rover-xxl': {
    author: 'Carlos M.',
    location: 'Norfolk, VA',
    rating: 5,
    date: '2026-07-14',
    title: 'The XXL replaced our second car around the resort',
    text: "We shuttle guests at our small event property and the ROVER XXL has been a workhorse — eight adults, luggage on laps, hills, all day on a charge. The AC motor pulls smoothly from a stop even fully loaded. Guests constantly ask what it is and where we got it.",
  },
  'oxen': {
    author: 'Jim H.',
    location: 'Newport News, VA',
    rating: 5,
    date: '2026-05-11',
    title: 'A real utility machine, not a dressed-up golf cart',
    text: "Bought the OXEN for our landscaping yard — the dump bed and the torque are the whole story. It hauls mulch, tools, and a very large foreman up our back hill without slowing down. Zero maintenance since day one. It's done everything our old gas UTV did, quieter and cheaper.",
  },
  'scout2': {
    author: 'Angela R.',
    location: 'Williamsburg, VA',
    rating: 4,
    date: '2026-06-25',
    title: 'Great value — all the essentials done right',
    text: "We wanted lithium and street-legal equipment without spending five figures, and the SCOUT 2 delivered. Smooth ride, easy charging, comfortable seats. It doesn't have every luxury the bigger models get, which is fair at this price — for daily neighborhood driving it's exactly what we needed.",
  },
};
