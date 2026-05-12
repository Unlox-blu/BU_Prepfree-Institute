import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // deployement comment 
  
  // 1. Get raw host (e.g. institute.localhost:3000)
  const hostWithPort = req.headers.get("host") || "";
  
  // 2. Clean Hostname (remove port) -> institute.localhost
  const hostname = hostWithPort.split(':')[0];
  
  // 3. Clean Root Domain from Env OR Default to localhost
  // CHANGED: Using NEXT_PUBLIC_INSTITUTE_FRONTEND_URL
let rootDomainRaw = process.env.NEXT_PUBLIC_INSTITUTE_FRONTEND_URL || "localhost:3000";

let rootDomain = rootDomainRaw;

// Remove protocol if present
if (rootDomainRaw.startsWith("http://") || rootDomainRaw.startsWith("https://")) {
  rootDomain = new URL(rootDomainRaw).hostname; // → prepfree.in
} else {
  rootDomain = rootDomainRaw.split(":")[0];      // → localhost
}

  // 4. Detect Subdomain
  let currentSubdomain = null; 
  if (hostname.endsWith(rootDomain)) {
      const subdomainPart = hostname.replace(`.${rootDomain}`, "");
      if (subdomainPart && subdomainPart !== hostname && subdomainPart !== "www") {
          currentSubdomain = subdomainPart;
      }
  }

  // 5. Strict Institute Check — accept all valid white-label institute subdomains
  const VALID_INSTITUTE_SUBDOMAINS = ['institute', 'buinstitute'];
  if (currentSubdomain && currentSubdomain === 'buinstitute') {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-subdomain', 'buinstitute');

      if (url.pathname === '/login' || url.pathname === '/') {
          url.pathname = '/login';
          url.searchParams.set('subdomain', 'buinstitute');
          return NextResponse.rewrite(url, { headers: requestHeaders });
      }
      
      return NextResponse.next({
          request: { headers: requestHeaders },
      });
  }

  // 6. Handle Invalid Access
  if (url.pathname === '/login' || url.pathname === '/') {
      url.pathname = '/login';
      url.searchParams.set('subdomain', 'invalid'); 
      return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};