import type { Artifacts } from 'lighthouse';

export function findArtifact(
	id: string,
	artifacts: Artifacts,
): {
	fix: string | null;
	impact: 'critical' | 'minor' | 'moderate' | 'serious' | null;
	type: 'incomplete' | 'notApplicable' | 'passes' | 'violations';
} | null {
	const artifactsObj = {
		violations: {
			type: 'violations',
			data: artifacts.Accessibility?.violations ?? [],
		},
		incomplete: {
			type: 'incomplete',
			data: artifacts.Accessibility?.incomplete ?? [],
		},
		notApplicable: {
			type: 'notApplicable',
			data: artifacts.Accessibility?.notApplicable ?? [],
		},
		passes: {
			type: 'passes',
			data: artifacts.Accessibility?.passes ?? [],
		},
	};

	for (const value of Object.values(artifactsObj)) {
		const result = value.data.find((item: any) => item.id === id) as Artifacts.AxeRuleResult;

		if (result) {
			return {
				impact: (result.impact ?? null) as 'critical' | 'minor' | 'moderate' | 'serious' | null,
				type: value.type as 'incomplete' | 'notApplicable' | 'passes' | 'violations',
				fix: result.nodes?.[0]?.failureSummary ?? null,
			};
		}
	}

	return null;
}
