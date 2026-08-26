export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "EDITOR";
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  idDocumentUrl?: string;
  idDocumentStatus: "PENDING" | "VERIFIED" | "REJECTED";
  isEmailVerified: boolean;
  rejectionReason?: string;
  createdAt: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
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
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
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
  createdAt: string;
}

export type VanCoachPriceGroup = "AIRPORT_TRANSFER" | "POINT_TO_POINT" | "TOUR_PACKAGE";

export interface VanCoachRoutePrice {
  id: string;
  vehicleId: string;
  group: VanCoachPriceGroup;
  label: string;
  price: number;
  order: number;
}

export interface VanCoachVehicle {
  id: string;
  name: string;
  seats: number;
  image?: string;
  category?: string;
  description?: string;
  rate8h: number;
  rate10h: number;
  overtimeRate: number;
  currency: string;
  isActive: boolean;
  order: number;
  routePrices?: VanCoachRoutePrice[];
  createdAt: string;
}

export interface VanCoachEnquiry {
  id: string;
  vehicleId?: string;
  vehicleName: string;
  location: string;
  hours: number;
  rate: number;
  customerName: string;
  phone: string;
  email: string;
  pickupAddress?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface Route {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  isActive: boolean;
  fromLocation?: Location;
  toLocation?: Location;
  routePrices?: RoutePrice[];
  createdAt: string;
}

export interface RoutePrice {
  id: string;
  routeId: string;
  carTypeId: string;
  price: number;
  currency: string;
  route?: Route;
  carType?: CarType;
  createdAt: string;
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
  country?: Country;
  itineraryDays?: ItineraryDay[];
  createdAt: string;
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
  createdAt: string;
}

export interface DashboardCounts {
  bookings: number;
  packages: number;
  locations: number;
  pendingVerifications: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ─── Careers ───────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  slug: string;
  location: string;
  type: string;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: { applications: number };
}

export interface JobApplication {
  id: string;
  jobId: string;
  job: { title: string; slug: string };
  name: string;
  email: string;
  phone: string;
  coverNote: string | null;
  cvUrl: string;
  status: string;
  createdAt: string;
}

// ─── Private Transfers ────────────────────────────

export interface PrivateTransferRoute {
  id: string;
  cityId: string;
  description: string;
  sedanPrice: number;
  minivanPrice: number;
  currency: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface PrivateTransferCity {
  id: string;
  name: string;
  slug: string;
  coverImage?: string;
  isActive: boolean;
  order: number;
  routes?: PrivateTransferRoute[];
  createdAt: string;
}

export interface PrivateTransferEnquiry {
  id: string;
  cityName: string;
  routeDescription: string;
  vehicleType: string;
  price: number;
  currency: string;
  customerName: string;
  phone: string;
  email: string;
  pickupDate?: string;
  pickupTime?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface PackageEnquiry {
  id: string;
  packageId?: string;
  packageTitle: string;
  countryName?: string;
  priceDisplay?: string;
  customerName: string;
  phone: string;
  email: string;
  travelDate?: string;
  pax: number;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface SightseeingTour {
  id: string;
  title: string;
  slug: string;
  cityName?: string;
  countryName?: string;
  duration: string;
  priceFrom: number;
  coverImage?: string;
  galleryImages?: string;
  summary?: string;
  description?: string;
  highlights?: string;
  includes?: string;
  options?: string;
  schedule?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface SightseeingEnquiry {
  id: string;
  sightseeingId?: string;
  sightseeingTitle: string;
  optionSelected?: string;
  cityName?: string;
  priceDisplay?: string;
  customerName: string;
  phone: string;
  email: string;
  travelDate?: string;
  pax: number;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoPage {
  id: string;
  title: string;
  slug: string;
  linkedCategory?: string;
  pageDescription?: string;
  cityContent?: string;
  additionalSeoContent?: string;
  faqs?: FaqItem[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  postsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostTagRelation {
  postId: string;
  tagId: string;
  tag?: BlogTag;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  coverImage?: string;
  categoryId?: string;
  category?: BlogCategory;
  tags?: BlogPostTagRelation[];
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

