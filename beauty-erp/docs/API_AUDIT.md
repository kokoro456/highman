# API Hook & Endpoint Audit Report

**Date:** 2026-03-25
**Scope:** All frontend hooks (`apps/b2b-web/src/hooks/`) and API endpoints (`apps/api/src/*/`)

---

## 1. Suspected Duplications - Detailed Analysis

### 1.1 `useStaff()` vs `useSettlement()` - Staff data fetched twice

| Hook | Endpoint | Data Returned |
|------|----------|--------------|
| `useStaff()` | `GET /staff` | Full staff list (id, name, role, phone, email, color, specialties, schedules) |
| `useSettlement(month)` | `GET /staff/settlement?month=YYYY-MM` | Staff settlement list (staffId, name, role, totalBookings, totalRevenue, incentiveAmount, baseSalary, totalPay) |

**Finding: PARTIAL OVERLAP**
- Both return `name` and `role` for each staff member.
- `useStaff()` returns profile/contact data; `useSettlement()` returns financial/performance data.
- The settlement endpoint redundantly includes `name` and `role` (needed for standalone use).
- **No action needed.** These serve distinct purposes. The `name`/`role` overlap in settlement is intentional for display without requiring a join on the frontend. React Query caches both independently.

### 1.2 `useDashboardOverview()` vs `usePaymentSummary()`

| Hook | Endpoint | Data Returned |
|------|----------|--------------|
| `useDashboardOverview()` | `GET /dashboard/overview` | todayRevenue, todayTransactions, todayBookings, todayNewCustomers, todayNoShows, weekRevenue, totalCustomers |
| `usePaymentSummary(date)` | `GET /payments/summary?date=DATE` | Payment summary for a specific date |

**Finding: MINOR OVERLAP**
- `useDashboardOverview()` includes `todayRevenue` and `todayTransactions` which overlaps with `usePaymentSummary(today)`.
- Dashboard overview is a pre-aggregated "at a glance" endpoint; payment summary is a date-specific detailed summary used on the payments page.
- **Recommendation:** Acceptable overlap. Dashboard overview is optimized as a single query. Consolidating would either slow the dashboard or over-fetch on the payments page.

### 1.3 `useUpcomingBookings()` vs `useBookings(date)`

| Hook | Endpoint | Data Returned |
|------|----------|--------------|
| `useUpcomingBookings(limit)` | `GET /dashboard/upcoming-bookings?limit=N` | Next N upcoming bookings from now |
| `useBookings(date)` | `GET /bookings?date=DATE` | All bookings for a specific date |

**Finding: DIFFERENT PURPOSE, NO DUPLICATION**
- `useUpcomingBookings` returns future bookings sorted by start time (cross-day).
- `useBookings` returns all bookings for a specific calendar date (including completed/cancelled).
- These are fundamentally different queries. No consolidation needed.

### 1.4 `useMyShops()` vs `useShop(id)`

| Hook | Endpoint | Data Returned |
|------|----------|--------------|
| `useMyShops()` | `GET /shops` | List of all shops owned by user |
| `useShop(id)` | `GET /shops/:id` | Single shop detail |

**Finding: STANDARD LIST/DETAIL PATTERN**
- This is a standard REST pattern (list vs. detail).
- `useMyShops()` has a 10-minute staleTime, and `useShop()` also has a 10-minute staleTime.
- **Recommendation:** Could share data if `useMyShops()` returns full details. Consider `initialData` from list cache for detail view. Low priority since shop data is rarely fetched.

### 1.5 `useUnreadNotificationCount()` vs `useNotifications()`

| Hook | Endpoint | Data Returned |
|------|----------|--------------|
| `useUnreadNotificationCount()` | `GET /notifications/count` | `{ count: number }` |
| `useNotifications(params)` | `GET /notifications?...` | Full notification list with meta (includes total) |

**Finding: INTENTIONAL SEPARATION**
- Count endpoint is lightweight (used in nav badge, polls every 60s).
- List endpoint returns full notification objects (used only on notifications page).
- **No action needed.** The count endpoint avoids transferring full notification payloads for the badge.

---

## 2. `useStaffStats()` vs `useSettlement()` vs `useStaffPerformance()`

| Hook | Endpoint | Data Returned |
|------|----------|--------------|
| `useStaffStats(id, start, end)` | `GET /staff/:id/stats` | Individual staff stats for a date range |
| `useSettlement(month)` | `GET /staff/settlement?month=YYYY-MM` | All staff settlement for a month |
| `useStaffSettlement(staffId, month)` | `GET /staff/:id/settlement?month=YYYY-MM` | Individual staff settlement detail (includes serviceBreakdown, dailyRevenue, incentiveBreakdown) |
| `useStaffPerformance(start, end)` | `GET /dashboard/staff-performance` | Staff performance for dashboard |

**Finding: OVERLAPPING STAFF PERFORMANCE DATA**
- `useStaffStats` and `useStaffSettlement` serve the same staff but from different angles (raw stats vs. settlement with pay calculations).
- `useStaffPerformance` (dashboard) likely aggregates similar data as `useSettlement` but for different display context.
- **Recommendation:** Consider whether `useStaffStats` is still needed now that `useStaffSettlement` provides richer data. If `useStaffStats` is not used anywhere, it can be deprecated.

---

## 3. Report Hooks vs Dashboard Hooks

| Hook | Endpoint |
|------|----------|
| `useRevenueReport(year, month)` | `GET /dashboard/reports/revenue` |
| `useRevenueChart(days)` | `GET /dashboard/revenue-chart` |

**Finding: DIFFERENT AGGREGATION**
- `useRevenueChart` returns daily data points for the last N days (chart visualization).
- `useRevenueReport` returns monthly summary with comparison data (report page).
- No duplication; different aggregation levels for different UI needs.

---

## 4. Hooks That Could Share Data (via React Query)

### Recommended Consolidations

| Current | Recommendation | Priority |
|---------|----------------|----------|
| `useStaffStats()` | Deprecate if unused; replaced by `useStaffSettlement()` | Medium |
| `useMyShops()` + `useShop(id)` | Use `initialData` from list cache in detail hook | Low |
| `useStaff()` (staff list) + `useSettlement()` (settlement list) | Keep separate but consider a combined hook for staff management page that fetches both in parallel | Low |

### Hooks With No Overlap (Clean)

- `useCustomers` / `useCustomer` - standard list/detail
- `useServices` / `useServiceCategories` - separate concerns
- `useInventory` / `useInventoryLogs` - separate concerns
- `useCoupons` / `useCoupon` - standard list/detail
- `useMessages` / `useMessageStats` / `useMessageTemplates` - separate concerns
- `useMembershipCards` / `usePointBalance` / `usePointHistory` - separate concerns
- `usePhotos` - standalone
- `useBookings` / `useBookingsByRange` - same endpoint, different params
- PG hooks (`useClientKey`, `useCreateOrder`, `useConfirmPayment`, `usePgHistory`) - standalone

---

## 5. Summary

| Category | Count |
|----------|-------|
| Total hook files | 18 |
| Total unique query hooks | ~35 |
| True duplications found | 0 |
| Partial overlaps (acceptable) | 3 |
| Deprecation candidates | 1 (`useStaffStats`) |
| Optimization opportunities | 2 (shop data sharing, staff list+settlement parallel fetch) |

**Overall Assessment:** The API hook architecture is clean with minimal duplication. The overlaps that exist are intentional (lightweight count endpoints, dashboard aggregation vs. page-specific data). The main actionable item is evaluating whether `useStaffStats()` is still in use and can be replaced by `useStaffSettlement()`.
