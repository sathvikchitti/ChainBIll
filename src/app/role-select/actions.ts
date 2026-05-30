'use server'

// This is now a thin wrapper — real onboarding logic lives in /api/onboarding
// kept for compatibility with the existing role-select page

export async function updateUserRole(
  _userId: string,
  _role: string
): Promise<{ redirectTo: string }> {
  // No-op: the role-select page should call /api/onboarding directly.
  // This function should not be reached; see role-select/page.tsx
  const dashboardMap: Record<string, string> = {
    SUPPLIER: '/supplier/dashboard',
    BUYER: '/buyer/pending-confirmations',
    INVESTOR: '/investor/marketplace',
  }
  const upper = _role.toUpperCase()
  return { redirectTo: dashboardMap[upper] ?? '/' }
}
