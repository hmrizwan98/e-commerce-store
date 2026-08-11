import HomeContent from './HomeContent';
import { getCurrentTenant } from '@/lib/tenant/current';
import { isPlatformDomainRequest } from '@/lib/tenant/platform-domain';
import { metadata as platformMetadata } from './(marketing)/platform/page';
import type { Metadata } from 'next';

// Firestore is read at request time (via the Admin SDK) rather than at build
// time, since no Firebase project is configured until the setup guide is
// completed - see README.md "Firebase Setup Guide".
export const dynamic = 'force-dynamic';

/**
 * No tenant resolves for the bare root domain (no subdomain/custom-domain
 * match) - reuse the /platform page's own metadata there instead of the root
 * layout's {title:"Admin"} no-tenant fallback. When a tenant exists, return {}
 * so the layout's existing tenant-based title/favicon logic is unaffected.
 *
 * isPlatformDomainRequest() is checked first (see its own comment) so this
 * never asks getCurrentTenant() a question its local-dev fallback could
 * answer wrong for the platform's own domain.
 */
export async function generateMetadata(): Promise<Metadata> {
  if (isPlatformDomainRequest()) return platformMetadata;
  const tenant = await getCurrentTenant();
  return tenant ? {} : platformMetadata;
}

export default function PageHome() {
  return <HomeContent />;
}
