"use client";

import { authClient } from "@/utils/auth-client";
import { Button } from "@comp/ui/button";
import { Icons } from "@comp/ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AcceptInvite({
	inviteCode,
	organizationName,
}: { inviteCode: string; organizationName: string }) {
	const router = useRouter();

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		await authClient.organization.acceptInvitation({
			invitationId: inviteCode,
		});

		const session = await authClient.getSession();

		router.push(
			`/${session.data?.session.activeOrganizationId}/frameworks`,
		);
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-6 md:p-8">
			<div className="relative w-full max-w-[440px] border bg-card rounded-sm p-8 shadow-lg">
				<div className="mb-8 flex justify-between">
					<Link href="/">
						<Icons.Logo />
					</Link>
				</div>

				<div className="mb-8 space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight">
						You have been invited to join{" "}
						{organizationName || "an organization"}.
					</h1>
					<p className="text-sm text-muted-foreground">
						Please accept the invitation to join the organization.
					</p>
				</div>

				<form
					onSubmit={onSubmit}
					className="space-y-6"
					suppressHydrationWarning
				>
					<Button
						type="submit"
						className="w-full"
						disabled={false}
						suppressHydrationWarning
					>
						Accept Invitation
					</Button>
				</form>
			</div>
		</div>
	);
}
