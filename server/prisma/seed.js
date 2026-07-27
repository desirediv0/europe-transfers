import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed admin
  const email = "admin@europetransfers.com";
  const password = "Admin@123";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.admin.create({
      data: {
        name: "Super Admin",
        email,
        passwordHash,
        role: "SUPER_ADMIN",
      },
    });
    console.log("Admin created:", admin.email);
  }

  // Seed Locations
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { id: "loc-rome-fco" },
      update: {},
      create: { id: "loc-rome-fco", name: "Rome Fiumicino Airport (FCO)", city: "Rome", latitude: 41.8003, longitude: 12.2389 },
    }),
    prisma.location.upsert({
      where: { id: "loc-rome-city" },
      update: {},
      create: { id: "loc-rome-city", name: "Rome City Center", city: "Rome", latitude: 41.9028, longitude: 12.4964 },
    }),
    prisma.location.upsert({
      where: { id: "loc-milan-mxp" },
      update: {},
      create: { id: "loc-milan-mxp", name: "Milan Malpensa Airport (MXP)", city: "Milan", latitude: 45.6306, longitude: 8.7281 },
    }),
    prisma.location.upsert({
      where: { id: "loc-milan-city" },
      update: {},
      create: { id: "loc-milan-city", name: "Milan City Center", city: "Milan", latitude: 45.4642, longitude: 9.19 },
    }),
    prisma.location.upsert({
      where: { id: "loc-paris-cdg" },
      update: {},
      create: { id: "loc-paris-cdg", name: "Paris Charles de Gaulle (CDG)", city: "Paris", latitude: 49.0097, longitude: 2.5479 },
    }),
    prisma.location.upsert({
      where: { id: "loc-paris-city" },
      update: {},
      create: { id: "loc-paris-city", name: "Paris City Center", city: "Paris", latitude: 48.8566, longitude: 2.3522 },
    }),
  ]);
  console.log("Locations seeded:", locations.length);

  // Seed Car Types
  const sedan = await prisma.carType.upsert({
    where: { id: "ct-sedan" },
    update: {},
    create: { id: "ct-sedan", name: "Sedan", seats: 3, isAC: true },
  });
  const minivan = await prisma.carType.upsert({
    where: { id: "ct-minivan" },
    update: {},
    create: { id: "ct-minivan", name: "Minivan", seats: 7, isAC: true },
  });
  const coach = await prisma.carType.upsert({
    where: { id: "ct-coach" },
    update: {},
    create: { id: "ct-coach", name: "Luxury Coach", seats: 16, isAC: true },
  });
  console.log("Car types seeded:", 3);

  // Seed Routes (From -> To)
  const romeFco = locations[0];
  const romeCity = locations[1];
  const milanMxp = locations[2];
  const milanCity = locations[3];
  const parisCdg = locations[4];
  const parisCity = locations[5];

  const routes = await Promise.all([
    // Rome routes
    prisma.route.upsert({
      where: { fromLocationId_toLocationId: { fromLocationId: romeFco.id, toLocationId: romeCity.id } },
      update: {},
      create: { fromLocationId: romeFco.id, toLocationId: romeCity.id },
    }),
    prisma.route.upsert({
      where: { fromLocationId_toLocationId: { fromLocationId: romeCity.id, toLocationId: romeFco.id } },
      update: {},
      create: { fromLocationId: romeCity.id, toLocationId: romeFco.id },
    }),
    // Milan routes
    prisma.route.upsert({
      where: { fromLocationId_toLocationId: { fromLocationId: milanMxp.id, toLocationId: milanCity.id } },
      update: {},
      create: { fromLocationId: milanMxp.id, toLocationId: milanCity.id },
    }),
    // Paris routes
    prisma.route.upsert({
      where: { fromLocationId_toLocationId: { fromLocationId: parisCdg.id, toLocationId: parisCity.id } },
      update: {},
      create: { fromLocationId: parisCdg.id, toLocationId: parisCity.id },
    }),
    // Inter-city routes
    prisma.route.upsert({
      where: { fromLocationId_toLocationId: { fromLocationId: milanCity.id, toLocationId: parisCity.id } },
      update: {},
      create: { fromLocationId: milanCity.id, toLocationId: parisCity.id },
    }),
    prisma.route.upsert({
      where: { fromLocationId_toLocationId: { fromLocationId: parisCity.id, toLocationId: milanCity.id } },
      update: {},
      create: { fromLocationId: parisCity.id, toLocationId: milanCity.id },
    }),
    prisma.route.upsert({
      where: { fromLocationId_toLocationId: { fromLocationId: romeFco.id, toLocationId: milanCity.id } },
      update: {},
      create: { fromLocationId: romeFco.id, toLocationId: milanCity.id },
    }),
    prisma.route.upsert({
      where: { fromLocationId_toLocationId: { fromLocationId: milanCity.id, toLocationId: romeFco.id } },
      update: {},
      create: { fromLocationId: milanCity.id, toLocationId: romeFco.id },
    }),
    prisma.route.upsert({
      where: { fromLocationId_toLocationId: { fromLocationId: romeFco.id, toLocationId: parisCity.id } },
      update: {},
      create: { fromLocationId: romeFco.id, toLocationId: parisCity.id },
    }),
    prisma.route.upsert({
      where: { fromLocationId_toLocationId: { fromLocationId: parisCity.id, toLocationId: romeFco.id } },
      update: {},
      create: { fromLocationId: parisCity.id, toLocationId: romeFco.id },
    }),
  ]);
  console.log("Routes seeded:", routes.length);

  // Seed Route Prices (Route x CarType -> price)
  const priceData = [];
  for (const route of routes) {
    priceData.push(
      { routeId: route.id, carTypeId: sedan.id, price: 45, currency: "EUR" },
      { routeId: route.id, carTypeId: minivan.id, price: 65, currency: "EUR" },
      { routeId: route.id, carTypeId: coach.id, price: 120, currency: "EUR" },
    );
  }
  await prisma.routePrice.createMany({ data: priceData, skipDuplicates: true });
  console.log("Route prices seeded:", priceData.length);

  // Delete old packages & itineraries to avoid stale entries
  await prisma.itineraryDay.deleteMany({});
  await prisma.package.deleteMany({});

  // Seed 5 Real Luxury Tour Packages with High Quality Unsplash Images
  const italyCountry = await prisma.country.upsert({ where: { slug: "italy" }, update: {}, create: { name: "Italy", slug: "italy" } });
  const franceCountry = await prisma.country.upsert({ where: { slug: "france" }, update: {}, create: { name: "France", slug: "france" } });
  const switzerlandCountry = await prisma.country.upsert({ where: { slug: "switzerland" }, update: {}, create: { name: "Switzerland", slug: "switzerland" } });
  const spainCountry = await prisma.country.upsert({ where: { slug: "spain" }, update: {}, create: { name: "Spain", slug: "spain" } });

  const packagesData = [
    {
      title: "Rome & Vatican Eternal Journey",
      slug: "rome-vatican-eternal-journey",
      countryId: italyCountry.id,
      durationDays: 3,
      summary: "Explore the Colosseum, Sistine Chapel, and authentic Trastevere cuisine in uncompromised luxury.",
      priceFrom: 349,
      coverImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop",
      isActive: true,
      itineraries: [
        { dayNumber: 1, title: "Imperial Rome & Colosseum VIP", description: "Private luxury transfer to the Colosseum, Roman Forum, and Palatine Hill with skip-the-line access." },
        { dayNumber: 2, title: "Vatican Museums & Sistine Chapel", description: "Guided private tour of Vatican treasures, St. Peter's Basilica, and Piazza Navona." },
        { dayNumber: 3, title: "Trastevere & Scenic Departure", description: "Morning stroll in Trastevere, wine tasting, followed by private airport transfer." },
      ],
    },
    {
      title: "Amalfi Coast & Positano Escaped Tour",
      slug: "amalfi-coast-positano-escaped",
      countryId: italyCountry.id,
      durationDays: 4,
      summary: "Breathtaking coastal drives, Ravello cliffside gardens, and crystal-clear Mediterranean sea views.",
      priceFrom: 599,
      coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000&auto=format&fit=crop",
      isActive: true,
      itineraries: [
        { dayNumber: 1, title: "Naples to Sorrento Chauffeur Drive", description: "Panoramic coast drive along the Bay of Naples to Sorrento luxury hotel." },
        { dayNumber: 2, title: "Positano Cliffside & Private Boat", description: "Explore pastel houses in Positano and private yacht tour along Capri grottoes." },
        { dayNumber: 3, title: "Ravello Gardens & Historic Villas", description: "Visit Villa Cimbrone's infinity terrace and Ravello cathedral square." },
        { dayNumber: 4, title: "Pompeii Ruins & Departure", description: "Private guided tour of ancient Pompeii ruins before luxury transfer to airport." },
      ],
    },
    {
      title: "Paris Lights & Riviera Luxury Express",
      slug: "paris-lights-riviera-luxury",
      countryId: franceCountry.id,
      durationDays: 5,
      summary: "Eiffel Tower VIP access, Louvre masterpieces, and private chauffeur transfers across the French Riviera.",
      priceFrom: 799,
      coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop",
      isActive: true,
      itineraries: [
        { dayNumber: 1, title: "Parisian Arrival & Seine Cruise", description: "Private airport transfer, hotel check-in, and sunset Champagne cruise on the River Seine." },
        { dayNumber: 2, title: "Louvre Museum & Champs-Élysées", description: "Private art expert tour of Louvre, Arc de Triomphe, and luxury shopping." },
        { dayNumber: 3, title: "Palace of Versailles Private Tour", description: "Chauffeured journey to Versailles, Hall of Mirrors, and Royal Gardens." },
        { dayNumber: 4, title: "Nice & Cannes Promenade VIP", description: "Fly to Nice with private V-Class Mercedes transfer to Cannes Boulevard de la Croisette." },
        { dayNumber: 5, title: "Monaco & Monte Carlo Casino", description: "Scenic Grand Prix road drive to Monaco, Palace Square, and Monte Carlo nightlife." },
      ],
    },
    {
      title: "Swiss Alpine Wonders & Glacier Tour",
      slug: "swiss-alpine-wonders-glacier",
      countryId: switzerlandCountry.id,
      durationDays: 4,
      summary: "Zurich lakefront, Interlaken mountain passes, and spectacular Matterhorn vistas in Zermatt.",
      priceFrom: 899,
      coverImage: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1000&auto=format&fit=crop",
      isActive: true,
      itineraries: [
        { dayNumber: 1, title: "Zurich Old Town & Lake Chauffeur", description: "Private pickup from Zurich airport, Bahnofstrasse luxury walk, and lakeside dining." },
        { dayNumber: 2, title: "Interlaken & Grindelwald First", description: "Alpine drive through Lauterbrunnen waterfalls to Interlaken mountain valley." },
        { dayNumber: 3, title: "Zermatt & Matterhorn Viewpoint", description: "Gornergrat cogwheel train, Matterhorn glacier paradise, and alpine village stroll." },
        { dayNumber: 4, title: "Lucerne Chapel Bridge & Departure", description: "Panoramic drive to Lucerne, Lake Lucerne cruise, and airport drop-off." },
      ],
    },
    {
      title: "Barcelona & Catalonia Heritage Safari",
      slug: "barcelona-catalonia-heritage",
      countryId: spainCountry.id,
      durationDays: 3,
      summary: "Gaudí's Sagrada Família, Gothic Quarter tapas, and scenic Montserrat monastery drives.",
      priceFrom: 449,
      coverImage: "https://images.unsplash.com/photo-1583422409516-2895a771deda?q=80&w=1000&auto=format&fit=crop",
      isActive: true,
      itineraries: [
        { dayNumber: 1, title: "Gaudí Masterpieces & Park Güell", description: "VIP private tour of Sagrada Família, Casa Batlló, and panoramic Park Güell." },
        { dayNumber: 2, title: "Gothic Quarter & Gourmet Tapas", description: "Historic walking tour through El Born, La Boqueria market, and Michelin tapas experience." },
        { dayNumber: 3, title: "Montserrat Monastery & Coastal Drop", description: "Chauffeured mountain journey to Montserrat Abbey and private transfer to El Prat airport." },
      ],
    },
  ];

  for (const item of packagesData) {
    const { itineraries, ...pkgFields } = item;
    const createdPkg = await prisma.package.create({
      data: pkgFields,
    });
    if (itineraries && itineraries.length > 0) {
      await prisma.itineraryDay.createMany({
        data: itineraries.map(it => ({ ...it, packageId: createdPkg.id })),
      });
    }
    console.log("Package created:", createdPkg.title);
  }

  // Seed testimonials
  const testimonialsExist = await prisma.testimonial.count();
  if (testimonialsExist === 0) {
    await prisma.testimonial.createMany({
      data: [
        { name: "Sarah M.", rating: 5, message: "Amazing service! The driver was punctual and the car was spotless.", isPublished: true },
        { name: "James K.", rating: 5, message: "Best transfer service we've used in Europe. Highly recommended!", isPublished: true },
        { name: "Maria L.", rating: 4, message: "Great experience overall. Very professional driver.", isPublished: true },
      ],
    });
    console.log("Testimonials seeded");
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
