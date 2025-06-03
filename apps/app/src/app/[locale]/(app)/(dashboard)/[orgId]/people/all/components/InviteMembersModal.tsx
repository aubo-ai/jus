"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { validateRut, formatRut } from "@/lib/rut-validation";

import { bulkInviteMembers } from "../actions/bulkInviteMembers";
import type { ActionResponse } from "@/actions/types";
import { useI18n } from "@/locales/client";
import { Button } from "@comp/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@comp/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@comp/ui/form";
import { Input } from "@comp/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@comp/ui/tabs";
import { MultiRoleCombobox } from "./MultiRoleCombobox";
import { authClient } from "@/utils/auth-client";
import { addEmployeeWithoutInvite } from "../actions/addEmployeeWithoutInvite";

// --- Constants for Roles ---
const selectableRoles = [
	"admin",
	"auditor",
	"employee",
] as const satisfies Readonly<Role[]>;
type InviteRole = (typeof selectableRoles)[number];
const DEFAULT_ROLES: InviteRole[] = [];

// --- Schemas ---
const manualInviteSchema = z.object({
	email: z.string().email({ message: "Invalid email address." }),
	roles: z
		.array(z.enum(selectableRoles))
		.min(1, { message: "Please select at least one role." }),
	rut: z
		.string()
		.optional()
		.refine(
			(val) => !val || val === "" || validateRut(val),
			{ message: "Invalid RUT format" }
		),
});

// Define base schemas for each mode
const manualModeSchema = z.object({
	mode: z.literal("manual"),
	manualInvites: z
		.array(manualInviteSchema)
		.min(1, { message: "Please add at least one invite." }),
	csvFile: z.any().optional(), // Optional here, validated by union
});

const csvModeSchema = z.object({
	mode: z.literal("csv"),
	manualInvites: z.array(manualInviteSchema).optional(), // Optional here
	csvFile: z
		.any()
		.refine((val) => val instanceof FileList && val.length === 1, {
			message: "Please select a single CSV file.",
		}),
});

// Combine using discriminatedUnion
const formSchema = z.discriminatedUnion("mode", [
	manualModeSchema,
	csvModeSchema,
]);

type FormData = z.infer<typeof formSchema>;

interface InviteMembersModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
}

interface BulkInviteResultData {
	successfulInvites: number;
	failedItems: {
		input: string | { email: string; role: InviteRole | InviteRole[] };
		error: string;
	}[];
}

export function InviteMembersModal({
	open,
	onOpenChange,
	organizationId,
}: InviteMembersModalProps) {
	const t = useI18n();
	const router = useRouter();
	const [mode, setMode] = useState<"manual" | "csv">("manual");
	const [isLoading, setIsLoading] = useState(false);
	const [csvFileName, setCsvFileName] = useState<string | null>(null);
	const [lastResult, setLastResult] =
		useState<ActionResponse<BulkInviteResultData> | null>(null);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			mode: "manual",
			manualInvites: [
				{
					email: "",
					roles: DEFAULT_ROLES,
				},
			],
			csvFile: undefined,
		},
		mode: "onChange",
	});

	// Log form errors on change
	useEffect(() => {
		if (Object.keys(form.formState.errors).length > 0) {
			console.error("Form Validation Errors:", form.formState.errors);
		}
	}, [form.formState.errors]);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "manualInvites",
	});

	async function onSubmit(values: FormData) {
		console.log("onSubmit triggered", { values });
		setIsLoading(true);

		try {
			if (values.mode === "manual") {
				console.log("Processing manual mode");
				if (
					!values.manualInvites ||
					values.manualInvites.length === 0
				) {
					console.error("Manual mode validation failed: No invites.");
					toast.error("Please add at least one member to invite.");
					setIsLoading(false);
					return;
				}

				const invalidInvites = values.manualInvites.filter(
					(invite) => !invite.roles || invite.roles.length === 0,
				);
				if (invalidInvites.length > 0) {
					console.error(
						`Manual mode validation failed: No roles selected for: ${invalidInvites.map((i) => i.email || "invite").join(", ")}`,
					);
					toast.error(
						`Please select at least one role for: ${invalidInvites.map((i) => i.email || "invite").join(", ")}`,
					);
					setIsLoading(false);
					return;
				}

				// Process invitations client-side using authClient
				let successCount = 0;
				const failedInvites: { email: string; error: string }[] = [];

				// Process each invitation sequentially
				for (const invite of values.manualInvites) {
					const isEmployeeOnly =
						invite.roles.length === 1 &&
						invite.roles[0] === "employee";
					try {
						if (isEmployeeOnly) {
							await addEmployeeWithoutInvite({
								organizationId,
								email: invite.email,
								rut: invite.rut,
							});
						} else {
							// Use authClient to send the invitation
							await authClient.organization.inviteMember({
								email: invite.email,
								role:
									invite.roles.length === 1
										? invite.roles[0]
										: invite.roles,
							});
						}
						successCount++;
					} catch (error) {
						console.error(
							`Failed to invite ${invite.email}:`,
							error,
						);
						failedInvites.push({
							email: invite.email,
							error:
								error instanceof Error
									? error.message
									: "Unknown error",
						});
					}
				}

				// Handle results
				if (successCount > 0) {
					toast.success(
						`Successfully invited ${successCount} member(s).`,
					);

					// Revalidate the page to refresh the member list
					router.refresh();

					if (failedInvites.length === 0) {
						form.reset();
						onOpenChange(false);
					}
				}

				if (failedInvites.length > 0) {
					toast.error(
						`Failed to invite ${failedInvites.length} member(s): ${failedInvites.map((f) => f.email).join(", ")}`,
					);
				}
			} else if (values.mode === "csv") {
				// Handle CSV file uploads
				console.log("Processing CSV mode");

				// Validate file exists and is valid
				if (
					!values.csvFile ||
					!(values.csvFile instanceof FileList) ||
					values.csvFile.length !== 1
				) {
					console.error(
						"CSV mode validation failed: No valid file selected.",
					);
					form.setError("csvFile", {
						message: "A valid CSV file is required.",
					});
					setIsLoading(false);
					return;
				}

				const file = values.csvFile[0];
				if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
					console.error(
						"CSV mode validation failed: Incorrect file type.",
						{ type: file.type },
					);
					form.setError("csvFile", {
						message: "File must be a CSV.",
					});
					setIsLoading(false);
					return;
				}

				if (file.size > 5 * 1024 * 1024) {
					console.error(
						"CSV mode validation failed: File too large.",
						{ size: file.size },
					);
					form.setError("csvFile", {
						message: "File size must be less than 5MB.",
					});
					setIsLoading(false);
					return;
				}

				try {
					// Parse CSV file
					const text = await file.text();
					const lines = text.split("\n");

					// Skip header row, process each line
					const header = lines[0].toLowerCase();
					if (!header.includes("email") || !header.includes("role")) {
						toast.error(
							"Invalid CSV format. The first row must include 'email' and 'role' columns.",
						);
						setIsLoading(false);
						return;
					}

					// Parse header to find column indexes
					const headers = header.split(",").map((h) => h.trim());
					const emailIndex = headers.findIndex((h) => h === "email");
					const roleIndex = headers.findIndex((h) => h === "role");

					if (emailIndex === -1 || roleIndex === -1) {
						toast.error(
							"CSV must contain 'email' and 'role' columns.",
						);
						setIsLoading(false);
						return;
					}

					// Process rows
					const dataRows = lines
						.slice(1)
						.filter((line) => line.trim() !== "");

					if (dataRows.length === 0) {
						toast.error("CSV file does not contain any data rows.");
						setIsLoading(false);
						return;
					}

					// Track results
					let successCount = 0;
					const failedInvites: { email: string; error: string }[] =
						[];

					// Process each row
					for (const row of dataRows) {
						const columns = row.split(",").map((col) => col.trim());
						if (columns.length <= Math.max(emailIndex, roleIndex)) {
							failedInvites.push({
								email: columns[emailIndex] || "Invalid row",
								error: "Invalid CSV row format",
							});
							continue;
						}

						const email = columns[emailIndex];
						const roleValue = columns[roleIndex];

						// Validate email
						if (
							!email ||
							!z.string().email().safeParse(email).success
						) {
							failedInvites.push({
								email: email || "Invalid email",
								error: "Invalid email format",
							});
							continue;
						}

						// Validate role(s)
						const roles = roleValue
							.split(",")
							.map((r) => r.trim()) as Role[];
						const validRoles = roles.filter((role) =>
							selectableRoles.includes(role as any),
						);

						if (validRoles.length === 0) {
							failedInvites.push({
								email,
								error: `Invalid role(s): ${roleValue}. Must be one of: ${selectableRoles.join(", ")}`,
							});
							continue;
						}

						// Attempt to invite
						try {
							await authClient.organization.inviteMember({
								email,
								role:
									validRoles.length === 1
										? validRoles[0]
										: validRoles,
							});
							successCount++;
						} catch (error) {
							console.error(`Failed to invite ${email}:`, error);
							failedInvites.push({
								email,
								error:
									error instanceof Error
										? error.message
										: "Unknown error",
							});
						}
					}

					// Handle results
					if (successCount > 0) {
						toast.success(
							`Successfully invited ${successCount} member(s).`,
						);

						// Revalidate the page to refresh the member list
						router.refresh();

						if (failedInvites.length === 0) {
							form.reset();
							onOpenChange(false);
						}
					}

					if (failedInvites.length > 0) {
						toast.error(
							`Failed to invite ${failedInvites.length} member(s): ${failedInvites.map((f) => f.email).join(", ")}`,
						);
					}
				} catch (csvError) {
					console.error("Error parsing CSV:", csvError);
					toast.error(
						"Failed to parse CSV file. Please check the format.",
					);
				}
			}
		} catch (error) {
			console.error("Error processing invitations:", error);
			toast.error(
				"An unexpected error occurred while processing invitations.",
			);
		} finally {
			setIsLoading(false);
		}
	}

	const handleModeChange = (newMode: string) => {
		if (newMode === "manual" || newMode === "csv") {
			setMode(newMode);
			form.setValue("mode", newMode, { shouldValidate: true });

			if (newMode === "manual") {
				if (fields.length === 0) {
					append({ email: "", roles: DEFAULT_ROLES, rut: "" });
				}
				form.setValue("csvFile", undefined);
				setCsvFileName(null);
			} else if (newMode === "csv") {
				form.setValue("manualInvites", undefined);
			}

			form.clearErrors();
		}
	};

	const csvTemplate =
		"email,role\nexample@domain.com,employee\nuser2@example.com,admin";
	const csvTemplateDataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvTemplate)}`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-2xl"
				onInteractOutside={(e) => {
					e.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>{t("people.invite.title")}</DialogTitle>
					<DialogDescription>
						{t("people.invite.description")}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<Tabs value={mode} onValueChange={handleModeChange}>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="manual">Manual</TabsTrigger>
								<TabsTrigger value="csv">CSV</TabsTrigger>
							</TabsList>

							<TabsContent
								value="manual"
								className="space-y-4 pt-4"
							>
								{fields.map((item, index) => (
									<div
										key={item.id}
										className="flex items-start gap-2"
									>
										<FormField
											control={form.control}
											name={`manualInvites.${index}.email`}
											render={({ field }) => (
												<FormItem className="flex-1">
													{index === 0 && (
														<FormLabel>
															{t(
																"people.invite.email.label",
															)}
														</FormLabel>
													)}
													<FormControl>
														<Input
															className="h-10"
															placeholder={t(
																"people.invite.email.placeholder",
															)}
															{...field}
															value={
																field.value ||
																""
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name={`manualInvites.${index}.rut`}
											render={({ field }) => (
												<FormItem className="w-[150px]">
													{index === 0 && (
														<FormLabel>
															RUT
														</FormLabel>
													)}
													<FormControl>
														<Input
															className="h-10"
															placeholder="12345678-9"
															{...field}
															value={
																field.value ||
																""
															}
															onChange={(e) => {
																const value = e.target.value;
																// Allow user to type freely, format on blur
																field.onChange(value);
															}}
															onBlur={(e) => {
																const value = e.target.value;
																if (value && validateRut(value)) {
																	field.onChange(formatRut(value));
																}
																field.onBlur();
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Controller
											control={form.control}
											name={`manualInvites.${index}.roles`}
											render={({
												field: { onChange, value },
												fieldState: { error },
											}) => (
												<FormItem className="w-[200px]">
													{index === 0 && (
														<FormLabel>
															{t(
																"people.invite.role.label",
															)}
														</FormLabel>
													)}
													<MultiRoleCombobox
														selectedRoles={
															value || []
														}
														onSelectedRolesChange={
															onChange
														}
														placeholder={t(
															"people.invite.role.placeholder",
														)}
													/>
													<FormMessage>
														{error?.message}
													</FormMessage>
												</FormItem>
											)}
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() =>
												fields.length > 1 &&
												remove(index)
											}
											disabled={fields.length <= 1}
											className={`mt-${index === 0 ? "6" : "0"} self-center ${fields.length <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
											aria-label="Remove invite"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="mt-2"
									onClick={() =>
										append({
											email: "",
											roles: DEFAULT_ROLES,
											rut: "",
										})
									}
								>
									<PlusCircle className="mr-2 h-4 w-4" />
									Add Another
								</Button>
								<FormDescription>
									{t("people.invite.description")}
								</FormDescription>
							</TabsContent>

							<TabsContent value="csv" className="space-y-4 pt-4">
								<FormField
									control={form.control}
									name="csvFile"
									render={({
										field: {
											onChange,
											value,
											...fieldProps
										},
									}) => (
										<FormItem>
											<FormLabel>
												{t("people.invite.csv.label")}
											</FormLabel>
											<div className="flex items-center gap-2">
												<Button
													type="button"
													variant="outline"
													onClick={() =>
														document
															.getElementById(
																"csvFileInput",
															)
															?.click()
													}
												>
													Choose File
												</Button>
												<span className="text-sm text-muted-foreground truncate">
													{csvFileName ||
														"No file chosen"}
												</span>
											</div>
											<FormControl className="relative">
												<Input
													id="csvFileInput"
													type="file"
													accept=".csv"
													{...fieldProps}
													onChange={(event) => {
														const fileList =
															event.target.files;
														onChange(fileList);
														setCsvFileName(
															fileList?.[0]
																?.name || null,
														);
													}}
													className="sr-only"
												/>
											</FormControl>
											<FormDescription>
												{t(
													"people.invite.csv.description",
												)}
											</FormDescription>
											<a
												href={csvTemplateDataUri}
												download="comp_invite_template.csv"
												className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
											>
												{t(
													"people.invite.csv.download_template",
												)}
											</a>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TabsContent>
						</Tabs>

						<DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
								className="w-full sm:w-auto"
							>
								{t("common.actions.cancel")}
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full sm:w-auto"
							>
								{isLoading && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								{isLoading
									? t("people.invite.submitting")
									: t("people.invite.submit")}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
