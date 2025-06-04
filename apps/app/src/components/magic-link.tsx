"use client";

import { useI18n } from "@/locales/client";
import { authClient } from "@/utils/auth-client";
import { Button } from "@comp/ui/button";
import { cn } from "@comp/ui/cn";
import { Form, FormControl, FormField, FormItem } from "@comp/ui/form";
import { Icons } from "@comp/ui/icons";
import { Input } from "@comp/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	email: z.string().email(),
});

type Props = {
	className?: string;
	inviteCode?: string;
};

export function MagicLinkSignIn({ className, inviteCode }: Props) {
	const t = useI18n();
	const [isLoading, setLoading] = useState(false);
	const [isSent, setSent] = useState(false);
	const [_email, setEmail] = useState<string>();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit({ email }: z.infer<typeof formSchema>) {
		setLoading(true);

		setEmail(email);

		const { data, error } = await authClient.signIn.magicLink({
			email: email,
			callbackURL: `/setup?inviteCode=${inviteCode}`,
		});

		if (error) {
			toast.error(t("auth.email.error"));
		} else {
			setSent(true);
		}
	}

	if (isSent) {
		return (
			<div
				className={cn(
					"flex flex-col items-center space-y-4",
					className,
				)}
			>
				<h1 className="text-2xl font-medium">
					{t("auth.email.magic_link_sent")}
				</h1>

				<div className="flex flex-col">
					<span className="text-sm text-muted-foreground">
						{t("auth.email.magic_link_description")}
					</span>
					<button
						onClick={() => setSent(false)}
						type="button"
						className="text-sm font-medium text-primary underline"
					>
						{t("auth.email.magic_link_try_again")}
					</button>
				</div>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className={cn("flex flex-col space-y-4", className)}>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										placeholder={t(
											"auth.email.placeholder",
										)}
										{...field}
										autoFocus
										className="h-[40px]"
										autoCapitalize="false"
										autoCorrect="false"
										spellCheck="false"
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						className="flex h-[40px] w-full space-x-2 px-6 py-4 font-medium active:scale-[0.98]"
					>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<>
								<Icons.EmailIcon />
								<span>{t("auth.email.button")}</span>
							</>
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
