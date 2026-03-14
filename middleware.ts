import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isProtectedRoute =
		pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

	if (isProtectedRoute) {
		const sessionToken =
			request.cookies.get("better-auth.session_token")?.value ||
			request.cookies.get("__Secure-better-auth.session_token")?.value;
		if (!sessionToken) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
	runtime: "nodejs",
};
