import { NextResponse } from "next/server";

const DOCUSEAL_API_URL = process.env.DOCUSEAL_API_URL || "https://contratos.jus.cl/api";
const DOCUSEAL_API_TOKEN = process.env.DOCUSEAL_API_TOKEN;

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	
	if (!DOCUSEAL_API_TOKEN) {
		return NextResponse.json(
			{ error: "DocuSeal API token not configured" },
			{ status: 500 }
		);
	}

	try {
		const response = await fetch(`${DOCUSEAL_API_URL}/submissions/${id}`, {
			headers: {
				Accept: "application/json",
				"X-Auth-Token": DOCUSEAL_API_TOKEN,
			},
			method: "GET",
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("DocuSeal API Error:", errorText);
			return NextResponse.json(
				{ error: `Failed to fetch submission: ${response.status}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching submission:", error);
		return NextResponse.json(
			{ error: "Failed to fetch submission details" },
			{ status: 500 }
		);
	}
}