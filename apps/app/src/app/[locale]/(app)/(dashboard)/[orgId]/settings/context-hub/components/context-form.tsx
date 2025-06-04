"use client";

import { Button } from "@comp/ui/button";
import { Input } from "@comp/ui/input";
import { Label } from "@comp/ui/label";
import { Textarea } from "@comp/ui/textarea";
import { createContextEntryAction } from "@/actions/context-hub/create-context-entry-action";
import { updateContextEntryAction } from "@/actions/context-hub/update-context-entry-action";
import { toast } from "sonner";
import { useTransition } from "react";
import type { Context } from "@prisma/client";
import { Loader2 } from "lucide-react";

export function ContextForm({
    entry,
    onSuccess,
}: {
    entry?: Context;
    onSuccess?: () => void;
}) {
    const [isPending, startTransition] = useTransition();

    async function onSubmit(formData: FormData) {
        startTransition(async () => {
            try {
                if (entry) {
                    const result = await updateContextEntryAction({
                        id: entry.id,
                        question: formData.get("question") as string,
                        answer: formData.get("answer") as string,
                    });
                    if (result?.data) {
                        toast.success("Context entry updated");
                        onSuccess?.();
                    }
                } else {
                    const result = await createContextEntryAction({
                        question: formData.get("question") as string,
                        answer: formData.get("answer") as string,
                    });
                    if (result?.data) {
                        toast.success("Context entry created");
                        onSuccess?.();
                    }
                }
            } catch (error) {
                toast.error("Something went wrong");
            }
        });
    }

    return (
        <form action={onSubmit} className="space-y-4 flex flex-col gap-4 p-1">
            <input
                type="hidden"
                name="id"
                value={entry?.id}
            />
            <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                    id="question"
                    name="question"
                    placeholder="What is the company's mission?"
                    defaultValue={entry?.question}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                    id="answer"
                    name="answer"
                    placeholder="Our mission is to provide the best possible service to our customers."
                    defaultValue={entry?.answer}
                    required
                />
            </div>

            <Button type="submit" disabled={isPending} className="justify-self-end">
                {entry ? "Update" : "Create"} {isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            </Button>
        </form >
    );
}