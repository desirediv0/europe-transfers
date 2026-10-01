import "./config/env.config.js";
import app from "./app.js";
import prisma from "./config/db.js";
import env from "./config/env.config.js";

// One-off schema patches that ship in code instead of a separate migration
// step - each is a no-op once already applied (IF NOT EXISTS), so this is
// safe to run on every boot.
const runSchemaPatches = async () => {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "CarType" ADD COLUMN IF NOT EXISTS "luggageCapacity" INTEGER NOT NULL DEFAULT 2`
  );
  // luggageCapacity (a single number) was replaced with free text, so
  // admins can describe mixed bag sizes, e.g. "6 hand bags + 6 mid size
  // luggages" instead of just "6". Carry over any existing numeric value
  // as "<n> bags" before the old column is no longer used.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "CarType" ADD COLUMN IF NOT EXISTS "luggageInfo" TEXT DEFAULT '2 bags'`
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "CarType" SET "luggageInfo" = "luggageCapacity" || ' bags' WHERE "luggageInfo" = '2 bags' AND "luggageCapacity" IS NOT NULL AND "luggageCapacity" != 2`
  );
  // Package "highlights" (the checklist shown on the package detail page)
  // used to be a hardcoded list in the client, not admin-editable or
  // per-package. Stored as a JSON-encoded string array, same pattern as
  // SightseeingTour.highlights. Existing packages get the old hardcoded
  // list as their starting value so nothing visibly changes until edited.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "highlights" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "Package" SET "highlights" = '["Bespoke Private Chauffeured Transfers","Luxury Mercedes-Benz S-Class / V-Class Fleet","English Speaking Professional Chauffeurs","Flight Tracking & Complimentary Wait Time","Customizable Daily Sightseeing Itinerary","24/7 VIP Concierge Travel Assistance"]' WHERE "highlights" IS NULL`
  );
};

// B2B registration: company details, compliance documents and consents on
// the User table (see prisma/schema.prisma).
const runB2bUserPatches = async () => {
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyName" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "businessType" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyCountry" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vatId" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "businessAddress" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "jobTitle" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "contactLocation" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyCertUrl" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vatCertUrl" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authIdUrl" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "addressProofUrl" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authorizedConfirmed" BOOLEAN NOT NULL DEFAULT false`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commsConsent" BOOLEAN NOT NULL DEFAULT false`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3)`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "privacyAcceptedAt" TIMESTAMP(3)`);
};

// Private Transfers bookings: flight/train details, booking-agent contact,
// and the Razorpay order the booking is being paid through.
const runBookingPatches = async () => {
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "flightDetails" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "agentContact" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "agentEmail" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "amountInr" DECIMAL(10,2)`);
};

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    await runSchemaPatches();
    await runB2bUserPatches();
    await runBookingPatches();
    console.log("Schema patches applied");

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
