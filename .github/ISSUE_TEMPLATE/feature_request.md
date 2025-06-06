---
name: ✨ Feature Request
about: Suggest a new feature or enhancement (Copilot-optimized)
title: '[FEATURE] '
labels: ['enhancement', 'needs-review']
assignees: ''
---

## ✨ Feature Summary
<!-- Provide a clear and concise description of the feature -->

**Feature name:**

**Brief description:**

## 🎯 Problem Statement
<!-- What problem does this feature solve? -->

**Current limitation:**

**User impact:**

**Use case scenarios:**
1. 
2. 
3. 

## 💡 Proposed Solution
<!-- Describe your proposed solution in detail -->

**Implementation approach:**

**API changes needed:**
- [ ] New MCP tools
- [ ] New MCP resources
- [ ] New MCP prompts
- [ ] Client API methods
- [ ] Type definitions

**User interface changes:**
- [ ] New tool parameters
- [ ] New response formats
- [ ] New error handling
- [ ] Configuration options

## 🏗️ Technical Specifications
**Affected Components:**
- [ ] MCP Server (`src/active-network-server/index.ts`)
- [ ] API Client (`src/active-network-client.ts`)
- [ ] Type Definitions (`src/types/active-network.ts`)
- [ ] Build/Configuration
- [ ] Documentation

**New Dependencies:**
- [ ] No new dependencies required
- [ ] Runtime dependencies: <!-- List any new npm packages -->
- [ ] Development dependencies: <!-- List any new dev packages -->

**API Integration:**
- [ ] Uses existing Active Network API endpoints
- [ ] Requires new API endpoints: <!-- List endpoints -->
- [ ] Requires API key permissions: <!-- List permissions -->
- [ ] Rate limiting considerations: <!-- Describe impact -->

**Data Flow:**
```
<!-- Describe the data flow for this feature -->
User Request → MCP Tool → API Client → Active Network API → Response Processing → User
```

## 🔧 Implementation Guidelines
**For Copilot-assisted development:**

**Required files to modify:**
1. `src/active-network-server/index.ts` - Add tool handler
2. `src/active-network-client.ts` - Add API method
3. `src/types/active-network.ts` - Add type definitions
4. `CHANGELOG.md` - Document the change
5. `KNOWLEDGE.md` - Update knowledge base

**Tool schema template:**
```typescript
{
  name: 'new_tool_name',
  description: 'Tool description',
  inputSchema: {
    type: 'object',
    properties: {
      // Define parameters
    },
    required: []
  }
}
```

**Implementation checklist:**
- [ ] Add tool registration in server constructor
- [ ] Implement tool handler in handleListTools
- [ ] Add input validation
- [ ] Add error handling with McpError
- [ ] Add caching if applicable
- [ ] Add analytics tracking
- [ ] Update context/preferences if needed
- [ ] Add comprehensive JSDoc comments

## 🧪 Testing Requirements
**Test scenarios:**
- [ ] Valid input parameters
- [ ] Invalid input parameters
- [ ] API error responses
- [ ] Rate limiting scenarios
- [ ] Cache behavior
- [ ] Error handling

**MCP Inspector testing:**
- [ ] Tool appears in tool list
- [ ] Tool schema validates correctly
- [ ] Tool executes successfully
- [ ] Error responses are properly formatted

## 📚 Documentation Updates
- [ ] Update README.md with new tool
- [ ] Add usage examples
- [ ] Update API documentation
- [ ] Add troubleshooting guide if needed

## 🔀 Alternatives Considered
<!-- What alternative solutions did you consider? -->

**Alternative 1:**

**Alternative 2:**

**Why this approach is preferred:**

## 🎨 User Experience
**Expected workflow:**
1. User invokes tool with: `tool_name(param1="value1")`
2. Tool validates parameters
3. Tool calls Active Network API
4. Tool returns formatted response
5. User receives actionable results

**Success criteria:**
- [ ] Tool is discoverable
- [ ] Parameters are intuitive
- [ ] Responses are useful
- [ ] Error messages are clear
- [ ] Performance is acceptable

## 📋 Additional Context
**Priority level:**
- [ ] Critical (blocking other work)
- [ ] High (important for users)
- [ ] Medium (nice to have)
- [ ] Low (future consideration)

**Related issues/PRs:**
<!-- Link any related issues or pull requests -->

**External references:**
<!-- Link to Active Network API docs, user requests, etc. -->
