export const documents = {
	title: "Documents",
	home: {
		title: "Documents Overview",
		statusCard: {
			title: "Document Status",
			description: "Overview of document signatures",
			comingSoon: "Coming soon",
		},
		activityCard: {
			title: "Recent Activity", 
			description: "Latest document submissions",
			comingSoon: "Coming soon",
		},
	},
	templates: {
		title: "Document Templates",
		description: "Available templates for document signatures",
		table: {
			name: "Name",
			folder: "Folder",
			created: "Created",
			updated: "Updated",
			status: "Status",
			active: "Active",
			archived: "Archived",
		},
		empty: "No templates available",
		error: {
			title: "Failed to load templates",
			description: "Please try again later",
		},
	},
	submissions: {
		title: "Document Submissions",
		description: "Track document signature requests and their status",
		table: {
			submitter: "Submitter",
			email: "Email",
			status: "Status",
			sent: "Sent",
			opened: "Opened",
			completed: "Completed",
		},
		status: {
			pending: "Pending",
			sent: "Sent",
			opened: "Opened",
			completed: "Completed",
		},
		empty: "No submissions found",
		error: {
			title: "Failed to load submissions",
			description: "Please try again later",
		},
	},
	tabs: {
		home: "Home",
		templates: "Templates",
		submissions: "Submissions",
	},
} as const;