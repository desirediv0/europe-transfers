import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalBookings,
    totalPackages,
    totalCities,
    totalLocations,
    totalRoutes,
    totalUsers,
    totalCarTypes,
    totalTestimonials,
    pendingVerifications,
    pendingBookings,
    paidBookings,
    recentBookings,
    monthlyBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.package.count(),
    prisma.city.count(),
    prisma.location.count(),
    prisma.route.count(),
    prisma.user.count(),
    prisma.carType.count(),
    prisma.testimonial.count(),
    prisma.user.count({ where: { idDocumentStatus: "PENDING" } }),
    prisma.booking.count({ where: { paymentStatus: "PENDING" } }),
    prisma.booking.count({ where: { paymentStatus: "PAID" } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        route: { include: { fromLocation: true, toLocation: true } },
        carType: true,
      },
    }),
    prisma.booking.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: { createdAt: { gte: startOfYear } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Group monthly bookings by month
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const bookingsByMonth = Array.from({ length: 12 }, (_, i) => ({
    month: months[i],
    bookings: 0,
    revenue: 0,
  }));

  // Get prices for monthly revenue calculation
  const bookingsThisYear = await prisma.booking.findMany({
    where: { createdAt: { gte: startOfYear } },
    select: { createdAt: true, price: true },
  });

  bookingsThisYear.forEach((b) => {
    const month = new Date(b.createdAt).getMonth();
    bookingsByMonth[month].bookings += 1;
    bookingsByMonth[month].revenue += Number(b.price || 0);
  });

  return apiResponse(res, 200, "Dashboard stats retrieved", {
    counts: {
      bookings: totalBookings,
      packages: totalPackages,
      cities: totalCities,
      locations: totalLocations,
      routes: totalRoutes,
      users: totalUsers,
      carTypes: totalCarTypes,
      testimonials: totalTestimonials,
      pendingVerifications,
      pendingBookings,
      paidBookings,
    },
    recentBookings,
    bookingsByMonth,
  });
});
