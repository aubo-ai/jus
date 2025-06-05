const DOCUSEAL_API_URL = process.env.DOCUSEAL_API_URL || "https://contratos.jus.cl/api";
const DOCUSEAL_API_TOKEN = process.env.DOCUSEAL_API_TOKEN;

interface DocuSealTemplate {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
	folder_name?: string;
	archived_at?: string | null;
}

interface DocuSealTemplatesResponse {
	data: DocuSealTemplate[];
	pagination: {
		count: number;
		next: number;
		prev: number;
	};
}

interface DocuSealSubmitter {
	id: number;
	email: string;
	slug: string;
	sent_at: string;
	opened_at?: string;
	completed_at?: string;
	created_at: string;
	updated_at: string;
	name?: string;
	phone?: string;
	status: "pending" | "sent" | "opened" | "completed";
	role?: string;
	external_id?: string;
	metadata?: Record<string, any>;
}

interface DocuSealSubmission {
	id: number;
	created_at: string;
	updated_at: string;
	archived_at?: string | null;
	source: string;
	submitters: DocuSealSubmitter[];
	template: {
		id: number;
		name: string;
	};
}

interface DocuSealSubmissionsResponse {
	data: DocuSealSubmission[];
	pagination: {
		count: number;
		next: number;
		prev: number;
	};
}

class DocuSealClient {
	private headers = {
		Accept: "application/json",
		"X-Auth-Token": DOCUSEAL_API_TOKEN || "",
	};

	private validateConfig() {
		if (!DOCUSEAL_API_TOKEN) {
			throw new Error("DOCUSEAL_API_TOKEN environment variable is not set");
		}
	}

	async getTemplates(): Promise<DocuSealTemplate[]> {
		this.validateConfig();
		try {
			console.log("Fetching templates from:", `${DOCUSEAL_API_URL}/templates`);
			console.log("Headers:", { ...this.headers, "X-Auth-Token": "[REDACTED]" });
			
			const response = await fetch(`${DOCUSEAL_API_URL}/templates`, {
				headers: this.headers,
				method: 'GET',
			});

			console.log("Response status:", response.status, response.statusText);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("API Error Response:", errorText);
				throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText} - ${errorText}`);
			}

			const responseData: DocuSealTemplatesResponse = await response.json();
			console.log("Templates received:", responseData?.data?.length || 0);
			console.log("Full response:", JSON.stringify(responseData, null, 2));
			return responseData.data;
		} catch (error) {
			console.error("Error fetching DocuSeal templates:", error);
			// Log more details about the error
			if (error instanceof Error) {
				console.error("Error name:", error.name);
				console.error("Error message:", error.message);
				console.error("Error stack:", error.stack);
			}
			throw error;
		}
	}

	async getSubmissions(): Promise<DocuSealSubmission[]> {
		this.validateConfig();
		try {
			console.log("Fetching submissions from:", `${DOCUSEAL_API_URL}/submissions`);
			
			const response = await fetch(`${DOCUSEAL_API_URL}/submissions`, {
				headers: this.headers,
				method: 'GET',
			});

			console.log("Submissions response status:", response.status, response.statusText);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("API Error Response:", errorText);
				throw new Error(`Failed to fetch submissions: ${response.status} ${response.statusText} - ${errorText}`);
			}

			const responseData: DocuSealSubmissionsResponse = await response.json();
			console.log("Submissions received:", responseData?.data?.length || 0);
			return responseData.data;
		} catch (error) {
			console.error("Error fetching DocuSeal submissions:", error);
			if (error instanceof Error) {
				console.error("Error name:", error.name);
				console.error("Error message:", error.message);
				console.error("Error stack:", error.stack);
			}
			throw error;
		}
	}
}

export const docusealClient = new DocuSealClient();
export type { DocuSealTemplate, DocuSealSubmission, DocuSealSubmitter };