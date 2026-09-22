const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const parseAdminEmails = (raw: string | undefined | null): string[] => {
    if (!raw) return [];

    const seen = new Set<string>();
    for (const part of raw.split(/[,;\s]+/)) {
        const email = part.trim().toLowerCase();
        if (email && LOOKS_LIKE_EMAIL.test(email)) seen.add(email);
    }
    return [...seen];
};

export const getAdminEmails = (): string[] =>
    parseAdminEmails(process.env.ORDER_NOTIFICATIONS_EMAIL);
