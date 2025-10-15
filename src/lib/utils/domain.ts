/**
 * Get the admin subdomain URL based on current domain
 * In production: https://admin.agrinvest.vn
 * In development: http://admin.localhost:3001
 */
export function getAdminUrl(): string {
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // If we're on localhost, use admin.localhost with port
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//admin.localhost${port ? ':' + port : ''}`;
  }
  
  // In production, extract the base domain and add admin subdomain
  // e.g., agrinvest.vn -> admin.agrinvest.vn
  const parts = hostname.split('.');
  
  // If already on a subdomain, replace it with admin
  if (parts.length >= 2) {
    const baseDomain = parts.slice(-2).join('.');
    return `${protocol}//admin.${baseDomain}`;
  }
  
  return `${protocol}//admin.${hostname}`;
}
