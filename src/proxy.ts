import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

import { routes } from "@/shared/lib/routes";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/w/")) {
    const cookie = getSessionCookie(request);

    if (!cookie) {
      return NextResponse.redirect(new URL(routes.signIn, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/w/:path*"],
};
