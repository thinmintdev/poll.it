# Critical Type Error Analysis

## Priority 1: Route Handler Async Params Issue
**Files:** `src/app/api/analytics/[pollId]/export/route.ts`, `src/app/api/analytics/[pollId]/route.ts`
**Error:** Next.js 15 requires async params destructuring

## Priority 2: Missing Type Declarations
**Files:** `src/lib/analytics-utils.ts`, `src/lib/export-utils.ts`
**Errors:**
- Missing types for `lodash.debounce` and `lodash.throttle`
- Missing analytics library import (`getPollAnalytics`, `getDailyAnalytics`)
- `numbro` library configuration errors
- `rate-limiter-flexible` keyGenerator type issues

## Priority 3: Unsafe 'any' Types
**Files:** `src/app/api/analytics/[pollId]/export/route.ts`
**Errors:**
- Object.values() operations with unknown types
- Array reduce operations without proper typing

## Priority 4: Chart Configuration Type Conflicts
**Files:** Chart components
**Errors:**
- Chart.js scales property conflicts between chart types

## Quick Fix Plan:
1. Fix route handler params (async/await)
2. Add missing type declarations
3. Fix array operations with proper typing
4. Add missing analytics imports