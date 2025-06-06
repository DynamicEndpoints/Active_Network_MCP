---
name: 📋 Sample Issue - Copilot Best Practices
about: Example issue demonstrating best practices for Copilot assistance
title: '[EXAMPLE] Add activity comparison tool with multiple criteria'
labels: ['example', 'copilot-task', 'enhancement']
assignees: ''
---

> **Note: This is a sample issue demonstrating best practices for creating Copilot-friendly issues.**

## 🤖 Copilot Task Description
Add a new MCP tool called `compare_activities` that allows users to compare multiple activities side-by-side using various criteria such as price, location, dates, and requirements.

**Task type:** Add new MCP tool

**Primary objective:** Enable users to make informed decisions by comparing activities with structured, side-by-side analysis

**Expected outcome:** A new MCP tool that accepts activity IDs and comparison criteria, returning a formatted comparison table

## 📋 Requirements Specification
**Functional requirements:**
1. Accept 2-10 activity IDs for comparison
2. Support comparison criteria: price, location, dates, age requirements, difficulty level
3. Return structured comparison data in a readable format
4. Handle cases where some data is missing for certain activities
5. Provide recommendation based on comparison results

**Technical requirements:**
- [ ] Must follow TypeScript strict mode ✓
- [ ] Must use MCP SDK patterns ✓
- [ ] Must include error handling with McpError ✓
- [ ] Must validate input parameters ✓
- [ ] Must update CHANGELOG.md ✓
- [ ] Must maintain backward compatibility ✓

**Code quality requirements:**
- [ ] Add comprehensive JSDoc comments ✓
- [ ] Follow existing code patterns ✓
- [ ] Include input validation ✓
- [ ] Handle edge cases ✓
- [ ] Follow naming conventions ✓

## 🎯 Implementation Context
**Files to modify:**
- [x] `src/active-network-server/index.ts` - Add tool registration and handler
- [x] `src/active-network-client.ts` - Add getActivityDetails method (if not exists)
- [x] `src/types/active-network.ts` - Add comparison interfaces
- [x] `CHANGELOG.md` - Document new feature
- [x] `KNOWLEDGE.md` - Update with new patterns

**Tool schema specification:**
```typescript
{
  name: 'compare_activities',
  description: 'Compare multiple activities side-by-side with various criteria',
  inputSchema: {
    type: 'object',
    properties: {
      activity_ids: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 10,
        description: 'Array of activity IDs to compare'
      },
      criteria: {
        type: 'array',
        items: { 
          type: 'string',
          enum: ['price', 'location', 'dates', 'age_requirements', 'difficulty', 'all']
        },
        description: 'Comparison criteria (default: all)'
      },
      include_recommendation: {
        type: 'boolean',
        description: 'Include AI recommendation based on comparison (default: true)'
      }
    },
    required: ['activity_ids']
  }
}
```

## 🔧 Technical Specifications
**API integration:**
- Uses existing `get_activity_details` endpoint for each activity
- Aggregates data for comparison
- No new API endpoints required
- Rate limiting: Consider bulk fetch optimization

**Type definitions needed:**
```typescript
interface ActivityComparison {
  activities: Array<{
    id: string;
    name: string;
    price?: number | string;
    location?: string;
    dates?: string[];
    age_requirements?: string;
    difficulty?: string;
    [key: string]: any;
  }>;
  criteria: string[];
  comparison_table: Record<string, any[]>;
  recommendation?: {
    best_overall: string;
    best_value: string;
    reasoning: string;
  };
}
```

**Implementation approach:**
1. Validate input parameters (2-10 activity IDs)
2. Fetch details for each activity using existing client method
3. Extract comparison data based on specified criteria
4. Format into comparison table structure
5. Generate recommendation if requested
6. Return formatted response

## 🧪 Testing Instructions
**Manual testing steps:**
1. Build: `npm run build`
2. Test with MCP inspector: `npm run inspector`
3. Try tool with valid activity IDs
4. Test error cases (invalid IDs, too many activities)
5. Verify comparison table format
6. Check recommendation quality

**Test cases to cover:**
- [x] 2 activities comparison
- [x] Maximum 10 activities
- [x] Invalid activity IDs
- [x] Missing activity data
- [x] Different criteria combinations
- [x] Empty criteria (should default to 'all')
- [x] Network failures during fetch

## 💡 Implementation Hints for Copilot
**Key implementation steps:**
1. Add tool to tools array in constructor
2. Add case 'compare_activities' in handleCallTool switch
3. Implement input validation following existing patterns
4. Use Promise.all for concurrent API calls
5. Format response consistently with other tools
6. Add appropriate error handling and logging

**Reusable patterns from codebase:**
```typescript
// Input validation pattern
const args = (request.params.arguments || {}) as any;
if (!args.activity_ids || !Array.isArray(args.activity_ids)) {
  throw new McpError(ErrorCode.InvalidParams, 'activity_ids must be an array');
}

// Concurrent API calls pattern
const activityPromises = args.activity_ids.map(id => 
  this.client.getActivityDetails(id).catch(error => ({ id, error }))
);
const activities = await Promise.all(activityPromises);

// Response format pattern
return {
  content: [{
    type: 'text',
    text: JSON.stringify(comparisonResult, null, 2)
  }]
};
```

## ✅ Acceptance Criteria
**Done when:**
- [x] Tool appears in MCP inspector tool list
- [x] Successfully compares 2-10 activities
- [x] Handles invalid activity IDs gracefully
- [x] Returns well-formatted comparison table
- [x] Provides meaningful recommendations
- [x] Updates CHANGELOG.md with new feature
- [x] No TypeScript compilation errors
- [x] Follows existing code patterns and style

**Quality gates:**
- [x] Manual testing with various inputs successful
- [x] Error handling covers edge cases
- [x] Response format is consistent and useful
- [x] Performance is acceptable for up to 10 activities
- [x] Documentation is updated

## 📚 Documentation Updates
**Required updates:**
- [x] Add tool description to README.md
- [x] Include usage example
- [x] Update KNOWLEDGE.md with implementation notes
- [x] Add JSDoc comments to new functions

**Example usage for documentation:**
```bash
# Compare two hiking activities
compare_activities(
  activity_ids=["12345", "67890"],
  criteria=["price", "location", "difficulty"],
  include_recommendation=true
)
```

---

> **For Copilot Users:** This example demonstrates how to create comprehensive, actionable issues that provide Copilot with all the context needed for successful implementation. Key elements include clear requirements, technical specifications, implementation hints, and acceptance criteria.
