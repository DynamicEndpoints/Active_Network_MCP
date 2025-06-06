import axios, { AxiosInstance } from 'axios';
import { Activity, ActivityDetails, SearchParams, SearchResponse } from './types/active-network.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

export class ActiveNetworkClient {
  private client: AxiosInstance;
  private baseUrl = 'https://api.amp.active.com/v2';
  private apiKey: string;
  private requestCount = 0;
  private lastRequest = 0;
  private readonly rateLimitDelay = 500; // 2 calls per second = 500ms between calls

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new McpError(ErrorCode.InvalidParams, 'API key is required');
    }

    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Active-Network-MCP-Server/1.0.0'
      }
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.enforceRateLimit();
      this.requestCount++;
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Active Network API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
        return Promise.reject(error);
      }
    );
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequest = Date.now();
  }

  async searchActivities(params: SearchParams): Promise<SearchResponse> {
    try {
      // Build query parameters according to latest API specification
      const queryParams: any = {
        api_key: this.apiKey,
        exclude_children: params.exclude_children !== false,
        per_page: Math.min(params.per_page || 25, 50),
        current_page: params.current_page || 1
      };

      // Location parameters (use one of these)
      if (params.lat_lon) {
        queryParams.lat_lon = params.lat_lon;
      } else if (params.near) {
        queryParams.near = params.near;
      } else if (params.bbox) {
        queryParams.bbox = params.bbox;
      } else if (params.geo_points) {
        queryParams.geo_points = params.geo_points;
      }

      // Geographic filters
      if (params.radius !== undefined) queryParams.radius = params.radius;
      if (params.city) queryParams.city = params.city;
      if (params.state) queryParams.state = params.state;
      if (params.zip) queryParams.zip = params.zip;
      if (params.country) queryParams.country = params.country;

      // Search and filter parameters
      if (params.query) queryParams.query = params.query;
      if (params.category) queryParams.category = params.category;
      if (params.category_name) queryParams.category_name = params.category_name;
      if (params.topic) queryParams.topic = params.topic;
      if (params.topic_name) queryParams.topic_name = params.topic_name;
      
      // Date filters
      if (params.start_date) queryParams.start_date = params.start_date;
      if (params.end_date) queryParams.end_date = params.end_date;

      // Special filters
      if (params.kids === true) queryParams.kids = 'true';
      if (params.registerable_only === true) queryParams.registerable_only = 'true';
      if (params.meta_interest) queryParams.meta_interest = params.meta_interest;
      if (params.meta_interest_name) queryParams.meta_interest_name = params.meta_interest_name;

      // Advanced filters
      if (params.attributes) queryParams.attributes = params.attributes;
      if (params.tags) queryParams.tags = params.tags;
      if (params.exists) queryParams.exists = params.exists;
      if (params.not_exists) queryParams.not_exists = params.not_exists;

      // Sorting and pagination
      if (params.sort) queryParams.sort = params.sort;
      if (params.show_distance === true) queryParams.show_distance = 'true';

      // Facets and aggregation
      if (params.facets) queryParams.facets = params.facets;
      if (params.facet_values) queryParams.facet_values = params.facet_values;

      // Asset-specific searches
      if (params.asset_name) queryParams.asset_name = params.asset_name;
      if (params.org_id) queryParams.org_id = params.org_id;
      if (params.place_id) queryParams.place_id = params.place_id;
      if (params.source_system_id) queryParams.source_system_id = params.source_system_id;
      if (params.source_system_name) queryParams.source_system_name = params.source_system_name;

      // Response customization
      if (params.fields) queryParams.fields = params.fields;
      if (params.show_suggest === true) queryParams.show_suggest = 'true';
      if (params.search_again === true) queryParams.search_again = 'true';
      if (params.cb) queryParams.cb = params.cb; // JSONP callback

      console.error('Active Network API Request:', {
        url: `${this.baseUrl}/search`,
        params: queryParams
      });

      const response = await this.client.get('/search', { params: queryParams });

      console.error('Active Network API Response Status:', response.status);

      if (!response.data) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Empty response from Active Network API'
        );
      }

      // Handle different response formats based on API version
      const data = response.data;
      
      // Ensure we have a consistent response format
      if (!data.results && Array.isArray(data)) {
        // Old format - convert to new format
        return {
          total_results: data.length,
          items_per_page: queryParams.per_page,
          start_index: ((queryParams.current_page - 1) * queryParams.per_page),
          results: data,
          facets: {},
          suggestions: []
        };
      }

      return data;
    } catch (error) {
      console.error('Error in searchActivities:', error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        // Handle specific API error codes
        switch (status) {
          case 400:
            throw new McpError(ErrorCode.InvalidParams, `Bad request: ${message}`);
          case 403:
            if (message.includes('Over Rate Limit')) {
              throw new McpError(ErrorCode.InvalidRequest, 'API rate limit exceeded. Please try again later.');
            }
            if (message.includes('Not Authorized')) {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid API key or unauthorized access.');
            }
            throw new McpError(ErrorCode.InvalidRequest, `Access denied: ${message}`);
          case 414:
            throw new McpError(ErrorCode.InvalidParams, 'Request URI too long. Please reduce the number of parameters.');
          case 502:
          case 503:
          case 504:
            throw new McpError(ErrorCode.InternalError, 'Active Network API is temporarily unavailable. Please try again later.');
          default:
            throw new McpError(
              ErrorCode.InternalError,
              `Active Network API error (${status}): ${message}`
            );
        }
      }
      throw error;
    }
  }
  async getActivityDetails(activityId: string): Promise<ActivityDetails> {
    try {
      const response = await this.client.get('/search', {
        params: {
          'asset.assetGuid': activityId,
          api_key: this.apiKey,
          exclude_children: false // Include children for full details
        }
      });

      if (!response.data.results?.[0]) {
        throw new McpError(ErrorCode.InvalidRequest, 'Activity not found');
      }

      return response.data.results[0];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        if (status === 404) {
          throw new McpError(ErrorCode.InvalidRequest, 'Activity not found');
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get activity details: ${message}`
        );
      }
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await this.client.get('/search', {
        params: {
          facets: 'categoryName',
          per_page: 0,
          api_key: this.apiKey
        }
      });

      const categories = response.data.facets?.categoryName?.values?.map((v: any) => v.value) || [];
      return categories.sort();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get categories: ${message}`
        );
      }
      throw error;
    }
  }

  async getLocations(): Promise<string[]> {
    try {
      const response = await this.client.get('/search', {
        params: {
          facets: 'place.cityName',
          per_page: 0,
          api_key: this.apiKey
        }
      });

      const locations = response.data.facets?.['place.cityName']?.values?.map((v: any) => v.value) || [];
      return locations.sort();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get locations: ${message}`
        );
      }
      throw error;
    }
  }

  async getTopics(): Promise<string[]> {
    try {
      const response = await this.client.get('/search', {
        params: {
          facets: 'topicName',
          per_page: 0,
          api_key: this.apiKey
        }
      });

      const topics = response.data.facets?.topicName?.values?.map((v: any) => v.value) || [];
      return topics.sort();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get topics: ${message}`
        );
      }
      throw error;
    }
  }

  // Utility method to get comprehensive facet data
  async getFacets(facetTypes: string[]): Promise<Record<string, Array<{value: string, count: number}>>> {
    try {
      const response = await this.client.get('/search', {
        params: {
          facets: facetTypes.join(','),
          per_page: 0,
          api_key: this.apiKey
        }
      });

      const facets: Record<string, Array<{value: string, count: number}>> = {};
      
      if (response.data.facets) {
        for (const facetType of facetTypes) {
          facets[facetType] = response.data.facets[facetType]?.values || [];
        }
      }

      return facets;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to get facets: ${message}`
        );
      }
      throw error;
    }
  }

  // Get API usage statistics
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      rateLimitDelay: this.rateLimitDelay,
      lastRequest: this.lastRequest,
      baseUrl: this.baseUrl
    };
  }
}
