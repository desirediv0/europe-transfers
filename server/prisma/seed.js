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

  // Seed a package
  const pkg = await prisma.package.upsert({
    where: { slug: "rome-highlights" },
    update: {},
    create: {
      title: "Rome Highlights",
      slug: "rome-highlights",
      countryId: (await prisma.country.upsert({ where: { slug: "italy" }, update: {}, create: { name: "Italy", slug: "italy" } })).id,
      durationDays: 3,
      summary: "Explore the Eternal City's top attractions",
      priceFrom: 299,
      isActive: true,
    },
  });

  await prisma.itineraryDay.createMany({
    data: [
      { packageId: pkg.id, dayNumber: 1, title: "Colosseum & Roman Forum", description: "Visit the iconic Colosseum and ancient Roman Forum" },
      { packageId: pkg.id, dayNumber: 2, title: "Vatican City", description: "St. Peter's Basilica, Vatican Museums, Sistine Chapel" },
      { packageId: pkg.id, dayNumber: 3, title: "Trastevere & Departure", description: "Morning stroll through Trastevere, afternoon departure" },
    ],
    skipDuplicates: true,
  });
  console.log("Package seeded:", pkg.title);

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
