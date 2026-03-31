import axios from 'axios';

// CMS API base URL - defaults to localhost for development
const CMS_API_BASE_URL = import.meta.env.VITE_CMS_API_URL || '/api';

export const cmsApi = axios.create({
  baseURL: CMS_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response wrapper type from CMS API
export interface CmsResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Multi-language text type
export interface MultiLangText {
  ar: string;
  en: string;
  he: string;
}

// ============ PLANS ============
export interface PlanFeature {
  id: number;
  planId: number;
  text: MultiLangText;
  isHighlighted: boolean;
  sortOrder: number;
}

export interface Plan {
  id: number;
  code: string;
  category: 'personal' | 'business';
  title: MultiLangText;
  price: { amount: number; currency: string };
  priceDisplay: MultiLangText | null;
  downloadSpeed: string;
  uploadSpeed: string | null;
  color: string;
  isBestValue: boolean;
  isPlus: boolean;
  isCustom: boolean;
  ctaText: MultiLangText | null;
  ctaLink: string;
  sortOrder: number;
  isActive: boolean;
  features: PlanFeature[];
}

export async function fetchPlans(category?: 'personal' | 'business'): Promise<Plan[]> {
  const params = category ? { category } : {};
  const response = await cmsApi.get<CmsResponse<Plan[]>>('/plans', { params });
  return response.data.data;
}

export async function fetchPlanById(id: number): Promise<Plan> {
  const response = await cmsApi.get<CmsResponse<Plan>>(`/plans/${id}`);
  return response.data.data;
}

// ============ HERO SLIDES ============
export interface HeroGalleryItem {
  id: number;
  mediaId: number;
  sortOrder: number;
  media?: Media;
}

export interface HeroSlide {
  id: number;
  mediaId: number | null;
  badge: MultiLangText | null;
  title: MultiLangText;
  subtitle: MultiLangText | null;
  ctaPrimaryText: MultiLangText | null;
  ctaPrimaryLink: string | null;
  ctaSecondaryText: MultiLangText | null;
  ctaSecondaryLink: string | null;
  sortOrder: number;
  isActive: boolean;
  media?: Media;
  gallery?: HeroGalleryItem[];
}

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const response = await cmsApi.get<CmsResponse<HeroSlide[]>>('/hero');
  return response.data.data;
}

// ============ FEATURES ============
export interface Feature {
  id: number;
  icon: string | null;
  mediaId: number | null;
  title: MultiLangText;
  description: MultiLangText | null;
  bgColor: string | null;
  sortOrder: number;
  isActive: boolean;
  media?: Media;
}

export async function fetchFeatures(): Promise<Feature[]> {
  const response = await cmsApi.get<CmsResponse<Feature[]>>('/features');
  return response.data.data;
}

// ============ ROUTERS ============
export interface Router {
  id: number;
  sku: string;
  category: string;
  title: MultiLangText;
  description: MultiLangText | null;
  mediaId: number | null;
  purchasePrice: { amount: number; currency: string };
  rentalPrice: { amount: number; currency: string } | null;
  isRentable: boolean;
  offerText: MultiLangText | null;
  sortOrder: number;
  isActive: boolean;
  media?: Media;
}

export async function fetchRouters(): Promise<Router[]> {
  const response = await cmsApi.get<CmsResponse<Router[]>>('/routers');
  return response.data.data;
}

export async function fetchRouterById(id: number): Promise<Router> {
  const response = await cmsApi.get<CmsResponse<Router>>(`/routers/${id}`);
  return response.data.data;
}

export async function fetchRouterBySku(sku: string): Promise<Router> {
  const response = await cmsApi.get<CmsResponse<Router>>(`/routers/sku/${sku}`);
  return response.data.data;
}

// ============ DEALERS ============
export interface Dealer {
  id: number;
  name: MultiLangText;
  address: MultiLangText;
  phone: string;
  email: string | null;
  workingHours: MultiLangText | null;
  location: { lat: number; lng: number };
  mediaId: number | null;
  hasInstallation: boolean;
  hasSupport: boolean;
  hasNewConnections: boolean;
  isActive: boolean;
}

export async function fetchDealers(): Promise<Dealer[]> {
  const response = await cmsApi.get<CmsResponse<Dealer[]>>('/dealers');
  return response.data.data;
}

export async function fetchDealerById(id: number): Promise<Dealer> {
  const response = await cmsApi.get<CmsResponse<Dealer>>(`/dealers/${id}`);
  return response.data.data;
}

// ============ ZONES ============
export interface Zone {
  id: number;
  code: string;
  name: MultiLangText;
  coveragePolygon: number[][] | null;
  isActive: boolean;
}

export async function fetchZones(): Promise<Zone[]> {
  const response = await cmsApi.get<CmsResponse<Zone[]>>('/zones');
  return response.data.data;
}

export async function fetchZoneById(id: number): Promise<Zone> {
  const response = await cmsApi.get<CmsResponse<Zone>>(`/zones/${id}`);
  return response.data.data;
}

// ============ PARTNERS ============
export interface Partner {
  id: number;
  name: MultiLangText;
  mediaId: number | null;
  websiteUrl: string | null;
  category: string;
  sortOrder: number;
  isActive: boolean;
  media?: Media;
}

export async function fetchPartners(): Promise<Partner[]> {
  const response = await cmsApi.get<CmsResponse<Partner[]>>('/partners');
  return response.data.data;
}

// ============ NAVIGATION ============
export interface NavItem {
  id: number;
  menuLocation: 'header' | 'footer' | 'mobile';
  parentId: number | null;
  label: MultiLangText;
  linkType: 'url' | 'anchor' | 'page';
  linkValue: string;
  icon: string | null;
  target: '_self' | '_blank';
  sortOrder: number;
  isActive: boolean;
  children?: NavItem[];
}

export async function fetchNavigation(location?: 'header' | 'footer' | 'mobile'): Promise<NavItem[]> {
  const endpoint = location ? `/navigation/${location}` : '/navigation';
  const response = await cmsApi.get<CmsResponse<NavItem[]>>(endpoint);
  return response.data.data;
}

// ============ SOCIAL LINKS ============
export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const response = await cmsApi.get<CmsResponse<SocialLink[]>>('/social-links');
  return response.data.data;
}

// ============ SITE SETTINGS ============
export interface SiteSetting {
  id: number;
  key: string;
  group: string;
  valueAr: string | null;
  valueEn: string | null;
  valueHe: string | null;
  isPublic: boolean;
}

export async function fetchSiteSettings(): Promise<SiteSetting[]> {
  const response = await cmsApi.get<CmsResponse<SiteSetting[]>>('/site-settings');
  return response.data.data;
}

// ============ MEDIA ============
export interface Media {
  id: number;
  uuid: string;
  name: string;
  filename: string;
  filePath: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  altText: MultiLangText | null;
  caption: MultiLangText | null;
  folder: string;
  isActive: boolean;
}

export async function fetchMediaById(id: number): Promise<Media> {
  const response = await cmsApi.get<CmsResponse<Media>>(`/media/${id}`);
  return response.data.data;
}

// Helper to get full media URL
export function getMediaUrl(fileUrl: string): string {
  if (fileUrl.startsWith('http')) return fileUrl;
  const baseUrl = import.meta.env.VITE_CMS_API_URL || '';
  return `${baseUrl}${fileUrl}`;
}

// ============ POSTS ============
export interface Post {
  id: number;
  slug: string;
  title: MultiLangText;
  excerpt: MultiLangText | null;
  content: MultiLangText;
  featuredImageId: number | null;
  category: string | null;
  tags: string[];
  status: 'draft' | 'scheduled' | 'published' | 'unpublished' | 'archived';
  publishedAt: string | null;
  publishAt: string | null;
  unpublishAt: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FetchPostsOptions {
  limit?: number;
  offset?: number;
}

export interface PostsPage {
  posts: Post[];
  hasMore: boolean;
  total?: number;
}

export async function fetchPosts(limit?: number): Promise<Post[]> {
  const params = limit ? { limit } : {};
  const response = await cmsApi.get<CmsResponse<Post[]>>('/posts', { params });
  return response.data.data;
}

export async function fetchPostsPaginated(options: FetchPostsOptions = {}): Promise<PostsPage> {
  const { limit = 9, offset = 0 } = options;
  const params = { limit: limit + 1, offset }; // Fetch one extra to check if there's more
  const response = await cmsApi.get<CmsResponse<Post[]>>('/posts', { params });
  const posts = response.data.data;
  const hasMore = posts.length > limit;
  return {
    posts: hasMore ? posts.slice(0, limit) : posts,
    hasMore,
  };
}

export async function fetchPostBySlug(slug: string): Promise<Post> {
  const response = await cmsApi.get<CmsResponse<Post>>(`/posts/${slug}`);
  return response.data.data;
}

// ============ TESTIMONIALS ============
export interface Testimonial {
  id: number;
  nameEn: string;
  nameAr: string;
  nameHe: string;
  roleEn: string | null;
  roleAr: string | null;
  roleHe: string | null;
  contentEn: string;
  contentAr: string;
  contentHe: string;
  avatarMediaId: number | null;
  rating: number;
  sortOrder: number;
  isActive: boolean;
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const response = await cmsApi.get<CmsResponse<Testimonial[]>>('/testimonials');
  return response.data.data;
}

// ============ ORDERS ============
export type OrderStatus = 'pending' | 'verified' | 'approved' | 'installed' | 'cancelled';

export interface Order {
  id: number;
  referenceNumber: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  phoneNumber: string;
  email: string | null;
  city: string;
  zone: string | null;
  streetName: string | null;
  houseNumber: string | null;
  addressNotes: string | null;
  serviceSpeed: string;
  planId: number | null;
  withFixedIp: boolean;
  withApService: boolean;
  routerId: number | null;
  routerType: string | null;
  routerIsRental: boolean;
  comingFrom: string | null;
  fromId: string | null;
  status: OrderStatus;
  isVerified: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  firstName: string;
  lastName: string;
  identityNumber: string;
  phoneNumber: string;
  email?: string;
  city: string;
  zone?: string;
  streetName?: string;
  houseNumber?: string;
  addressNotes?: string;
  serviceSpeed: string;
  planId?: number;
  withFixedIp?: boolean;
  withApService?: boolean;
  routerId?: number;
  routerType?: string;
  routerIsRental?: boolean;
  comingFrom?: string;
  fromId?: string;
  lat?: number;
  lng?: number;
  language?: string;
}

export interface CheckDuplicateResult {
  isDuplicate: boolean;
  existingOrder: Order | null;
}

export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  const response = await cmsApi.post<CmsResponse<Order>>('/orders', data);
  return response.data.data;
}

export async function checkDuplicateOrder(phoneNumber: string, identityNumber: string): Promise<CheckDuplicateResult> {
  const response = await cmsApi.post<CmsResponse<CheckDuplicateResult>>('/orders/check-duplicate', {
    phoneNumber,
    identityNumber,
  });
  return response.data.data;
}

export async function getOrderByReference(referenceNumber: string): Promise<Order> {
  const response = await cmsApi.get<CmsResponse<Order>>(`/orders/reference/${referenceNumber}`);
  return response.data.data;
}

export async function verifyOrder(orderId: number): Promise<Order> {
  const response = await cmsApi.post<CmsResponse<Order>>(`/orders/${orderId}/verify`);
  return response.data.data;
}

// ============ HOMEPAGE SECTIONS ============
export interface HomepageSection {
  id: number;
  sectionKey: string;
  title: MultiLangText;
  icon: string;
  sortOrder: number;
  isVisible: boolean;
  config: Record<string, any> | null;
}

// ============ CITIES ============
export interface City {
  id: number;
  code: string;
  name: MultiLangText;
  sortOrder: number;
  isActive: boolean;
}

export async function fetchCities(): Promise<City[]> {
  const response = await cmsApi.get<CmsResponse<City[]>>('/cities');
  return response.data.data;
}

export async function fetchHomepageSections(): Promise<HomepageSection[]> {
  const response = await cmsApi.get<CmsResponse<HomepageSection[]>>('/homepage-sections');
  return response.data.data;
}
