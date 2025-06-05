"use client";

import { useI18n } from "@/locales/client";
import { Impact, Likelihood } from "@comp/db/types";
import { Button } from "@comp/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@comp/ui/card";
import { PencilIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import type React from "react";

const LIKELIHOOD_SCORES: Record<Likelihood, number> = {
	very_unlikely: 1,
	unlikely: 2,
	possible: 3,
	likely: 4,
	very_likely: 5,
};

const IMPACT_SCORES: Record<Impact, number> = {
	insignificant: 1,
	minor: 2,
	moderate: 3,
	major: 4,
	severe: 5,
};

const VISUAL_LIKELIHOOD_ORDER: Likelihood[] = [
	Likelihood.very_likely,
	Likelihood.likely,
	Likelihood.possible,
	Likelihood.unlikely,
	Likelihood.very_unlikely,
];
const VISUAL_IMPACT_ORDER: Impact[] = [
	Impact.insignificant,
	Impact.minor,
	Impact.moderate,
	Impact.major,
	Impact.severe,
];

interface RiskCell {
	probability: string;
	impact: string;
	level: "very-low" | "low" | "medium" | "high" | "very-high";
	value?: number;
}

const getRiskColor = (level: string) => {
	switch (level) {
		case "very-low":
			return "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30";
		case "low":
			return "bg-green-500/20 border-green-500/30 hover:bg-green-500/30";
		case "medium":
			return "bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30";
		case "high":
			return "bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30";
		case "very-high":
			return "bg-red-500/20 border-red-500/30 hover:bg-red-500/30";
		default:
			return "bg-slate-500/20 border-slate-500/30";
	}
};

const probabilityLevels = ["Very Likely", "Likely", "Possible", "Unlikely", "Very Unlikely"];
const probabilityNumbers = ["5", "4", "3", "2", "1"];
const probabilityLabels = ["Very Likely (5)", "Likely (4)", "Possible (3)", "Unlikely (2)", "Very Unlikely (1)"];
const impactLevels = ["Insignificant", "Minor", "Moderate", "Major", "Severe"];
const impactNumbers = ["1", "2", "3", "4", "5"];

interface RiskMatrixChartProps {
	title: string;
	description: string;
	activeLikelihood: Likelihood;
	activeImpact: Impact;
	sheetQueryParam: string;
	EditSheetComponent: React.ComponentType<any>;
	editSheetProps: Record<string, any>;
}

export function RiskMatrixChart({
	title,
	description,
	activeLikelihood,
	activeImpact,
	sheetQueryParam,
	EditSheetComponent,
	editSheetProps,
}: RiskMatrixChartProps) {
	const t = useI18n();
	const [open, setOpen] = useQueryState(sheetQueryParam);

	const activeProbability = probabilityLevels[VISUAL_LIKELIHOOD_ORDER.indexOf(activeLikelihood)];
	const activeImpactLevel = impactLevels[VISUAL_IMPACT_ORDER.indexOf(activeImpact)];

	// Create risk data
	const riskData: RiskCell[] = probabilityLevels.flatMap((probability) =>
		impactLevels.map((impact) => {
			const likelihoodScore = LIKELIHOOD_SCORES[VISUAL_LIKELIHOOD_ORDER[probabilityLevels.indexOf(probability)]];
			const impactScore = IMPACT_SCORES[VISUAL_IMPACT_ORDER[impactLevels.indexOf(impact)]];
			const score = likelihoodScore * impactScore;

			let level: RiskCell["level"] = "very-low";
			if (score > 16) level = "very-high";
			else if (score > 9) level = "high";
			else if (score > 4) level = "medium";
			else if (score > 1) level = "low";

			return {
				probability,
				impact,
				level,
				value: probability === activeProbability && impact === activeImpactLevel ? 1 : undefined,
			};
		})
	);

	return (
		<>
			<Card>
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>{title}</CardTitle>
							<CardDescription>{description}</CardDescription>
						</div>
						<Button
							onClick={() => setOpen("true")}
							size="icon"
							variant="ghost"
							className="p-0 m-0 size-auto"
						>
							<PencilIcon className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="relative">
						<div>
							<div className="grid grid-cols-6 gap-px rounded-lg">
								<div className="h-12" />
								{impactLevels.map((impact, index) => (
									<div key={impact} className="flex flex-col items-center justify-center">
										<span className="text-xs text-center leading-tight">{impact}</span>
									</div>
								))}

								{/* Data rows */}
								{probabilityLevels.map((probability, rowIdx) => (
									<div key={probability} className="contents">
										<div
											className="flex flex-col items-center justify-center"
											title={probabilityLabels[rowIdx]}
										>
											<span className="text-xs">{probabilityNumbers[rowIdx]}</span>
										</div>
										{impactLevels.map((impact, colIdx) => {
											const cell = riskData.find(
												(item) => item.probability === probability && item.impact === impact
											);
											// Determine if this cell is a corner for rounding
											let rounding = "";
											if (rowIdx === 0 && colIdx === 0) rounding = "rounded-tl-lg";
											if (rowIdx === 0 && colIdx === impactLevels.length - 1) rounding = "rounded-tr-lg";
											if (rowIdx === probabilityLevels.length - 1 && colIdx === 0) rounding = "rounded-bl-lg";
											if (rowIdx === probabilityLevels.length - 1 && colIdx === impactLevels.length - 1) rounding = "rounded-br-lg";
											return (
												<div
													key={`${probability}-${impact}`}
													className={`
														relative h-12 border transition-all duration-200 cursor-pointer
														${getRiskColor(cell?.level || "very-low")}
														flex items-center justify-center
														${rounding}
													`}
												>
													{cell?.value && <div className="w-3 h-3 bg-white rounded-full shadow-lg" />}
												</div>
											);
										})}
									</div>
								))}
							</div>

							{/* X-axis label */}
							<div className="flex justify-center mt-4">
								<span className="text-xs">{t("risk.metrics.impact")}</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
			<EditSheetComponent {...editSheetProps} />
		</>
	);
}
