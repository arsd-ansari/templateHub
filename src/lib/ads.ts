/** Ads only on a template download page or a full blog guide — not listings or empty categories. */
export function shouldLoadAds(pathname: string) {
  const path = (pathname.split("?")[0] || "/").replace(/\/$/, "") || "/";
  if (path.startsWith("/templates/") && path !== "/templates") return true;
  if (path.startsWith("/blog/") && path !== "/blog") return true;
  return false;
}
