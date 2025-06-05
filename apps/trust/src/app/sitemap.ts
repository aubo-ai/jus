import { cache } from "react";
import { db } from "@comp/db";
import type { MetadataRoute } from "next";

const baseUrl = "https://trust.inc";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Check if we're in a build environment with dummy database
	const isDummyDatabase = process.env.DATABASE_URL?.includes("dummy");
	
	if (!isDummyDatabase) {
		const organizations = await getOrganizations();
		
		return [
			{
				url: baseUrl,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 1,
			},
			...organizations,
		];
	}
	
	// Return only base URL during build time with dummy database
	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
	];
}

const getOrganizations = cache(async () => {
	try {
		const published = await db.trust.findMany({
			where: {
				status: "published",
			},
			select: {
				friendlyUrl: true,
				organizationId: true,
			},
		});

		return published.map((trust) => ({
			url: `${baseUrl}/${trust.friendlyUrl ?? trust.organizationId}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		}));
	} catch (error) {
		console.warn("Failed to fetch organizations for sitemap:", error);
		return [];
	}
});
