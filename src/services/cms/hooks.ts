import { useQuery, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import {
  fetchPlans,
  fetchHeroSlides,
  fetchFeatures,
  fetchRouters,
  fetchDealers,
  fetchZones,
  fetchPartners,
  fetchNavigation,
  fetchSocialLinks,
  fetchSiteSettings,
  fetchMediaById,
  fetchPosts,
  fetchPostsPaginated,
  fetchPostBySlug,
  fetchTestimonials,
  createOrder,
  checkDuplicateOrder,
  getOrderByReference,
  verifyOrder,
  Plan,
  HeroSlide,
  HeroGalleryItem,
  Feature,
  Router,
  Dealer,
  Zone,
  Partner,
  NavItem,
  SocialLink,
  SiteSetting,
  Media,
  Post,
  PostsPage,
  Order,
  Testimonial,
  CreateOrderRequest,
  CheckDuplicateResult,
  HomepageSection,
  fetchHomepageSections,
} from './api';

// Re-export HeroGalleryItem type
export type { HeroGalleryItem };

// Common query options for static content (changes rarely)
const staticContentOptions = {
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
};

// Plans hooks
export function usePlans(category?: 'personal' | 'business') {
  return useQuery<Plan[], Error>({
    queryKey: ['plans', category],
    queryFn: () => fetchPlans(category),
    ...staticContentOptions,
  });
}

export function usePersonalPlans() {
  return usePlans('personal');
}

export function useBusinessPlans() {
  return usePlans('business');
}

// Hero slides hook
export function useHeroSlides() {
  return useQuery<HeroSlide[], Error>({
    queryKey: ['hero-slides'],
    queryFn: fetchHeroSlides,
    ...staticContentOptions,
  });
}

// Features hook
export function useFeatures() {
  return useQuery<Feature[], Error>({
    queryKey: ['features'],
    queryFn: fetchFeatures,
    ...staticContentOptions,
  });
}

// Routers hook
export function useRouters() {
  return useQuery<Router[], Error>({
    queryKey: ['routers'],
    queryFn: fetchRouters,
    ...staticContentOptions,
  });
}

// Dealers hook
export function useDealers() {
  return useQuery<Dealer[], Error>({
    queryKey: ['dealers'],
    queryFn: fetchDealers,
    staleTime: 5 * 60 * 1000, // 5 minutes - dealers might change more often
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Zones hook
export function useZones() {
  return useQuery<Zone[], Error>({
    queryKey: ['zones'],
    queryFn: fetchZones,
    ...staticContentOptions,
  });
}

// Partners hook
export function usePartners() {
  return useQuery<Partner[], Error>({
    queryKey: ['partners'],
    queryFn: fetchPartners,
    ...staticContentOptions,
  });
}

// Navigation hook
export function useNavigation(location?: 'header' | 'footer' | 'mobile') {
  return useQuery<NavItem[], Error>({
    queryKey: ['navigation', location],
    queryFn: () => fetchNavigation(location),
    ...staticContentOptions,
  });
}

// Social links hook
export function useSocialLinks() {
  return useQuery<SocialLink[], Error>({
    queryKey: ['social-links'],
    queryFn: fetchSocialLinks,
    ...staticContentOptions,
  });
}

// Site settings hook
export function useSiteSettings() {
  return useQuery<SiteSetting[], Error>({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
    ...staticContentOptions,
  });
}

// Testimonials hook
export function useTestimonials() {
  return useQuery<Testimonial[], Error>({
    queryKey: ['testimonials'],
    queryFn: fetchTestimonials,
    ...staticContentOptions,
  });
}

// Media hook
export function useMedia(id: number | null) {
  return useQuery<Media, Error>({
    queryKey: ['media', id],
    queryFn: () => fetchMediaById(id!),
    enabled: id !== null,
    staleTime: 30 * 60 * 1000, // 30 minutes for media
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Posts hooks
export function usePosts(limit?: number) {
  return useQuery<Post[], Error>({
    queryKey: ['posts', limit],
    queryFn: () => fetchPosts(limit),
    ...staticContentOptions,
  });
}

export function useInfinitePosts(pageSize: number = 9) {
  return useInfiniteQuery<PostsPage, Error>({
    queryKey: ['posts', 'infinite', pageSize],
    queryFn: ({ pageParam = 0 }) => fetchPostsPaginated({ limit: pageSize, offset: pageParam as number }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.reduce((total, page) => total + page.posts.length, 0);
    },
    initialPageParam: 0,
    ...staticContentOptions,
  });
}

export function usePostBySlug(slug: string | null) {
  return useQuery<Post, Error>({
    queryKey: ['post', slug],
    queryFn: () => fetchPostBySlug(slug!),
    enabled: slug !== null,
    ...staticContentOptions,
  });
}

// Order hooks
export function useCreateOrder() {
  return useMutation<Order, Error, CreateOrderRequest>({
    mutationFn: createOrder,
  });
}

export function useCheckDuplicateOrder() {
  return useMutation<CheckDuplicateResult, Error, { phoneNumber: string; identityNumber: string }>({
    mutationFn: ({ phoneNumber, identityNumber }) => checkDuplicateOrder(phoneNumber, identityNumber),
  });
}

export function useOrderByReference(referenceNumber: string | null) {
  return useQuery<Order, Error>({
    queryKey: ['order', referenceNumber],
    queryFn: () => getOrderByReference(referenceNumber!),
    enabled: referenceNumber !== null,
  });
}

export function useVerifyOrder() {
  return useMutation<Order, Error, number>({
    mutationFn: verifyOrder,
  });
}

export function useHomepageSections() {
  return useQuery<HomepageSection[], Error>({
    queryKey: ['homepage-sections'],
    queryFn: fetchHomepageSections,
    ...staticContentOptions,
  });
}
