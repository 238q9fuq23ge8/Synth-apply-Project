export type Link = { label: string; url: string };

export type ExperienceDraft = {
	role: string;
	company: string;
	startDate: string;
	endDate: string;
	description: string[];
};

export type EducationDraft = {
	degree: string;
	school: string;
	year: string;
	details?: string[];
};

export type CVDraft = {
	fullName: string;
	title: string;
	email: string;
	phone: string;
	location: string;
	links: Link[];
	summary: string;
	skills: string[];
	experience: ExperienceDraft[];
	education: EducationDraft[];
	template: "classic" | "modern" | "minimal";
};

export const emptyDraft = (): CVDraft => ({
	fullName: "",
	title: "",
	email: "",
	phone: "",
	location: "",
	links: [],
	summary: "",
	skills: [],
	experience: [],
	education: [],
	template: "classic",
});

const VERBS = [
	"Led",
	"Built",
	"Improved",
	"Optimized",
	"Automated",
	"Delivered",
	"Reduced",
	"Increased",
];

export function generateSmartSummary(draft: CVDraft): string {
	if (draft.summary && draft.summary.trim().length > 0) return draft.summary;
	const title = draft.title || "professional";
	const topSkills = draft.skills.slice(0, 3).join(", ");
	const years = guessYearsFromExperience(draft);
	const parts = [
		`${capitalize(title)} with ${years} years of experience`,
		topSkills ? `skilled in ${topSkills}` : "",
		`seeking to drive impact in fast-paced teams`,
	].filter(Boolean);
	return parts.join(". ") + ".";
}

export function scaffoldBulletsIfEmpty(exp: ExperienceDraft): string[] {
	if (exp.description && exp.description.filter((d) => d.trim()).length > 0) return exp.description;
	return [
		`${VERBS[0]} key initiatives to improve quality and velocity`,
		`${VERBS[2]} core workflows resulting in measurable gains`,
		`${VERBS[3]} performance and ${VERBS[6].toLowerCase()} costs`,
	];
}

export function suggestSkillsForTitle(title: string): string[] {
	const t = title.toLowerCase();
	if (t.includes("frontend") || t.includes("react")) return ["React", "TypeScript", "TailwindCSS", "Testing" ];
	if (t.includes("backend") || t.includes("node")) return ["Node.js", "PostgreSQL", "REST", "Docker" ];
	if (t.includes("data")) return ["Python", "Pandas", "SQL", "ML" ];
	if (t.includes("design")) return ["Figma", "Prototyping", "UX", "Design Systems" ];
	return [];
}

function guessYearsFromExperience(draft: CVDraft): number {
	return Math.min(10, Math.max(1, draft.experience.length * 2));
}

function capitalize(s: string): string {
	if (!s) return s;
	return s.charAt(0).toUpperCase() + s.slice(1);
}


