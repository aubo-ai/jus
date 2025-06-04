import { auth } from "@/utils/auth";
import { db } from "@comp/db";
import { createI18nMiddleware } from "next-international/middleware";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const config = {
	runtime: "nodejs",
	matcher: [
		// Skip auth-related routes
		"/((?!api|_next/static|_next/image|favicon.ico|monitoring|ingest|onboarding|research).*)",
	],
};

const I18nMiddleware = createI18nMiddleware({
	locales: ["en", "es"],
	defaultLocale: "es",
	urlMappingStrategy: "rewrite",
});

export async function middleware(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const response = I18nMiddleware(request as any);
	const nextUrl = request.nextUrl;

	const pathnameLocale = nextUrl.pathname.split("/", 2)?.[1];

	const pathnameWithoutLocale = pathnameLocale
		? nextUrl.pathname.slice(pathnameLocale.length + 1)
		: nextUrl.pathname;

	const newUrl = new URL(pathnameWithoutLocale || "/", request.url);

	// Add x-path-name
	response.headers.set("x-pathname", newUrl.pathname);

	// 1. Not authenticated
	if (!session && newUrl.pathname !== "/auth") {
		const url = new URL("/auth", request.url);

		return NextResponse.redirect(url);
	}

	// 2. Authenticated; redirect to onboarding if not completed
	if (session) {
		// 2.1. If the user has an active organization, redirect to implementation
		if (
			session.session.activeOrganizationId &&
			newUrl.pathname !== "/auth" &&
			!newUrl.pathname.startsWith("/setup/onboarding")
		) {
			const isOnboarded = await db.onboarding.findFirst({
				where: {
					organizationId: session.session
						.activeOrganizationId as string,
				},
			});

			if (!isOnboarded?.completed) {
				return NextResponse.redirect(
					new URL("/setup/onboarding", request.url),
				);
			}
		}
	}

	return response;
}
