// Strip /api suffix from base URL since endpoints already include /api/ prefix
const rawUrl = import.meta.env.VITE_CMS_API_URL || '';
const API_URL = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl;

class AdminApiService {
  private apiKey: string | null = null;

  setApiKey(key: string | null) {
    this.apiKey = key;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.error?.message || error.message || 'Request failed');
    }

    return response.json();
  }

  // Dashboard
  async getDashboardStats() {
    const [ordersRes, plans, posts, zones] = await Promise.all([
      this.request<any>('/api/admin/orders?limit=100'),
      this.request<any>('/api/plans'),
      this.request<any>('/api/posts'),
      this.request<any>('/api/zones'),
    ]);

    // Orders API returns { data: { orders: [], total: N } }
    const orders = ordersRes.data?.orders || ordersRes.data || [];

    return {
      totalOrders: orders.length || 0,
      pendingOrders: orders.filter((o: any) => o.status === 'pending').length || 0,
      totalPlans: plans.data?.length || 0,
      totalPosts: posts.data?.length || 0,
      totalZones: zones.data?.length || 0,
      recentOrders: orders.slice(0, 5) || [],
    };
  }

  // Orders
  async getOrders(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const response = await this.request<any>(`/api/admin/orders?${query}`);
    // Normalize response: API returns { data: { orders: [], total: N } }
    return {
      ...response,
      data: response.data?.orders || response.data || [],
    };
  }

  async getOrder(id: number) {
    return this.request<any>(`/api/admin/orders/${id}`);
  }

  async updateOrderStatus(id: number, status: string, notes?: string) {
    return this.request<any>(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Plans
  async getPlans(category?: string) {
    const query = category ? `?category=${category}` : '';
    return this.request<any>(`/api/plans${query}`);
  }

  async getPlan(id: number) {
    return this.request<any>(`/api/plans/${id}`);
  }

  async createPlan(data: any) {
    return this.request<any>('/api/admin/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlan(id: number, data: any) {
    return this.request<any>(`/api/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlan(id: number) {
    return this.request<any>(`/api/admin/plans/${id}`, {
      method: 'DELETE',
    });
  }

  // Posts
  async getPosts(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return this.request<any>(`/api/posts?${query}`);
  }

  async getPost(id: number) {
    return this.request<any>(`/api/posts/${id}`);
  }

  async createPost(data: any) {
    return this.request<any>('/api/admin/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: number, data: any) {
    return this.request<any>(`/api/admin/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: number) {
    return this.request<any>(`/api/admin/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Zones
  async getZones() {
    return this.request<any>('/api/zones');
  }

  async createZone(data: any) {
    return this.request<any>('/api/admin/zones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateZone(id: number, data: any) {
    return this.request<any>(`/api/admin/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteZone(id: number) {
    return this.request<any>(`/api/admin/zones/${id}`, {
      method: 'DELETE',
    });
  }

  // Media
  async getMedia(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const response = await this.request<any>(`/api/admin/media?${query}`);
    // Normalize response: API returns { data: { items: [], page, limit } }
    return {
      ...response,
      data: response.data?.items || response.data || [],
    };
  }

  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/admin/media`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey || '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async deleteMedia(id: number) {
    return this.request<any>(`/api/admin/media/${id}`, {
      method: 'DELETE',
    });
  }

  // Partners
  async getPartners() {
    return this.request<any>('/api/partners');
  }

  async createPartner(data: any) {
    return this.request<any>('/api/admin/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePartner(id: number, data: any) {
    return this.request<any>(`/api/admin/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePartner(id: number) {
    return this.request<any>(`/api/admin/partners/${id}`, {
      method: 'DELETE',
    });
  }

  // Site Settings
  async getSettings() {
    return this.request<any>('/api/site-settings');
  }

  async updateSettings(data: any) {
    return this.request<any>('/api/admin/site-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Features
  async getFeatures() {
    return this.request<any>('/api/features');
  }

  async getFeature(id: number) {
    return this.request<any>(`/api/admin/features/${id}`);
  }

  async createFeature(data: any) {
    return this.request<any>('/api/admin/features', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFeature(id: number, data: any) {
    return this.request<any>(`/api/admin/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFeature(id: number) {
    return this.request<any>(`/api/admin/features/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderFeatures(orderedIds: number[]) {
    return this.request<any>('/api/admin/features/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    });
  }

  // Testimonials
  async getTestimonials() {
    return this.request<any>('/api/testimonials?activeOnly=false');
  }

  async getTestimonial(id: number) {
    return this.request<any>(`/api/admin/testimonials/${id}`);
  }

  async createTestimonial(data: any) {
    return this.request<any>('/api/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTestimonial(id: number, data: any) {
    return this.request<any>(`/api/admin/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTestimonial(id: number) {
    return this.request<any>(`/api/admin/testimonials/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderTestimonials(orderedIds: number[]) {
    return this.request<any>('/api/admin/testimonials/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    });
  }
  // Homepage Sections
  async getHomepageSections() {
    return this.request<any>('/api/admin/homepage-sections');
  }

  async updateHomepageSection(id: number, data: any) {
    return this.request<any>(`/api/admin/homepage-sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateHomepageSections(sections: { id: number; sortOrder: number; isVisible: boolean }[]) {
    return this.request<any>('/api/admin/homepage-sections', {
      method: 'PUT',
      body: JSON.stringify({ sections }),
    });
  }

  // Navigation Items
  async getNavItems() {
    return this.request<any>('/api/admin/navigation');
  }

  async getNavItemsByLocation(location: string) {
    return this.request<any>(`/api/admin/navigation/location/${location}`);
  }

  async createNavItem(data: any) {
    return this.request<any>('/api/admin/navigation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNavItem(id: number, data: any) {
    return this.request<any>(`/api/admin/navigation/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNavItem(id: number) {
    return this.request<any>(`/api/admin/navigation/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderNavItems(orderedIds: number[]) {
    return this.request<any>('/api/admin/navigation/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    });
  }
  // Cities
  async getCities() {
    return this.request<any>('/api/cities?activeOnly=false');
  }

  async createCity(data: any) {
    return this.request<any>('/api/admin/cities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCity(id: number, data: any) {
    return this.request<any>(`/api/admin/cities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCity(id: number) {
    return this.request<any>(`/api/admin/cities/${id}`, {
      method: 'DELETE',
    });
  }

  // Dealers
  async getDealers() {
    return this.request<any>('/api/dealers');
  }

  async createDealer(data: any) {
    return this.request<any>('/api/admin/dealers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDealer(id: number, data: any) {
    return this.request<any>(`/api/admin/dealers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDealer(id: number) {
    return this.request<any>(`/api/admin/dealers/${id}`, {
      method: 'DELETE',
    });
  }

  // Heroes
  async getHeroes() {
    return this.request<any>('/api/hero');
  }

  async createHero(data: any) {
    return this.request<any>('/api/admin/hero', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHero(id: number, data: any) {
    return this.request<any>(`/api/admin/hero/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHero(id: number) {
    return this.request<any>(`/api/admin/hero/${id}`, {
      method: 'DELETE',
    });
  }

  // Content Media
  async getContentMedia(contentType: string, contentId: number, role?: string) {
    const query = role ? `?role=${role}` : '';
    return this.request<any>(`/api/admin/content-media/${contentType}/${contentId}${query}`);
  }

  async attachMedia(contentType: string, contentId: number, mediaId: number, mediaRole = 'gallery', sortOrder = 0) {
    return this.request<any>(`/api/admin/content-media/${contentType}/${contentId}`, {
      method: 'POST',
      body: JSON.stringify({ mediaId, mediaRole, sortOrder }),
    });
  }

  async setContentMedia(contentType: string, contentId: number, media: { mediaId: number; mediaRole?: string; sortOrder?: number }[], role?: string) {
    return this.request<any>(`/api/admin/content-media/${contentType}/${contentId}`, {
      method: 'PUT',
      body: JSON.stringify({ media, role }),
    });
  }

  async detachMedia(contentType: string, contentId: number, mediaId: number) {
    return this.request<any>(`/api/admin/content-media/${contentType}/${contentId}/${mediaId}`, {
      method: 'DELETE',
    });
  }
}

export const adminApi = new AdminApiService();
