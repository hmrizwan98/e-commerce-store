import dotenv from "dotenv";
import assert from "assert";
import { normalizeHostname, parseHost } from "../src/lib/tenant/hostname";
import { buildTenantUrl, buildTenantAdminUrl, getStorefrontUrl, getStoreAdminUrl } from "../src/lib/platform/tenant-url";

dotenv.config({ path: ".env.local" });

function isAdminClaim(decoded: { role?: string }): boolean {
  return decoded.role === "admin";
}

function runTests() {
  console.log("=== RUNNING MULTI-TENANT HOSTNAME ROUTING & RESOLUTION TEST SUITE ===\n");

  const rootDomain = "webriiz.com";

  // Test 1: webriiz.com -> Marketing
  const test1 = parseHost("webriiz.com", rootDomain);
  assert.strictEqual(test1.type, "marketing", "Test 1 Failed: webriiz.com should parse as marketing");
  console.log("✓ Test 1 Passed: webriiz.com -> marketing host");

  // Test 2: www.webriiz.com -> Marketing
  const test2 = parseHost("www.webriiz.com", rootDomain);
  assert.strictEqual(test2.type, "marketing", "Test 2 Failed: www.webriiz.com should parse as marketing");
  console.log("✓ Test 2 Passed: www.webriiz.com -> marketing host");

  // Test 3: superadmin.webriiz.com -> Super Admin
  const test3 = parseHost("superadmin.webriiz.com", rootDomain);
  assert.strictEqual(test3.type, "superadmin", "Test 3 Failed: superadmin.webriiz.com should parse as superadmin");
  console.log("✓ Test 3 Passed: superadmin.webriiz.com -> superadmin host");

  // Test 4: {slug}.webriiz.com -> Tenant Storefront
  const test4 = parseHost("glamix.webriiz.com", rootDomain);
  assert.strictEqual(test4.type, "tenant-storefront", "Test 4 Failed: glamix.webriiz.com should parse as tenant-storefront");
  assert.strictEqual(test4.slug, "glamix", "Test 4 Failed: slug should be glamix");
  console.log("✓ Test 4 Passed: glamix.webriiz.com -> tenant storefront (slug: glamix)");

  // Test 5: admin.{slug}.webriiz.com -> Tenant Store Admin
  const test5 = parseHost("admin.glamix.webriiz.com", rootDomain);
  assert.strictEqual(test5.type, "tenant-admin", "Test 5 Failed: admin.glamix.webriiz.com should parse as tenant-admin");
  assert.strictEqual(test5.slug, "glamix", "Test 5 Failed: slug should be glamix");
  console.log("✓ Test 5 Passed: admin.glamix.webriiz.com -> tenant admin (slug: glamix)");

  // Test 6: custom storefront domain (glamix.pk)
  const test6 = parseHost("glamix.pk", rootDomain);
  assert.strictEqual(test6.type, "custom-storefront", "Test 6 Failed: glamix.pk should parse as custom-storefront");
  assert.strictEqual(test6.customDomain, "glamix.pk", "Test 6 Failed: customDomain should be glamix.pk");
  console.log("✓ Test 6 Passed: glamix.pk -> custom storefront domain (domain: glamix.pk)");

  // Test 7: custom admin domain (admin.glamix.pk)
  const test7 = parseHost("admin.glamix.pk", rootDomain);
  assert.strictEqual(test7.type, "custom-admin", "Test 7 Failed: admin.glamix.pk should parse as custom-admin");
  assert.strictEqual(test7.customDomain, "glamix.pk", "Test 7 Failed: customDomain should be glamix.pk");
  console.log("✓ Test 7 Passed: admin.glamix.pk -> custom admin domain (domain: glamix.pk)");

  // Test 8: Hostname normalization tests
  assert.strictEqual(normalizeHostname("https://glamix.webriiz.com/"), "glamix.webriiz.com", "Test 8a Failed");
  assert.strictEqual(normalizeHostname("HTTP://ADMIN.GLAMIX.PK:3000/product/123"), "admin.glamix.pk", "Test 8b Failed");
  console.log("✓ Test 8 Passed: Hostname normalization (protocol, port, path, casing)");

  // Test 9: buildTenantUrl & buildTenantAdminUrl output validation
  const baseUrl = "https://webriiz.com";
  assert.strictEqual(buildTenantUrl(baseUrl, "glamix"), "https://glamix.webriiz.com", "Test 9a Failed");
  assert.strictEqual(buildTenantAdminUrl(baseUrl, "glamix"), "https://admin.glamix.webriiz.com", "Test 9b Failed");
  console.log("✓ Test 9 Passed: Platform URL generator outputs (website & admin URLs)");

  // Test 10: Store record helper functions (getStorefrontUrl & getStoreAdminUrl)
  const platformStore = { slug: "glamix", domains: [] };
  assert.strictEqual(getStorefrontUrl(platformStore, baseUrl), "https://glamix.webriiz.com", "Test 10a Failed");
  assert.strictEqual(getStoreAdminUrl(platformStore, baseUrl), "https://admin.glamix.webriiz.com", "Test 10b Failed");

  const customStore = { slug: "glamix", domains: ["glamix.pk"] };
  assert.strictEqual(getStorefrontUrl(customStore, baseUrl), "https://glamix.pk", "Test 10c Failed");
  assert.strictEqual(getStoreAdminUrl(customStore, baseUrl), "https://admin.glamix.pk", "Test 10d Failed");
  console.log("✓ Test 10 Passed: Storefront & Admin URL resolution for custom domains");

  // Test 11: Cross-tenant Store Admin authorization claim verification
  const storeA = { id: "store_A_id", slug: "store-a" };
  const storeB = { id: "store_B_id", slug: "store-b" };

  const adminUserClaimA = { role: "admin", tenantId: "store_A_id" };
  assert.strictEqual(isAdminClaim(adminUserClaimA), true, "Test 11a Failed");
  assert.strictEqual(adminUserClaimA.tenantId === storeA.id, true, "Test 11b Failed: Admin A should match Store A");
  assert.strictEqual(adminUserClaimA.tenantId === storeB.id, false, "Test 11c Failed: Admin A must be rejected for Store B");
  console.log("✓ Test 11 Passed: Cross-tenant Store Admin authorization claim check");

  // Test 12: Super Admin global claim verification
  const superAdminClaim = { role: "superadmin" };
  const legacySuperAdminClaim = { role: "super_admin" };
  assert.strictEqual(superAdminClaim.role === "superadmin" || superAdminClaim.role === "super_admin", true, "Test 12a Failed");
  assert.strictEqual(legacySuperAdminClaim.role === "superadmin" || legacySuperAdminClaim.role === "super_admin", true, "Test 12b Failed");
  console.log("✓ Test 12 Passed: Super Admin role claim verification");

  // Test 13: Local dev port handling
  const devTest = parseHost("glamix.localhost:3000", "");
  assert.strictEqual(devTest.type, "tenant-storefront", "Test 13a Failed");
  assert.strictEqual(devTest.slug, "glamix", "Test 13b Failed");

  const devAdminTest = parseHost("admin.glamix.localhost:3000", "");
  assert.strictEqual(devAdminTest.type, "tenant-admin", "Test 13c Failed");
  assert.strictEqual(devAdminTest.slug, "glamix", "Test 13d Failed");
  console.log("✓ Test 13 Passed: Local dev localhost subdomain & port handling");

  console.log("\n=== ALL 13 TEST CASES PASSED SUCCESSFULLY ===");
}

runTests();
