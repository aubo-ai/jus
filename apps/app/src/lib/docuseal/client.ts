const DOCUSEAL_API_URL = "https://contratos.jus.cl/api";
const DOCUSEAL_API_TOKEN = "RCRhkaeQtdZ4vFxmxmGS79FpfBf7j3CwTfjJwBk8eAV";

interface DocuSealTemplate {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
	folder_name?: string;
	archived_at?: string | null;
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

class DocuSealClient {
	private headers = {
		Accept: "application/json",
		"X-Auth-Token": DOCUSEAL_API_TOKEN,
	};

	async getTemplates(): Promise<DocuSealTemplate[]> {
		try {
			const response = await fetch(`${DOCUSEAL_API_URL}/templates`, {
				headers: this.headers,
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch templates: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching DocuSeal templates:", error);
			throw error;
		}
	}

	async getSubmissions(): Promise<DocuSealSubmission[]> {
		try {
			const response = await fetch(`${DOCUSEAL_API_URL}/submissions`, {
				headers: this.headers,
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch submissions: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching DocuSeal submissions:", error);
			throw error;
		}
	}
}

export const docusealClient = new DocuSealClient();
export type { DocuSealTemplate, DocuSealSubmission, DocuSealSubmitter };