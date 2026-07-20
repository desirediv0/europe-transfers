import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed countries
  const countries = await Promise.all([
    prisma.country.upsert({ where: { slug: "italy" }, update: {}, create: { name: "Italy", slug: "italy" } }),
    prisma.country.upsert({ where: { slug: "france" }, update: {}, create: { name: "France", slug: "france" } }),
    prisma.country.upsert({ where: { slug: "spain" }, update: {}, create: { name: "Spain", slug: "spain" } }),
  ]);
  console.log("Countries seeded:", countries.length);

  // Seed cities with real lat/lng
  const cities = await Promise.all([
    prisma.city.upsert({
      where: { slug: "rome" },
      update: {},
      create: { countryId: countries[0].id, name: "Rome", slug: "rome", latitude: 41.9028, longitude: 12.4964 },
    }),
    prisma.city.upsert({
      where: { slug: "milan" },
      update: {},
      create: { countryId: countries[0].id, name: "Milan", slug: "milan", latitude: 45.4642, longitude: 9.19 },
    }),
    prisma.city.upsert({
      where: { slug: "paris" },
      update: {},
      create: { countryId: countries[1].id, name: "Paris", slug: "paris", latitude: 48.8566, longitude: 2.3522 },
    }),
    prisma.city.upsert({
      where: { slug: "barcelona" },
      update: {},
      create: { countryId: countries[2].id, name: "Barcelona", slug: "barcelona", latitude: 41.3874, longitude: 2.1686 },
    }),
  ]);
  console.log("Cities seeded:", cities.length);

  // Seed vehicles for each city
  for (const city of cities) {
    const existing = await prisma.vehicle.findFirst({ where: { cityId: city.id } });
    if (existing) continue;

    const sedan = await prisma.vehicle.create({
      data: {
        cityId: city.id,
        name: "Executive Sedan",
        type: "SEDAN",
        seatsMin: 1,
        seatsMax: 3,
        luggageMin: 1,
        luggageMax: 3,
      },
    });

    const minivan = await prisma.vehicle.create({
      data: {
        cityId: city.id,
        name: "Family Minivan",
        type: "MINI_VAN",
        seatsMin: 4,
        seatsMax: 7,
        luggageMin: 3,
        luggageMax: 6,
      },
    });

    const coach = await prisma.vehicle.create({
      data: {
        cityId: city.id,
        name: "Luxury Coach",
        type: "MID_COACH",
        seatsMin: 8,
        seatsMax: 16,
        luggageMin: 8,
        luggageMax: 16,
      },
    });

    // Seed rates
    await prisma.rate.createMany({
      data: [
        { vehicleId: sedan.id, mode: "TRANSFER", label: "Airport Transfer", price: 45, currency: "EUR", isActive: true },
        { vehicleId: sedan.id, mode: "HOURLY", label: "Hourly Hire", price: 35, currency: "EUR", isActive: true },
        { vehicleId: minivan.id, mode: "TRANSFER", label: "Airport Transfer", price: 65, currency: "EUR", isActive: true },
        { vehicleId: minivan.id, mode: "HOURLY", label: "Hourly Hire", price: 50, currency: "EUR", isActive: true },
        { vehicleId: coach.id, mode: "TRANSFER", label: "Airport Transfer", price: 120, currency: "EUR", isActive: true },
        { vehicleId: coach.id, mode: "HOURLY", label: "Hourly Hire", price: 90, currency: "EUR", isActive: true },
      ],
    });
    console.log(`Seeded vehicles+rates for ${city.name}`);
  }

  // Seed a package
  const pkg = await prisma.package.upsert({
    where: { slug: "rome-highlights" },
    update: {},
    create: {
      title: "Rome Highlights",
      slug: "rome-highlights",
      countryId: countries[0].id,
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
