// Flat config (ESLint 9+). Sustituye a `next lint`, eliminado en Next 16.
// `eslint-config-next/typescript` ya trae los ignores de .next/, out/ y build/.
import next from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [...next, ...nextTypescript];

export default config;
