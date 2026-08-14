export interface VehicleModel {
  slug: string;
  name: string;
  series: string;
  tagline: string;
  description: string;
  price: string;
  priceNumber: number;
  seats: string;
  range: string;
  topSpeed: string;
  driveType: string;
  image: string;
  gallery?: string[];
  /** Custom URL path; defaults to /denago/{slug} */
  path?: string;
  features: string[];
  specs: { label: string; value: string }[];
  category: string;
}

export const DEALERSHIP = {
  name: "DENAGO Dealership",
  legalName: "DENAGO Dealership",
  domain: "https://denagodealership.com",
  phone: "+1-844-336-2461",
  phoneDisplay: "(844) 336-2461",
  brand: "DENAGO EV",
};

/** Single source of truth for the headquarters address & contact info. */
export const HEADQUARTERS = {
  street: "2333 Bethlehem Pike",
  city: "Hatfield",
  state: "PA",
  zip: "19440",
  country: "United States",
  countryCode: "US",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=2333+Bethlehem+Pike,+Hatfield,+PA+19440",
  phone: DEALERSHIP.phone,
  phoneDisplay: DEALERSHIP.phoneDisplay,
  email: "sales@denagodealership.com",
};

export const denagoModels: VehicleModel[] = [
  {
    slug: "ev-city",
    name: "DENAGO CITY",
    series: "CITY",
    tagline: "Urban mobility redefined.",
    description:
      "The DENAGO CITY is a street-legal Neighborhood Electric Vehicle built for city transportation, campuses, and neighborhood use. Featuring a sleek design, efficient battery system, and all required DOT safety equipment, it's the ideal urban companion.",
    price: "$16,500",
    priceNumber: 16500,
    seats: "2",
    range: "40–50 miles",
    topSpeed: "25 mph",
    driveType: "2x4",
    image: "/assets/denago/denago-ev-city.jpg",
    category: "Street Legal / NEV",
    features: [
      "Street Legal NEV Certified",
      "LED Lighting Package",
      "Premium Interior Design",
      "Urban Mobility Optimized",
      "Efficient Battery System",
      "Sleek Modern Styling",
      "Digital Display",
      "DOT-Approved Safety Equipment",
    ],
    specs: [
      { label: "Top Speed", value: "25 mph" },
      { label: "Range", value: "40–50 miles" },
      { label: "Seating", value: "2 Passengers" },
      { label: "Motor", value: "AC Electric Motor" },
      { label: "Battery", value: "Lithium Ion" },
      { label: "Charging", value: "6–8 hours (110V)" },
      { label: "Length", value: "142 inches" },
      { label: "Width", value: "58 inches" },
      { label: "Height", value: "74 inches" },
      { label: "Payload", value: "900 lbs" },
    ],
  },
  {
    slug: "ev-nomad",
    name: "DENAGO NOMAD",
    series: "NOMAD",
    tagline: "Adventure-ready for any terrain.",
    description:
      "The DENAGO NOMAD is built for exploration. With all-terrain tires, lifted suspension, and enhanced ground clearance, this electric vehicle combines rugged durability with clean electric efficiency — perfect for off-road adventures.",
    price: "$9,995",
    priceNumber: 9995,
    seats: "4",
    range: "45 miles",
    topSpeed: "25 mph",
    driveType: "2x4",
    image: "/assets/denago/denago-ev-nomad.jpg",
    category: "Off-Road / Adventure",
    features: [
      "All-Terrain Tires",
      "Lifted Suspension",
      "Adventure Package",
      "Enhanced Ground Clearance",
      "Rugged Construction",
      "Off-Road Capabilities",
      "Durable Frame",
      "Weather Protection",
    ],
    specs: [
      { label: "Top Speed", value: "25 mph" },
      { label: "Range", value: "45 miles" },
      { label: "Seating", value: "4 Passengers" },
      { label: "Motor", value: "AC Electric Motor" },
      { label: "Battery", value: "Lithium Ion" },
      { label: "Charging", value: "6–8 hours (110V)" },
      { label: "Drive Type", value: "2x4" },
      { label: "Tires", value: "All-Terrain" },
    ],
  },
  {
    slug: "ev-nomad-xl",
    name: "DENAGO NOMAD XL",
    series: "NOMAD XL",
    tagline: "More room. More adventure.",
    description:
      "The DENAGO NOMAD XL expands on the NOMAD platform with extended seating and cargo versatility while keeping the same rugged, adventure-ready DNA — all-terrain capability with clean, quiet electric power.",
    price: "$9,995",
    priceNumber: 9995,
    seats: "4",
    range: "45 miles",
    topSpeed: "25 mph",
    driveType: "2x4",
    image: "/assets/denago/denago-ev-nomad-xl.jpg",
    category: "Off-Road / Adventure",
    features: [
      "Extended XL Platform",
      "All-Terrain Tires",
      "Lifted Suspension",
      "Enhanced Ground Clearance",
      "Rugged Construction",
      "Flip-Down Rear Seat",
      "LED Lighting Package",
      "Weather Protection",
    ],
    specs: [
      { label: "Top Speed", value: "25 mph" },
      { label: "Range", value: "45 miles" },
      { label: "Seating", value: "4 Passengers" },
      { label: "Motor", value: "AC Electric Motor" },
      { label: "Battery", value: "Lithium Ion" },
      { label: "Charging", value: "6–8 hours (110V)" },
      { label: "Drive Type", value: "2x4" },
      { label: "Tires", value: "All-Terrain" },
    ],
  },
  {
    slug: "ev-rover-xl",
    name: "DENAGO ROVER XL",
    series: "ROVER XL",
    tagline: "Room for the whole crew.",
    description:
      "The DENAGO ROVER XL delivers six-passenger comfort in a street-capable electric vehicle. Ideal for families, resorts, and communities that need more seating without sacrificing style or capability.",
    price: "$10,995",
    priceNumber: 10995,
    seats: "6",
    range: "45 miles",
    topSpeed: "25 mph",
    driveType: "2x4",
    image: "/assets/denago/denago-ev-rover-xl.jpg",
    category: "Multi-Passenger",
    features: [
      "6-Passenger Seating",
      "Premium Comfort Seats",
      "LED Lighting Package",
      "Digital Display",
      "Lithium Ion Battery",
      "Flip-Down Rear Seat",
      "Modern Styling",
      "Smooth Ride Suspension",
    ],
    specs: [
      { label: "Top Speed", value: "25 mph" },
      { label: "Range", value: "45 miles" },
      { label: "Seating", value: "6 Passengers" },
      { label: "Motor", value: "AC Electric Motor" },
      { label: "Battery", value: "Lithium Ion" },
      { label: "Charging", value: "6–8 hours (110V)" },
      { label: "Drive Type", value: "2x4" },
    ],
  },
  {
    slug: "ev-rover-xl6",
    name: "DENAGO ROVER XL6",
    series: "ROVER XL6",
    tagline: "Six seats, elevated.",
    description:
      "The DENAGO ROVER XL6 takes six-passenger electric transport to the next level with upgraded trim, enhanced comfort, and refined styling — the premium choice for larger groups.",
    price: "$12,995",
    priceNumber: 12995,
    seats: "6",
    range: "45 miles",
    topSpeed: "25 mph",
    driveType: "2x4",
    image: "/assets/denago/denago-ev-rover-xl6.jpg",
    category: "Multi-Passenger",
    features: [
      "6-Passenger Seating",
      "Premium Trim Package",
      "Upgraded Comfort Seats",
      "LED Lighting Package",
      "Digital Display",
      "Lithium Ion Battery",
      "Refined Styling",
      "Smooth Ride Suspension",
    ],
    specs: [
      { label: "Top Speed", value: "25 mph" },
      { label: "Range", value: "45 miles" },
      { label: "Seating", value: "6 Passengers" },
      { label: "Motor", value: "AC Electric Motor" },
      { label: "Battery", value: "Lithium Ion" },
      { label: "Charging", value: "6–8 hours (110V)" },
      { label: "Drive Type", value: "2x4" },
    ],
  },
  {
    slug: "ev-rover-xxl",
    name: "DENAGO ROVER XXL",
    series: "ROVER XXL",
    tagline: "Maximum capacity, maximum capability.",
    description:
      "The DENAGO ROVER XXL is the flagship people-mover of the lineup with eight-passenger seating — perfect for resorts, event venues, large families, and commercial transport applications.",
    price: "$12,995",
    priceNumber: 12995,
    seats: "8",
    range: "45 miles",
    topSpeed: "25 mph",
    driveType: "2x4",
    image: "/assets/denago/denago-ev-rover-xxl.jpg",
    category: "Multi-Passenger",
    features: [
      "8-Passenger Seating",
      "Extended XXL Platform",
      "Premium Comfort Seats",
      "LED Lighting Package",
      "Digital Display",
      "Lithium Ion Battery",
      "Flip-Down Rear Seat",
      "Heavy-Duty Suspension",
    ],
    specs: [
      { label: "Top Speed", value: "25 mph" },
      { label: "Range", value: "45 miles" },
      { label: "Seating", value: "8 Passengers" },
      { label: "Motor", value: "AC Electric Motor" },
      { label: "Battery", value: "Lithium Ion" },
      { label: "Charging", value: "6–8 hours (110V)" },
      { label: "Drive Type", value: "2x4" },
    ],
  },
  {
    slug: "oxen",
    path: "/oxen",
    name: "DENAGO OXEN",
    series: "OXEN",
    tagline: "Haul more. Work smarter.",
    description:
      "The 2026 Denago EV Oxen is a lithium-powered electric utility cart built for real work. With a heavy-duty rear dump bed, powerful electric drivetrain, advanced LiFePO₄ battery system, durable steel front bumper, and a lifted stance with independent suspension, the Oxen is ideal for property management, resorts, farms, and job sites.",
    price: "$12,995",
    priceNumber: 12995,
    seats: "2",
    range: "70+ miles",
    topSpeed: "15 mph",
    driveType: "2x4",
    image: "/assets/denago/denago-ev-oxen.jpg",
    gallery: [
      "/assets/denago/denago-ev-oxen.jpg",
      "/assets/denago/denago-ev-oxen-2.jpg",
      "/assets/denago/denago-ev-oxen-3.jpg",
      "/assets/denago/denago-ev-oxen-4.jpg",
    ],
    category: "Utility / Work",
    features: [
      "Dump Bed",
      "Powerful Electric Drivetrain",
      "Advanced Lithium Battery System",
      "Heavy-Duty Rear Utility Cargo Bed",
      "Durable Steel Front Bumper",
      "Comfortable Seating & Ergonomic Controls",
      "LED Lighting Package",
      "Low-Maintenance Electric Operation",
    ],
    specs: [
      { label: "Year", value: "2026" },
      { label: "Make / Model", value: "Denago Oxen" },
      { label: "Motor", value: "5 kW / 6.3 kW AC Motor" },
      { label: "Battery", value: "LiFePO₄ 51.2V / 205Ah" },
      { label: "Range", value: "70+ Miles" },
      { label: "Charge Time", value: "8 Hours" },
      { label: "Top Speed", value: "15 mph" },
      { label: "Seating", value: "2 Passengers" },
      { label: "Brakes", value: "4-Wheel Disc" },
      { label: "Suspension", value: "Independent Front & Rear" },
      { label: "Lifted", value: "Yes" },
      { label: "Power Type", value: "Lithium-Ion" },
      { label: "Street Legal", value: "No" },
    ],
  },
  {
    slug: "scout2",
    path: "/scout2",
    name: "DENAGO SCOUT 2",
    series: "SCOUT 2",
    tagline: "Premium lithium performance. Unmatched value.",
    description:
      "The 2026 Denago EV Scout 2 is built to handle daily drives with confidence and style. This 2-passenger lithium golf cart delivers a smooth, responsive ride with modern styling and dependable power. Equipped with advanced LiFePO₄ lithium technology and designed for comfort, storage, and convenience, the Scout 2 blends functionality and value for use in your neighborhood, at the golf course, and everything in between.",
    price: "$8,995",
    priceNumber: 8995,
    seats: "2",
    range: "40+ miles",
    topSpeed: "25 mph",
    driveType: "2x4",
    image: "/assets/denago/denago-ev-scout-2.png",
    gallery: [
      "/assets/denago/denago-ev-scout-2.png",
      "/assets/denago/denago-ev-scout-2-2.png",
      "/assets/denago/denago-ev-scout-2-3.png",
    ],
    category: "Golf / Neighborhood",
    features: [
      "LiFePO₄ Lithium Battery – 8-Year Warranty",
      "6.3kW AC Electric Motor",
      "4-Wheel Electromagnetic Disc Brakes",
      "LED Headlights & Taillights",
      "Premium 2-Passenger Seating",
      "On-Board Lithium Charger",
      "Golf Bag Holder w/ Storage Basket",
      "Integrated Turn Signals & Seatbelt Kit",
      "Molded Roof & Clear Folding Windshield",
      "Front Brush Guard",
      "Side & Rear View Mirrors",
      "USB and USB-C Charging Ports",
    ],
    specs: [
      { label: "Condition", value: "New" },
      { label: "Year", value: "2026" },
      { label: "Make / Model", value: "Denago EV Scout 2" },
      { label: "Vehicle Type", value: "Golf Cart" },
      { label: "Category", value: "2 Passenger – Lithium" },
      { label: "Fuel Type", value: "Electric" },
      { label: "Motor", value: "6.3kW AC Electric Motor" },
      { label: "Battery", value: "LiFePO₄ Lithium" },
      { label: "Brakes", value: "4-Wheel Electromagnetic Disc" },
      { label: "Charger", value: "On-Board Lithium Charger" },
      { label: "Battery Warranty", value: "8 Years" },
    ],
  },
];

export function getModelBySlug(slug: string): VehicleModel | undefined {
  return denagoModels.find((m) => m.slug === slug);
}

/** Site-relative URL path for a model's product page. */
export function getModelPath(model: VehicleModel): string {
  return model.path ?? `/denago/${model.slug}`;
}
