"use client";

import { Download, FileText, Search, X } from "lucide-react";
import { useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { formatDate } from "@/utils/format";
import { Button } from "@comp/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@comp/ui/card";
import { Input } from "@comp/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@comp/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@comp/ui/table";
import { Badge } from "@comp/ui/badge";
import { Mail, Eye, CheckCircle, Clock } from "lucide-react";
import type { DocuSealSubmission, DocuSealSubmitter } from "@/lib/docuseal/client";
import { useI18n } from "@/locales/client";

interface SubmissionsClientProps {
	submissions: DocuSealSubmission[];
}

export function SubmissionsClient({ submissions }: SubmissionsClientProps) {
	const t = useI18n();
	const [searchQuery, setSearchQuery] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsString.withDefault("all"),
	);
	const [templateFilter, setTemplateFilter] = useQueryState(
		"template",
		parseAsString.withDefault("all"),
	);
	const [downloadingSubmission, setDownloadingSubmission] = useState<number | null>(null);

	// Filter out archived submissions
	const nonArchivedSubmissions = submissions.filter(
		(submission) => !submission.archived_at
	);

	// Get unique templates for filter dropdown
	const uniqueTemplates = Array.from(
		new Set(nonArchivedSubmissions.map((s) => s.template.name))
	).sort();

	// Filter submissions based on search and filters
	const filteredSubmissions = nonArchivedSubmissions.filter((submission) => {
		// Search in template name and submitter emails/names
		const matchesSearch =
			submission.template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			submission.submitters.some(
				(submitter) =>
					submitter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(submitter.name && submitter.name.toLowerCase().includes(searchQuery.toLowerCase()))
			);

		// Status filter - check if any submitter matches the status
		const matchesStatus =
			statusFilter === "all" ||
			submission.submitters.some((submitter) => submitter.status === statusFilter);

		// Template filter
		const matchesTemplate =
			templateFilter === "all" || submission.template.name === templateFilter;

		return matchesSearch && matchesStatus && matchesTemplate;
	});

	// Function to check if submission has completed status
	const hasCompletedSubmitter = (submission: DocuSealSubmission) => {
		return submission.submitters.some((submitter) => submitter.status === "completed");
	};

	// Function to handle document download
	const handleDownload = async (submissionId: number) => {
		setDownloadingSubmission(submissionId);
		try {
			// Fetch submission details to get the combined_document_url
			const response = await fetch(`/api/docuseal/submissions/${submissionId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch submission details");
			}
			
			const data = await response.json();
			if (data.combined_document_url) {
				// Open the PDF in a new tab
				window.open(data.combined_document_url, "_blank");
			} else {
				console.error("No combined document URL found");
			}
		} catch (error) {
			console.error("Error downloading document:", error);
		} finally {
			setDownloadingSubmission(null);
		}
	};

	if (filteredSubmissions.length === 0 && nonArchivedSubmissions.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<FileText className="h-12 w-12 text-muted-foreground mb-4" />
				<p className="text-muted-foreground">{t("documents.submissions.empty")}</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex items-center gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={t("documents.submissions.filters.search")}
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value || null)}
					/>
					{searchQuery && (
						<Button
							variant="ghost"
							size="sm"
							className="absolute right-1 top-1 h-7 w-7 p-0"
							onClick={() => setSearchQuery(null)}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
				
				{/* Status Filter */}
				<Select
					value={statusFilter}
					onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder={t("documents.submissions.filters.all_statuses")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("documents.submissions.filters.all_statuses")}</SelectItem>
						<SelectItem value="pending">{t("documents.submissions.status.pending")}</SelectItem>
						<SelectItem value="sent">{t("documents.submissions.status.sent")}</SelectItem>
						<SelectItem value="opened">{t("documents.submissions.status.opened")}</SelectItem>
						<SelectItem value="completed">{t("documents.submissions.status.completed")}</SelectItem>
					</SelectContent>
				</Select>

				{/* Template Filter */}
				<Select
					value={templateFilter}
					onValueChange={(value) => setTemplateFilter(value === "all" ? null : value)}
				>
					<SelectTrigger className="w-[240px]">
						<SelectValue placeholder={t("documents.submissions.filters.all_templates")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("documents.submissions.filters.all_templates")}</SelectItem>
						{uniqueTemplates.map((template) => (
							<SelectItem key={template} value={template}>
								{template}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Submissions List */}
			{filteredSubmissions.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-8 text-center">
						<FileText className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground">{t("documents.submissions.no_results")}</p>
					</CardContent>
				</Card>
			) : (
				filteredSubmissions.map((submission) => (
					<Card key={submission.id}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-base">{submission.template.name}</CardTitle>
								<div className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground">
										{formatDate(submission.created_at)}
									</span>
									{hasCompletedSubmitter(submission) && (
										<Button
											size="icon"
											variant="ghost"
											onClick={() => handleDownload(submission.id)}
											disabled={downloadingSubmission === submission.id}
										>
											<Download className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("documents.submissions.table.submitter")}</TableHead>
										<TableHead>{t("documents.submissions.table.email")}</TableHead>
										<TableHead>{t("documents.submissions.table.status")}</TableHead>
										<TableHead>{t("documents.submissions.table.sent")}</TableHead>
										<TableHead>{t("documents.submissions.table.opened")}</TableHead>
										<TableHead>{t("documents.submissions.table.completed")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{submission.submitters.map((submitter) => (
										<TableRow key={submitter.id}>
											<TableCell>{submitter.name || "—"}</TableCell>
											<TableCell>{submitter.email}</TableCell>
											<TableCell>
												<StatusBadge status={submitter.status} />
											</TableCell>
											<TableCell>
												{submitter.sent_at ? (
													<div className="flex items-center gap-1">
														<Mail className="h-3 w-3" />
														{formatDate(submitter.sent_at)}
													</div>
												) : (
													"—"
												)}
											</TableCell>
											<TableCell>
												{submitter.opened_at ? (
													<div className="flex items-center gap-1">
														<Eye className="h-3 w-3" />
														{formatDate(submitter.opened_at)}
													</div>
												) : (
													"—"
												)}
											</TableCell>
											<TableCell>
												{submitter.completed_at ? (
													<div className="flex items-center gap-1">
														<CheckCircle className="h-3 w-3 text-green-600" />
														{formatDate(submitter.completed_at)}
													</div>
												) : (
													"—"
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				))
			)}
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const t = useI18n();
	const config = {
		pending: { label: t("documents.submissions.status.pending"), variant: "secondary" as const, icon: Clock },
		sent: { label: t("documents.submissions.status.sent"), variant: "outline" as const, icon: Mail },
		opened: { label: t("documents.submissions.status.opened"), variant: "warning" as const, icon: Eye },
		completed: { label: t("documents.submissions.status.completed"), variant: "default" as const, icon: CheckCircle },
	};

	const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.pending;

	return (
		<Badge variant={variant} className="gap-1">
			<Icon className="h-3 w-3" />
			{label}
		</Badge>
	);
}