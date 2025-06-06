# Knowledge Base - Active Network MCP Server

This document provides comprehensive technical knowledge for LLMs to understand and continue development of the Active Network MCP Server project.

## 📋 Project Overview

### Purpose
The Active Network MCP Server is a Model Context Protocol implementation that provides intelligent access to Active Network's extensive database of recreational activities and events. It serves as a bridge between LLM applications and the Active Network API v2, offering advanced features like context management, task orchestration, and intelligent recommendations.

### Architecture Philosophy
- **Stateful Context Management**: Maintains user preferences and search history
- **Intelligent Caching**: Reduces API calls while keeping data fresh
- **Task Orchestration**: Handles background operations and scheduling
- **Extensible Design**: Modular architecture for easy feature additions
- **Type Safety**: Full TypeScript implementation with strict typing

## 🏗️ Technical Architecture

### Core Components

#### 1. ActiveNetworkServer (Main Class)
- **Location**: `src/active-network-server/index.ts`
- **Responsibilities**:
  - MCP protocol implementation
  - Tool, resource, and prompt handlers
  - Context and task management
  - Cache management
  - Analytics and monitoring

#### 2. ActiveNetworkClient (API Client)
- **Location**: `src/active-network-client.ts`
- **Responsibilities**:
  - HTTP communication with Active Network API
  - Rate limiting and retry logic
  - Error handling and logging
  - Request/response transformation

#### 3. Type Definitions
- **Location**: `src/types/active-network.ts`
- **Contents**:
  - API request/response interfaces
  - Search parameters and filters
  - Cache and context structures

### Data Flow
```
LLM Request → MCP Server → Tool Handler → API Client → Active Network API
                ↓
Cache Check → Context Update → Response Formation → LLM Response
```

## 🛠️ Implementation Details

### Tool Handlers
Each tool handler follows this pattern:
1. **Input Validation**: Type checking and parameter validation
2. **Context Application**: Apply user preferences and defaults
3. **Cache Check**: Look for existing cached results
4. **API Call**: Make request to Active Network if needed
5. **Context Update**: Update search history and analytics
6. **Cache Update**: Store results for future use
7. **Response Formation**: Format response for MCP protocol

### Context Management
```typescript
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
```

### Task Management
```typescript
interface TaskManager {
  backgroundTasks: Map<string, {
    id: string;
    type: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
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
```

## 🔧 Active Network API Integration

### Base Configuration
- **Base URL**: `https://api.amp.active.com/v2/`
- **Authentication**: API key in query parameter `api_key`
- **Rate Limits**: 1000 requests per hour (configurable)
- **Response Format**: JSON

### Key Endpoints
1. **Search**: `/search` - Main activity search
2. **Details**: `/asset/{id}` - Activity details
3. **Categories**: `/search/categories` - Available categories
4. **Locations**: `/search/geography_list` - Location data
5. **Topics**: `/search/topics` - Activity topics

### Search Parameters
```typescript
interface SearchParams {
  query?: string;           // Search term
  near?: string;           // Location (city, state, zip)
  radius?: number;         // Search radius in miles
  latitude?: number;       // GPS coordinates
  longitude?: number;
  current_page?: number;   // Pagination
  per_page?: number;       // Results per page (max 50)
  category?: string;       // Activity category
  topic?: string;          // Activity topic
  exclude_children?: boolean;
  start_date?: string;     // Date filters
  end_date?: string;
  meta?: string;           // Additional metadata
  bbox?: string;           // Bounding box search
}
```

## 📊 Feature Implementation Patterns

### Adding New Tools
1. **Define Schema**: Add tool definition in `setupToolHandlers()`
2. **Implement Handler**: Add case in tool handler switch
3. **Add Types**: Update interfaces in `types/active-network.ts`
4. **Update Client**: Add API method if needed
5. **Test Integration**: Verify with MCP inspector

### Adding New Resources
1. **Register Resource**: Add to `setupResourceHandlers()`
2. **Implement Handler**: Create resource case handler
3. **Data Source**: Connect to appropriate data source
4. **Update Documentation**: Add to README and this knowledge base

### Adding New Prompts
1. **Define Prompt**: Add to `setupPromptHandlers()`
2. **Implement Logic**: Create prompt generation logic
3. **Test Scenarios**: Verify with different parameter combinations

## 🎯 Best Practices

### Error Handling
- Always use `McpError` with appropriate error codes
- Provide meaningful error messages
- Log errors for debugging
- Implement fallback mechanisms

### Performance Optimization
- Cache frequently accessed data
- Use appropriate TTL values
- Clean up expired cache entries
- Monitor memory usage

### Type Safety
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Validate inputs at runtime
- Use type guards for API responses

### Code Organization
- Keep handlers focused and single-purpose
- Extract common logic into utility functions
- Maintain clear separation of concerns
- Document complex algorithms

## 🔍 Debugging and Testing

### Development Tools
- **MCP Inspector**: `npm run inspector` for interactive testing
- **Watch Mode**: `npm run watch` for development
- **TypeScript Compilation**: `npm run build`

### Common Issues
1. **API Key Missing**: Check `ACTIVE_NETWORK_API_KEY` environment variable
2. **Rate Limiting**: Implement exponential backoff
3. **Cache Issues**: Check TTL and cleanup logic
4. **Type Errors**: Verify interface definitions

### Testing Strategies
- Test each tool individually
- Verify error handling scenarios
- Test with various parameter combinations
- Monitor API response changes

## 🚀 Extension Points

### Easy Additions
- **New Search Filters**: Add to `SearchParams` interface
- **Additional Analytics**: Extend analytics calculation
- **New Cache Strategies**: Implement different TTL policies
- **More Prompt Templates**: Add specialized prompt generators

### Advanced Extensions
- **Multi-Provider Support**: Abstract API client interface
- **Real-time Updates**: WebSocket integration
- **Machine Learning**: Recommendation algorithms
- **Mobile Integration**: Location services
- **Calendar Integration**: Event scheduling

## 📈 Monitoring and Analytics

### Key Metrics
- Search frequency and patterns
- Cache hit rates
- API response times
- Error rates
- User preference trends

### Performance Monitoring
```typescript
private calculateSearchAnalytics() {
  // Track search patterns
  // Monitor cache performance
  // Analyze user behavior
  // Generate insights
}
```

## 🔄 Maintenance Guidelines

### Regular Tasks
1. **Update Dependencies**: Keep MCP SDK and other deps current
2. **Monitor API Changes**: Watch for Active Network API updates
3. **Cache Cleanup**: Implement periodic cache maintenance
4. **Log Analysis**: Review error logs and performance metrics

### Version Management
- Follow semantic versioning
- Update CHANGELOG.md for all changes
- Tag releases appropriately
- Maintain backward compatibility

### Documentation Updates
- Keep README.md current with features
- Update this knowledge base with changes
- Document new patterns and practices
- Maintain API documentation

## 🔒 Security Considerations

### API Key Management
- Never commit API keys to version control
- Use environment variables
- Implement key rotation if needed
- Monitor API key usage

### Input Validation
- Sanitize all user inputs
- Validate parameter ranges
- Prevent injection attacks
- Implement rate limiting

### Data Privacy
- Don't log sensitive user data
- Implement proper cache cleanup
- Consider data retention policies
- Follow privacy best practices

## 📝 Development Workflow

### Making Changes
1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Implement Changes**: Follow coding standards
3. **Update Tests**: Add/modify tests as needed
4. **Update Documentation**: README, CHANGELOG, this file
5. **Test Thoroughly**: Use MCP inspector and manual testing
6. **Submit PR**: Include detailed description

### Code Review Checklist
- [ ] TypeScript compilation successful
- [ ] All tools tested with inspector
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Performance considerations addressed

## 🎓 Learning Resources

### MCP Protocol
- [Official MCP Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Examples](https://github.com/modelcontextprotocol/servers)

### Active Network API
- [Developer Portal](https://developer.active.com/)
- [API Reference](https://developer.active.com/docs)
- [Best Practices Guide](https://developer.active.com/best-practices)

### TypeScript & Node.js
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**This knowledge base should be updated with every significant change to maintain accuracy for future development.**
