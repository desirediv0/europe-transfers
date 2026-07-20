export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  idDocumentUrl?: string;
  idDocumentStatus: "PENDING" | "VERIFIED" | "REJECTED";
  isEmailVerified: boolean;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
}

export interface City {
  id: string;
  countryId: string;
  name: string;
  slug: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  country?: Country;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

export interface CarType {
  id: string;
  name: string;
  seats: number;
  image?: string;
  isAC: boolean;
  isWiFi: boolean;
  isLuggage: boolean;
  isChildSeat: boolean;
  isVIP: boolean;
  isPetFriendly: boolean;
  isActive: boolean;
}

export interface Route {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  isActive: boolean;
  fromLocation?: Location;
  toLocation?: Location;
}

export interface RoutePrice {
  routePriceId: string;
  carType: CarType;
  price: number;
  currency: string;
}

export interface SearchRoute {
  id: string;
  from: { id: string; name: string; city: string };
  to: { id: string; name: string; city: string };
}

export interface ItineraryDay {
  id: string;
  packageId: string;
  dayNumber: number;
  title: string;
  description: string;
}

export interface Package {
  id: string;
  title: string;
  slug: string;
  countryId: string;
  durationDays: number;
  coverImage?: string;
  summary?: string;
  priceFrom?: number;
  isActive: boolean;
  country?: { id: string; name: string; slug: string };
  itineraryDays?: ItineraryDay[];
}

export interface Booking {
  id: string;
  routeId: string;
  carTypeId: string;
  customerName: string;
  phone: string;
  email?: string;
  pickupAddress?: string;
  dropAddress?: string;
  travelDate: string;
  travelTime?: string;
  pax: number;
  luggageNotes?: string;
  price: number;
  currency: string;
  paymentStatus: "PENDING" | "PAID" | "PARTIAL" | "FAILED" | "REFUNDED";
  bookingStatus: "PENDING" | "CONFIRMED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  paymentId?: string;
  message?: string;
  route?: Route;
  carType?: CarType;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  message: string;
  isPublished: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
