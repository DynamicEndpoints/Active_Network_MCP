---
name: 🤖 Copilot Task
about: Structured task template for GitHub Copilot coding assistance
title: '[COPILOT] '
labels: ['copilot-task', 'enhancement']
assignees: ''
---

## 🤖 Copilot Task Description
<!-- Clear, specific task for Copilot to understand and execute -->

**Task type:**
- [ ] Add new MCP tool
- [ ] Fix existing functionality
- [ ] Optimize performance
- [ ] Add error handling
- [ ] Refactor code
- [ ] Add tests
- [ ] Update documentation
- [ ] Add type safety

**Primary objective:**

**Expected outcome:**

## 📋 Requirements Specification
**Functional requirements:**
1. 
2. 
3. 

**Technical requirements:**
- [ ] Must follow TypeScript strict mode
- [ ] Must use MCP SDK patterns
- [ ] Must include error handling with McpError
- [ ] Must validate input parameters
- [ ] Must update CHANGELOG.md
- [ ] Must maintain backward compatibility

**Code quality requirements:**
- [ ] Add comprehensive JSDoc comments
- [ ] Follow existing code patterns
- [ ] Include input validation
- [ ] Handle edge cases
- [ ] Follow naming conventions

## 🎯 Implementation Context
**Files to modify:**
- [ ] `src/active-network-server/index.ts`
- [ ] `src/active-network-client.ts`
- [ ] `src/types/active-network.ts`
- [ ] `package.json`
- [ ] `CHANGELOG.md`
- [ ] `KNOWLEDGE.md`

**Existing patterns to follow:**
```typescript
// Tool handler pattern
case 'tool_name': {
  const args = (request.params.arguments || {}) as any;
  
  // Validation
  if (!args.required_param) {
    throw new McpError(ErrorCode.InvalidParams, 'required_param is required');
  }
  
  // Implementation
  const result = await this.client.methodName(args);
  
  // Cache if applicable
  if (useCache) {
    this.setCachedResult(cacheKey, result);
  }
  
  // Return response
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}
```

## 🔧 Technical Specifications
**API integration:**
- Base URL: `https://api.amp.active.com/v2/`
- Authentication: Query parameter `api_key`
- Rate limit: 1000 requests/hour
- Response format: JSON

**Type definitions needed:**
```typescript
interface NewInterface {
  // Define structure
}
```

**Error handling approach:**
- Use McpError with appropriate ErrorCode
- Provide helpful error messages
- Log errors for debugging
- Graceful degradation where possible

## 🧪 Testing Instructions
**Manual testing steps:**
1. Build the project: `npm run build`
2. Run MCP inspector: `npm run inspector`
3. Test the new functionality
4. Verify error handling
5. Check response format

**Test cases to cover:**
- [ ] Valid input parameters
- [ ] Missing required parameters
- [ ] Invalid parameter types
- [ ] API error responses
- [ ] Network failures
- [ ] Rate limiting
- [ ] Empty responses

## 📚 Documentation Requirements
**Code documentation:**
- Add JSDoc comments for all new functions
- Include parameter descriptions
- Document return types
- Add usage examples

**Knowledge base updates:**
- Update KNOWLEDGE.md with new patterns
- Document API integration details
- Add troubleshooting information
- Include implementation notes

## 💡 Implementation Hints for Copilot
**Key considerations:**
1. Follow the existing switch-case pattern in tool handlers
2. Use the ActiveNetworkClient for API calls
3. Apply the same caching strategy as other tools
4. Use proper TypeScript types from `src/types/active-network.ts`
5. Follow the error handling pattern with McpError
6. Add the tool to the tools array in server constructor

**Common patterns in codebase:**
- Input validation: `if (!args.param) throw new McpError(...)`
- API calls: `await this.client.methodName(params)`
- Caching: `this.getCachedResult()` and `this.setCachedResult()`
- Response format: `{ content: [{ type: 'text', text: JSON.stringify(...) }] }`

## ✅ Acceptance Criteria
**Done when:**
- [ ] New functionality works as specified
- [ ] All tests pass
- [ ] Code follows project patterns
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] No TypeScript errors
- [ ] MCP inspector validates the changes
- [ ] Error handling is comprehensive

**Quality gates:**
- [ ] Code review passes
- [ ] Manual testing successful
- [ ] No breaking changes introduced
- [ ] Performance impact is minimal
