import { CVDraft } from "./cv-defaults";

const PUBLIC_KEY = "cvDraft.public";

export function savePublicDraft(draft: CVDraft) {
	try {
		localStorage.setItem(PUBLIC_KEY, JSON.stringify(draft));
	} catch {}
}

export function loadPublicDraft(): CVDraft | null {
	try {
		const raw = localStorage.getItem(PUBLIC_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function clearPublicDraft() {
	try {
		localStorage.removeItem(PUBLIC_KEY);
	} catch {}
}

export function isAuthed(): boolean {
	// App uses custom access_token in localStorage
	return Boolean(localStorage.getItem("access_token"));
}


