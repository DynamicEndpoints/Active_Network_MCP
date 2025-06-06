---
name: 🐛 Bug Report
about: Report a bug in the Active Network MCP server (Copilot-optimized)
title: '[BUG] '
labels: ['bug', 'needs-triage']
assignees: ''
---

## 🐛 Bug Description
<!-- Provide a clear and concise description of the bug -->

**What happened:**

**Expected behavior:**

**Actual behavior:**

## 🔄 Reproduction Steps
<!-- Step-by-step instructions to reproduce the issue -->
1. 
2. 
3. 
4. 

## 💻 Environment Details
**System Information:**
- OS: <!-- e.g., Windows 11, macOS 14.0, Ubuntu 22.04 -->
- Node.js version: <!-- Run: node --version -->
- npm version: <!-- Run: npm --version -->
- TypeScript version: <!-- Run: npx tsc --version -->

**MCP Server Information:**
- Active Network MCP version: <!-- Check package.json version -->
- MCP SDK version: <!-- Check package.json dependencies -->
- API Key configured: <!-- Yes/No (don't share the actual key) -->

**Client/IDE Information:**
- MCP Client: <!-- e.g., Claude Desktop, VS Code, Custom -->
- IDE: <!-- e.g., VS Code 1.85.0, Cursor, etc. -->
- GitHub Copilot: <!-- Enabled/Disabled, version if known -->

## 📋 Logs and Error Messages
<!-- Include relevant logs, error messages, or stack traces -->
```
<!-- Paste logs here -->
```

**Console output:**
```
<!-- Paste console output here -->
```

**MCP Inspector output (if applicable):**
```
<!-- Run: npm run inspector and paste relevant output -->
```

## 🔍 Additional Context
**Configuration:**
- Custom preferences set: <!-- Yes/No -->
- Cache enabled: <!-- Yes/No -->
- Background tasks running: <!-- Yes/No -->

**Related:**
- [ ] This is a regression (worked before)
- [ ] This affects multiple tools
- [ ] This affects specific API endpoints
- [ ] This is related to rate limiting
- [ ] This is related to authentication

## 🤖 For Copilot Assistance
**When fixing this issue:**
- [ ] Check error handling in `src/active-network-server/index.ts`
- [ ] Verify API client implementation in `src/active-network-client.ts`
- [ ] Review type definitions in `src/types/active-network.ts`
- [ ] Test with MCP inspector: `npm run inspector`
- [ ] Update CHANGELOG.md with fix details
- [ ] Add regression test if applicable

**Suggested investigation areas:**
- [ ] Tool parameter validation
- [ ] API response parsing
- [ ] Cache management
- [ ] Error propagation
- [ ] Rate limiting logic
