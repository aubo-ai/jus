"use client";

import { useRun } from "@trigger.dev/react-hooks";
import React, { useEffect } from "react";
import { onboardOrganization } from "@/jobs/tasks/onboarding/onboard-organization";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export function OnboardingStatus({ runId }: { runId: string }) {
    const { run, error, isLoading } = useRun<typeof onboardOrganization>(runId, {
        refreshInterval: 1000,
    });

    const router = useRouter();

    useEffect(() => {
        if (run?.status === "COMPLETED") {
            router.replace("/");
        }
    }, [run?.status, router]);

    return (
        <div className="flex flex-col items-center justify-center">
            {run?.status === "COMPLETED" && (
                <div className="flex flex-col items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-muted-foreground">
                        Redirecting
                    </p>
                </div>
            )}
        </div>
    )
}