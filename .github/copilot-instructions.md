# GitHub Copilot Instructions - Active Network MCP Server

## Project Context
This is a TypeScript MCP server for Active Network API integration with advanced context management and task orchestration.

## Code Standards
- Use strict TypeScript with full type safety
- Implement comprehensive error handling with McpError
- Follow MCP protocol patterns from @modelcontextprotocol/sdk
- Add input validation for all tool parameters
- Update CHANGELOG.md for feature additions

## Architecture Patterns
- Tool handlers in switch statements with validation
- Cache management with TTL and cleanup
- Context tracking for user preferences and history
- API client with rate limiting and retry logic

## Active Network API
- Base URL: https://api.amp.active.com/v2/
- Authentication via api_key query parameter
- Rate limit: 1000 requests/hour
- Response format: JSON with nested activity data

## Common Operations
- Search activities: query, near, radius, category parameters
- Get details: asset ID with full activity information
- Categories/locations: list endpoints with counts
- Cache results with 5-minute default TTL

## Testing
- Use MCP inspector: npm run inspector
- Validate tool schemas and responses
- Test error scenarios and edge cases
