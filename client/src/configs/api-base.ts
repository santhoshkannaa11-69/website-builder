const FALLBACK_DEV_API_BASE = "http://localhost:3000";
const FALLBACK_PROD_API_BASE = "https://web-wizard-liard.vercel.app";

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

const envBaseUrl = import.meta.env.VITE_BASEURL;

export const apiBaseUrl = normalizeBaseUrl(
    envBaseUrl || (import.meta.env.PROD ? FALLBACK_PROD_API_BASE : FALLBACK_DEV_API_BASE),
);

export const isLocalApiBase = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(apiBaseUrl);
