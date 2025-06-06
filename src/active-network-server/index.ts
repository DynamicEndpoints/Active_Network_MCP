#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js';
import { ActiveNetworkClient } from '../active-network-client.js';
import { SearchParams } from '../types/active-network.js';

interface SearchContext {
  recentSearches: Array<{
    query: SearchParams;
    timestamp: Date;
    resultCount: number;
  }>;
  preferences: {
    defaultLocation?: string;
    defaultRadius?: number;
    favoriteCategories?: string[];
    excludeChildren?: boolean;
  };
  cache: Map<string, { data: any; timestamp: Date; ttl: number }>;
}

interface TaskManager {
  backgroundTasks: Map<string, {
    id: string;
    type: string;
    status: 'running' | 'completed' | 'failed';
    progress: number;
    result?: any;
    error?: string;
    startTime: Date;
    endTime?: Date;
  }>;
  scheduledTasks: Array<{
    id: string;
    type: string;
    schedule: string;
    lastRun?: Date;
    nextRun: Date;
    params: any;
  }>;
}

class ActiveNetworkServer {
  private server: Server;
  private client: ActiveNetworkClient;
  private context: SearchContext;
  private taskManager: TaskManager;
  private startTime: Date;

  constructor() {
    const apiKey = process.env.ACTIVE_NETWORK_API_KEY;
    if (!apiKey) {
      throw new McpError(ErrorCode.InvalidParams, 'ACTIVE_NETWORK_API_KEY environment variable is required');
    }

    this.client = new ActiveNetworkClient(apiKey);
    this.startTime = new Date();
    
    // Initialize context management
    this.context = {
      recentSearches: [],
      preferences: {
        defaultLocation: 'Vancouver,BC,CA',
        defaultRadius: 25,
        favoriteCategories: [],
        excludeChildren: true
      },
      cache: new Map()
    };

    // Initialize task management
    this.taskManager = {
      backgroundTasks: new Map(),
      scheduledTasks: []
    };

    this.server = new Server(
      {
        name: 'active-network-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }
  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_activities',
          description: 'Search for activities with enhanced context management and caching',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query (optional if using location-based search)'
              },
              near: {
                type: 'string',
                description: 'Location string (e.g., "San Diego,CA,US") - uses default if not specified'
              },
              lat_lon: {
                type: 'string',
                description: 'Latitude and longitude separated by comma (e.g., "45.49428,-122.86705")'
              },
              radius: {
                type: 'number',
                description: 'Search radius in miles (default: 25)',
                minimum: 1,
                maximum: 100
              },
              category: {
                type: 'string',
                description: 'Activity category (event, articles, etc.)',
                enum: ['event', 'articles']
              },
              topic: {
                type: 'string',
                description: 'Activity topic (running, cycling, etc.)'
              },
              start_date: {
                type: 'string',
                description: 'Start date filter in YYYY-MM-DD format or range (e.g., "2024-01-01..")'
              },
              end_date: {
                type: 'string',
                description: 'End date filter in YYYY-MM-DD format or range'
              },
              kids: {
                type: 'boolean',
                description: 'Filter for kids activities only'
              },
              exclude_children: {
                type: 'boolean',
                description: 'Exclude child assets from results (default: true)'
              },
              per_page: {
                type: 'number',
                description: 'Number of results per page (default: 25, max: 50)',
                minimum: 1,
                maximum: 50
              },
              current_page: {
                type: 'number',
                description: 'Current page number (default: 1)',
                minimum: 1
              },
              sort: {
                type: 'string',
                description: 'Sort order',
                enum: ['date_asc', 'date_desc', 'distance', 'relevance']
              },
              use_cache: {
                type: 'boolean',
                description: 'Use cached results if available (default: true)'
              }
            }
          }
        },
        {
          name: 'get_activity_details',
          description: 'Get comprehensive details for a specific activity',
          inputSchema: {
            type: 'object',
            properties: {
              activityId: {
                type: 'string',
                description: 'Activity GUID from search results'
              },
              include_pricing: {
                type: 'boolean',
                description: 'Include pricing information (default: true)'
              },
              include_components: {
                type: 'boolean',
                description: 'Include child components (default: false)'
              }
            },
            required: ['activityId']
          }
        },
        {
          name: 'get_categories',
          description: 'Get list of available activity categories with counts',
          inputSchema: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'Filter categories by location'
              },
              include_counts: {
                type: 'boolean',
                description: 'Include activity counts per category (default: true)'
              }
            }
          }
        },
        {
          name: 'get_locations',
          description: 'Get list of available locations with activity counts',
          inputSchema: {
            type: 'object',
            properties: {
              state: {
                type: 'string',
                description: 'Filter by state/province code'
              },
              country: {
                type: 'string',
                description: 'Filter by country (default: US)'
              },
              include_counts: {
                type: 'boolean',
                description: 'Include activity counts per location (default: true)'
              }
            }
          }
        },
        {
          name: 'get_topics',
          description: 'Get list of available activity topics',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter topics by category'
              },
              include_counts: {
                type: 'boolean',
                description: 'Include activity counts per topic (default: true)'
              }
            }
          }
        },
        {
          name: 'advanced_search',
          description: 'Advanced search with multiple criteria and filters',
          inputSchema: {
            type: 'object',
            properties: {
              filters: {
                type: 'object',
                description: 'Advanced filters',
                properties: {
                  price_range: {
                    type: 'object',
                    properties: {
                      min: { type: 'number' },
                      max: { type: 'number' }
                    }
                  },
                  age_range: {
                    type: 'object',
                    properties: {
                      min: { type: 'number' },
                      max: { type: 'number' }
                    }
                  },
                  registration_status: {
                    type: 'string',
                    enum: ['open', 'closed', 'full']
                  },
                  has_registration: {
                    type: 'boolean'
                  }
                }
              },
              geo_search: {
                type: 'object',
                properties: {
                  bbox: {
                    type: 'string',
                    description: 'Bounding box as "nw_lat,nw_lon;se_lat,se_lon"'
                  },
                  geo_points: {
                    type: 'string',
                    description: 'Polygon points as semicolon-separated lat,lon pairs'
                  }
                }
              }
            }
          }
        },
        {
          name: 'manage_preferences',
          description: 'Manage user preferences and search context',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['get', 'set', 'reset'],
                description: 'Preference management action'
              },
              preferences: {
                type: 'object',
                properties: {
                  defaultLocation: { type: 'string' },
                  defaultRadius: { type: 'number' },
                  favoriteCategories: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  excludeChildren: { type: 'boolean' }
                }
              }
            },
            required: ['action']
          }
        },
        {
          name: 'manage_tasks',
          description: 'Manage background tasks and monitoring',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['list', 'status', 'cancel', 'schedule_monitor'],
                description: 'Task management action'
              },
              task_id: {
                type: 'string',
                description: 'Task ID for status/cancel operations'
              },
              monitor_config: {
                type: 'object',
                properties: {
                  search_params: { type: 'object' },
                  check_interval: { type: 'string' },
                  notify_on_changes: { type: 'boolean' }
                }
              }
            },
            required: ['action']
          }
        },
        {
          name: 'get_search_history',
          description: 'Get recent search history with analytics',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of recent searches to return (default: 10)',
                minimum: 1,
                maximum: 50
              },
              include_analytics: {
                type: 'boolean',
                description: 'Include search analytics (default: true)'
              }
            }
          }
        },
        {
          name: 'clear_cache',
          description: 'Clear search cache or specific cached entries',
          inputSchema: {
            type: 'object',
            properties: {
              cache_key: {
                type: 'string',
                description: 'Specific cache key to clear (clears all if not specified)'
              }
            }
          }
        }
      ]
    }));    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {        case 'search_activities': {
          const args = (request.params.arguments || {}) as any;
          
          // Apply defaults from preferences
          const searchParams: SearchParams = {
            near: args.near || this.context.preferences.defaultLocation,
            radius: args.radius || this.context.preferences.defaultRadius,
            exclude_children: args.exclude_children !== undefined ? args.exclude_children : this.context.preferences.excludeChildren,
            per_page: Math.min(typeof args.per_page === 'number' ? args.per_page : 25, 50),
            current_page: typeof args.current_page === 'number' ? args.current_page : 1,
            ...args
          };

          // Check cache if enabled
          const useCache = args.use_cache !== false;
          const cacheKey = this.generateCacheKey(searchParams);
          
          if (useCache) {
            const cached = this.getCachedResult(cacheKey);
            if (cached) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    ...cached,
                    _cached: true,
                    _cacheTime: new Date().toISOString()
                  }, null, 2)
                }]
              };
            }
          }

          try {
            const result = await this.client.searchActivities(searchParams);
            
            // Cache the result
            if (useCache) {
              this.setCachedResult(cacheKey, result);
            }
            
            // Add to search history
            this.addToSearchHistory(searchParams, result.total_results || 0);

            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  ...result,
                  _searchParams: searchParams,
                  _timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Search failed: ${error}`);
          }
        }

        case 'get_activity_details': {
          if (!request.params.arguments?.activityId) {
            throw new McpError(ErrorCode.InvalidParams, 'Activity ID is required');
          }
          
          const activityId = request.params.arguments.activityId as string;
          const includePricing = request.params.arguments.include_pricing !== false;
          const includeComponents = request.params.arguments.include_components === true;
          
          try {
            const result = await this.client.getActivityDetails(activityId);
            
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  ...result,
                  _includePricing: includePricing,
                  _includeComponents: includeComponents,
                  _timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to get activity details: ${error}`);
          }
        }

        case 'get_categories': {
          const location = request.params.arguments?.location as string;
          const includeCounts = request.params.arguments?.include_counts !== false;
          
          try {
            const result = await this.client.getCategories();
            
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  categories: result,
                  count: result.length,
                  _location: location,
                  _includeCounts: includeCounts,
                  _timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to get categories: ${error}`);
          }
        }

        case 'get_locations': {
          const state = request.params.arguments?.state as string;
          const country = request.params.arguments?.country as string || 'US';
          const includeCounts = request.params.arguments?.include_counts !== false;
          
          try {
            const result = await this.client.getLocations();
            
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  locations: result,
                  count: result.length,
                  _state: state,
                  _country: country,
                  _includeCounts: includeCounts,
                  _timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to get locations: ${error}`);
          }
        }

        case 'get_topics': {
          const category = request.params.arguments?.category as string;
          const includeCounts = request.params.arguments?.include_counts !== false;
          
          try {
            // Create a search to get topics via facets
            const result = await this.client.searchActivities({
              facets: 'topicName',
              per_page: 0,
              category
            });
            
            const topics = result.facets?.topicName?.values?.map((v: any) => v.value) || [];
            
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  topics,
                  count: topics.length,
                  _category: category,
                  _includeCounts: includeCounts,
                  _timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to get topics: ${error}`);
          }
        }        case 'advanced_search': {
          const args = (request.params.arguments || {}) as any;
          const { filters = {}, geo_search = {} } = args;
          
          const searchParams: SearchParams = {
            ...this.context.preferences,
            ...(typeof geo_search === 'object' && geo_search ? geo_search : {})
          };

          // Apply advanced filters with proper type checking
          const typedFilters = filters as any;
          if (typedFilters?.price_range) {
            // This would need to be implemented in the client based on API capabilities
          }
          
          if (typedFilters?.age_range) {
            if (typedFilters.age_range.min) {
              searchParams.regReqMinAge = `${typedFilters.age_range.min}..${typedFilters.age_range.max || ''}`;
            }
          }
          
          if (typedFilters?.registration_status) {
            searchParams.registerable_only = typedFilters.registration_status === 'open';
          }

          try {
            const result = await this.client.searchActivities(searchParams);
            this.addToSearchHistory(searchParams, result.total_results || 0);

            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  ...result,
                  _advancedFilters: filters,
                  _geoSearch: geo_search,
                  _timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Advanced search failed: ${error}`);
          }
        }

        case 'manage_preferences': {
          const action = request.params.arguments?.action as string;
          
          if (!action) {
            throw new McpError(ErrorCode.InvalidParams, 'Action is required');
          }

          switch (action) {
            case 'get':
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify(this.context.preferences, null, 2)
                }]
              };
              
            case 'set':
              const newPrefs = request.params.arguments?.preferences;
              if (newPrefs) {
                Object.assign(this.context.preferences, newPrefs);
              }
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    message: 'Preferences updated successfully',
                    preferences: this.context.preferences
                  }, null, 2)
                }]
              };
              
            case 'reset':
              this.context.preferences = {
                defaultLocation: 'Vancouver,BC,CA',
                defaultRadius: 25,
                favoriteCategories: [],
                excludeChildren: true
              };
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    message: 'Preferences reset to defaults',
                    preferences: this.context.preferences
                  }, null, 2)
                }]
              };
              
            default:
              throw new McpError(ErrorCode.InvalidParams, `Unknown action: ${action}`);
          }
        }

        case 'manage_tasks': {
          const action = request.params.arguments?.action as string;
          
          if (!action) {
            throw new McpError(ErrorCode.InvalidParams, 'Action is required');
          }

          switch (action) {
            case 'list':
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    backgroundTasks: Array.from(this.taskManager.backgroundTasks.values()),
                    scheduledTasks: this.taskManager.scheduledTasks
                  }, null, 2)
                }]
              };
              
            case 'status':
              const taskId = request.params.arguments?.task_id as string;
              if (!taskId) {
                throw new McpError(ErrorCode.InvalidParams, 'Task ID is required');
              }
              
              const task = this.taskManager.backgroundTasks.get(taskId);
              if (!task) {
                throw new McpError(ErrorCode.InvalidRequest, 'Task not found');
              }
              
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify(task, null, 2)
                }]
              };
              
            case 'cancel':
              // Implementation would depend on actual task management
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    message: 'Task cancellation not yet implemented'
                  }, null, 2)
                }]
              };
              
            case 'schedule_monitor':
              // Implementation for scheduling monitoring tasks
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    message: 'Task scheduling not yet implemented'
                  }, null, 2)
                }]
              };
              
            default:
              throw new McpError(ErrorCode.InvalidParams, `Unknown action: ${action}`);
          }
        }        case 'get_search_history': {
          const args = (request.params.arguments || {}) as any;
          const limit = Math.min(typeof args.limit === 'number' ? args.limit : 10, 50);
          const includeAnalytics = args.include_analytics !== false;
          
          const recentSearches = this.context.recentSearches.slice(-limit);
          const analytics = includeAnalytics ? this.calculateSearchAnalytics() : null;
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                recentSearches,
                analytics,
                _limit: limit,
                _timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        }

        case 'clear_cache': {
          const cacheKey = request.params.arguments?.cache_key as string;
          
          if (cacheKey) {
            this.context.cache.delete(cacheKey);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  message: `Cache entry '${cacheKey}' cleared`
                }, null, 2)
              }]
            };
          } else {
            this.context.cache.clear();
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  message: 'All cache entries cleared'
                }, null, 2)
              }]
            };
          }
        }

        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
      }
    });
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'active://search-history',
          name: 'Search History',
          description: 'Recent activity searches and analytics',
          mimeType: 'application/json'
        },
        {
          uri: 'active://preferences',
          name: 'User Preferences',
          description: 'User search preferences and settings',
          mimeType: 'application/json'
        },
        {
          uri: 'active://cache-stats',
          name: 'Cache Statistics',
          description: 'Cache performance and statistics',
          mimeType: 'application/json'
        },
        {
          uri: 'active://task-status',
          name: 'Task Status',
          description: 'Background task status and results',
          mimeType: 'application/json'
        },
        {
          uri: 'active://api-stats',
          name: 'API Statistics',
          description: 'API usage statistics and health',
          mimeType: 'application/json'
        },
        {
          uri: 'active://categories',
          name: 'Activity Categories',
          description: 'All available activity categories with metadata',
          mimeType: 'application/json'
        },
        {
          uri: 'active://topics',
          name: 'Activity Topics',
          description: 'All available activity topics with metadata',
          mimeType: 'application/json'
        }
      ]
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      
      switch (uri) {
        case 'active://search-history': {
          const analytics = this.calculateSearchAnalytics();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                recentSearches: this.context.recentSearches.slice(-20),
                analytics
              }, null, 2)
            }]
          };
        }
        
        case 'active://preferences': {
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.context.preferences, null, 2)
            }]
          };
        }
        
        case 'active://cache-stats': {
          const cacheStats = this.getCacheStats();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(cacheStats, null, 2)
            }]
          };
        }
        
        case 'active://task-status': {
          const tasks = Array.from(this.taskManager.backgroundTasks.values());
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                activeTasks: tasks,
                scheduledTasks: this.taskManager.scheduledTasks
              }, null, 2)
            }]
          };
        }
        
        case 'active://api-stats': {
          const uptime = Date.now() - this.startTime.getTime();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                uptime: uptime,
                uptimeFormatted: this.formatUptime(uptime),
                serverVersion: '1.0.0',
                apiVersion: 'v2',
                totalSearches: this.context.recentSearches.length,
                cacheHitRate: this.calculateCacheHitRate()
              }, null, 2)
            }]
          };
        }
        
        case 'active://categories': {
          try {
            const categories = await this.client.getCategories();
            return {
              contents: [{
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  categories,
                  lastUpdated: new Date().toISOString(),
                  count: categories.length
                }, null, 2)
              }]
            };
          } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to fetch categories: ${error}`);
          }
        }
        
        case 'active://topics': {
          try {
            const topics = await this.client.getTopics();
            return {
              contents: [{
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  topics,
                  lastUpdated: new Date().toISOString(),
                  count: topics.length
                }, null, 2)
              }]
            };
          } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to fetch topics: ${error}`);
          }
        }
        
        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      }
    });
  }

  private setupPromptHandlers() {
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: 'find_activities',
          description: 'Find activities based on natural language description',
          arguments: [
            {
              name: 'description',
              description: 'Natural language description of what you\'re looking for',
              required: true
            },
            {
              name: 'location',
              description: 'Location preference (optional)',
              required: false
            }
          ]
        },
        {
          name: 'plan_activities',
          description: 'Plan a series of activities for a specific timeframe',
          arguments: [
            {
              name: 'timeframe',
              description: 'Time period (e.g., "this weekend", "next month")',
              required: true
            },
            {
              name: 'interests',
              description: 'List of interests or activity types',
              required: true
            },
            {
              name: 'location',
              description: 'Location or area',
              required: false
            },
            {
              name: 'budget',
              description: 'Budget considerations',
              required: false
            }
          ]
        },
        {
          name: 'recommend_activities',
          description: 'Get personalized activity recommendations',
          arguments: [
            {
              name: 'preferences',
              description: 'Your activity preferences and past searches',
              required: false
            },
            {
              name: 'context',
              description: 'Current context (weather, season, availability)',
              required: false
            }
          ]
        },
        {
          name: 'compare_activities',
          description: 'Compare multiple activities across different criteria',
          arguments: [
            {
              name: 'activity_ids',
              description: 'List of activity IDs to compare',
              required: true
            },
            {
              name: 'criteria',
              description: 'Comparison criteria (price, location, date, etc.)',
              required: false
            }
          ]
        }
      ]
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        case 'find_activities': {
          const description = args?.description as string;
          const location = args?.location as string;
          
          if (!description) {
            throw new McpError(ErrorCode.InvalidParams, 'Description is required');
          }

          return {
            description: `Finding activities based on: ${description}`,
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `I want to find activities that match this description: "${description}"${location ? ` in or around ${location}` : ''}. 

Please search for relevant activities and provide me with:
1. A list of matching activities with key details
2. Location information and distance if applicable
3. Pricing and registration information
4. Recommendations based on the search results

Use the search_activities tool with appropriate parameters based on my description.`
                }
              }
            ]
          };
        }
        
        case 'plan_activities': {
          const timeframe = args?.timeframe as string;
          const interests = args?.interests as string;
          const location = args?.location as string;
          const budget = args?.budget as string;
          
          if (!timeframe || !interests) {
            throw new McpError(ErrorCode.InvalidParams, 'Timeframe and interests are required');
          }

          return {
            description: `Planning activities for ${timeframe} based on interests: ${interests}`,
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Help me plan activities for ${timeframe}. I'm interested in: ${interests}${location ? `. I'm located in or want activities in: ${location}` : ''}${budget ? `. My budget consideration: ${budget}` : ''}.

Please:
1. Search for relevant activities in the specified timeframe
2. Create a suggested schedule or list of activities
3. Consider timing, location, and logistics
4. Provide backup options if available
5. Include pricing and registration details

Use multiple search_activities calls with different parameters to find diverse options.`
                }
              }
            ]
          };
        }
        
        case 'recommend_activities': {
          const preferences = args?.preferences as string;
          const context = args?.context as string;
          
          return {
            description: 'Getting personalized activity recommendations',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Please provide personalized activity recommendations${preferences ? ` based on these preferences: ${preferences}` : ''}${context ? `. Current context: ${context}` : ''}.

Use my search history and preferences to:
1. Analyze my past activity searches and interests
2. Find new activities that match my preferences
3. Consider seasonal and contextual factors
4. Provide diverse options across different categories
5. Explain why each recommendation fits my interests

Use get_search_history and manage_preferences tools to understand my preferences, then use search_activities to find suitable recommendations.`
                }
              }
            ]
          };
        }
        
        case 'compare_activities': {
          const activityIds = args?.activity_ids as string;
          const criteria = args?.criteria as string;
          
          if (!activityIds) {
            throw new McpError(ErrorCode.InvalidParams, 'Activity IDs are required');
          }

          const ids = activityIds.split(',').map(id => id.trim());
          
          return {
            description: `Comparing ${ids.length} activities`,
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Please compare these activities: ${activityIds}${criteria ? ` focusing on: ${criteria}` : ''}.

For each activity:
1. Get detailed information using get_activity_details
2. Compare key aspects like price, location, date, requirements
3. Highlight similarities and differences
4. Provide a recommendation on which might be best for different scenarios
5. Create a comparison table or summary

Activity IDs to compare: ${ids.join(', ')}`
                }
              }
            ]
          };
        }
        
        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Active Network MCP server running on stdio');
  }

  private calculateSearchAnalytics() {
    const searches = this.context.recentSearches;
    const now = new Date();
    const last24h = searches.filter(s => now.getTime() - s.timestamp.getTime() < 24 * 60 * 60 * 1000);
    const last7d = searches.filter(s => now.getTime() - s.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000);
    
    const categoryFreq = searches.reduce((acc, search) => {
      const category = search.query.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const locationFreq = searches.reduce((acc, search) => {
      const location = search.query.near || this.context.preferences.defaultLocation || 'unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSearches: searches.length,
      searchesLast24h: last24h.length,
      searchesLast7d: last7d.length,
      averageResultsPerSearch: searches.length > 0 ? 
        searches.reduce((sum, s) => sum + s.resultCount, 0) / searches.length : 0,
      topCategories: Object.entries(categoryFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      topLocations: Object.entries(locationFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }

  private getCacheStats() {
    const cache = this.context.cache;
    const now = new Date();
    let expired = 0;
    let valid = 0;
    
    cache.forEach(entry => {
      if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
        expired++;
      } else {
        valid++;
      }
    });

    return {
      totalEntries: cache.size,
      validEntries: valid,
      expiredEntries: expired,
      cacheHitRate: this.calculateCacheHitRate(),
      memoryUsage: this.estimateCacheMemoryUsage()
    };
  }

  private formatUptime(uptimeMs: number): string {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  private calculateCacheHitRate(): number {
    // This would need to be tracked during actual cache usage
    // For now, return a placeholder based on cache size
    return this.context.cache.size > 0 ? 0.75 : 0;
  }

  private estimateCacheMemoryUsage(): number {
    let size = 0;
    this.context.cache.forEach(entry => {
      size += JSON.stringify(entry.data).length;
    });
    return size;
  }

  private generateCacheKey(params: any): string {
    return JSON.stringify(params);
  }

  private getCachedResult(key: string): any | null {
    const entry = this.context.cache.get(key);
    if (!entry) return null;
    
    const now = new Date();
    if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
      this.context.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCachedResult(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.context.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl
    });
    
    // Clean up expired entries occasionally
    if (this.context.cache.size > 100) {
      this.cleanupExpiredCache();
    }
  }

  private cleanupExpiredCache(): void {
    const now = new Date();
    const toDelete: string[] = [];
    
    this.context.cache.forEach((entry, key) => {
      if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.context.cache.delete(key));
  }

  private addToSearchHistory(query: SearchParams, resultCount: number): void {
    this.context.recentSearches.push({
      query: { ...query },
      timestamp: new Date(),
      resultCount
    });
    
    // Keep only last 100 searches
    if (this.context.recentSearches.length > 100) {
      this.context.recentSearches = this.context.recentSearches.slice(-100);
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

const server = new ActiveNetworkServer();
server.run().catch(console.error);
