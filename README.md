# Active Network MCP Server

A comprehensive Model Context Protocol (MCP) server that provides intelligent access to Active Network's activity and event data. This server offers advanced context management, task orchestration, and smart recommendations for finding and managing recreational activities.

## 🌟 Features

### Core Functionality
- **Complete Active Network API v2 Integration** - Access to thousands of activities and events
- **Intelligent Search** - Natural language queries with smart filtering
- **Context Management** - Remembers user preferences and search history
- **Task Orchestration** - Background task management and scheduling
- **Advanced Analytics** - Search patterns and usage insights
- **Smart Caching** - Optimized performance with intelligent cache management

### Tools Available (15+)
- `search_activities` - Search with advanced filtering and preferences
- `get_activity_details` - Detailed activity information and registration data
- `get_categories` - Browse activity categories with counts
- `get_locations` - Location-based activity discovery
- `get_topics` - Activity topics and themes
- `advanced_search` - Multi-criteria search with complex filters
- `manage_preferences` - User preference management
- `manage_tasks` - Background task orchestration
- `get_search_history` - Analytics and search patterns
- `clear_cache` - Cache management utilities

### Resources
- `active://search-history` - Real-time search history and analytics
- `active://preferences` - User preferences and settings
- `active://cache-stats` - Cache performance metrics
- `active://task-status` - Background task monitoring
- `active://categories` - Live category data
- `active://topics` - Live topic information

### Prompts
- `find_activities` - Natural language activity search assistant
- `plan_activities` - Activity planning for specific timeframes
- `recommend_activities` - Personalized activity recommendations
- `compare_activities` - Side-by-side activity comparison

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Active Network API key
- TypeScript knowledge (for development)

### Installation

1. **Clone and install**:
```bash
git clone https://github.com/DynamicEndpoints/Active_Network_MCP.git
cd Active_Network_MCP
npm install
```

2. **Set up environment**:
```bash
export ACTIVE_NETWORK_API_KEY=your_api_key_here
# Or create a .env file:
echo "ACTIVE_NETWORK_API_KEY=your_api_key_here" > .env
```

3. **Build and run**:
```bash
npm run build
npm start
```

### Development Mode
```bash
npm run watch    # Build in watch mode
npm run inspector # Test with MCP inspector
```

## 📋 API Key Setup

Get your Active Network API key:
1. Visit [Active Network Developer Portal](https://developer.active.com/)
2. Create an account and request API access
3. Copy your API key to the environment variable

## 🔧 Configuration

The server supports various configuration options through environment variables:

```bash
ACTIVE_NETWORK_API_KEY=your_key_here  # Required
CACHE_TTL=300000                      # Cache TTL in ms (default: 5min)
MAX_CACHE_SIZE=100                    # Max cache entries (default: 100)
DEFAULT_LOCATION=Vancouver,BC,CA      # Default search location
DEFAULT_RADIUS=25                     # Default search radius in miles
```

## 🏗️ Architecture

### Project Structure
```
src/
├── active-network-server/
│   └── index.ts              # Main MCP server implementation
├── active-network-client.ts  # Enhanced API client
└── types/
    └── active-network.ts     # TypeScript definitions
```

### Key Components
- **ActiveNetworkServer** - Main MCP server class with context management
- **ActiveNetworkClient** - HTTP client with rate limiting and error handling
- **SearchContext** - User preferences and search history management
- **TaskManager** - Background task orchestration
- **Cache System** - Intelligent caching with TTL and cleanup

## 🛠️ Development

### Building
```bash
npm run build     # Compile TypeScript
npm run prepare   # Build for distribution
```

### Testing
```bash
npm run inspector # Interactive MCP testing
```

### Code Quality
- Full TypeScript strict mode
- Comprehensive error handling
- Input validation and sanitization
- Rate limiting and API best practices

## 📊 Usage Examples

### Basic Activity Search
```typescript
// Using the search_activities tool
{
  "name": "search_activities",
  "arguments": {
    "query": "hiking",
    "near": "Seattle,WA",
    "radius": 50,
    "per_page": 10
  }
}
```

### Natural Language Planning
```typescript
// Using the plan_activities prompt
{
  "name": "plan_activities",
  "arguments": {
    "timeframe": "this weekend",
    "interests": "outdoor activities, family-friendly",
    "location": "Portland, OR",
    "budget": "under $100 per person"
  }
}
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Update** CHANGELOG.md with your changes
5. **Push** to branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Add comprehensive error handling
- Update tests for new features
- Document public APIs
- Update CHANGELOG.md for all changes

## 📈 Performance

- **Caching**: Intelligent TTL-based caching reduces API calls
- **Rate Limiting**: Respects Active Network API limits
- **Error Recovery**: Automatic retry with exponential backoff
- **Memory Management**: Automatic cache cleanup and optimization

## 🔒 Security

- Input validation and sanitization
- Environment variable protection
- No hardcoded credentials
- Secure HTTP client configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/DynamicEndpoints/Active_Network_MCP/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DynamicEndpoints/Active_Network_MCP/discussions)
- **Documentation**: See [KNOWLEDGE.md](KNOWLEDGE.md) for detailed technical information

## 📚 Related

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Active Network API Documentation](https://developer.active.com/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)

---

**Made with ❤️ for the MCP ecosystem**
