export const capitalizeFirstLetter = (
    str: string | null | undefined,
): string => {
    if (typeof str !== "string") {
        return "";
    }
    const trimmed = str.trim();
    if (trimmed.length === 0) {
        return trimmed;
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export interface BigIntParseResult {
    ok: boolean;
    value: bigint;
    errorMsg: string | null;
}

export function stringToBigIntSafe(str: string): BigIntParseResult {
    const s = str.trim();
    if (s === "") {
        return { ok: false, errorMsg: "Input cannot be empty", value: 0n };
    }
    // Disallow decimal point (solidity uint / int no floating)
    if (s.includes(".")) {
        return {
            ok: false,
            errorMsg: "Floating-point number not supported, must be integer",
            value: 0n,
        };
    }
    try {
        const val = BigInt(s);
        return { ok: true, value: val, errorMsg: null };
    } catch {
        return {
            ok: false,
            errorMsg: `"${str}" is not a valid integer`,
            value: 0n,
        };
    }
}

export function stringToUintSafe(str: string): BigIntParseResult {
    const res = stringToBigIntSafe(str);
    if (!res.ok) {
        return res;
    }
    if (res.value < 0n) {
        return {
            ok: false,
            errorMsg: "Value must be non-negative uint",
            value: 0n,
        };
    }
    return res;
}
/**
 * Format error message: take up to first 2 lines, total max 120 characters.
 * Append ellipsis … if text exceeds character limit.
 * Handles both Unix \n and Windows \r\n line breaks.
 * @param text raw multi‑line error message string
 * @param maxLines maximum lines to keep (default = 2)
 * @param maxChars maximum total character count (default = 120)
 */
export function formatErrorMessage(
    text: string|null|undefined,
    maxLines = 2,
    maxChars = 128,
): string {
    if(!text) { return "";}
    const lines = text.split(/\r?\n/);
    const selected = lines.slice(0, maxLines);
    let result = selected.join("\n");

    if (result.length > maxChars) {
        result = `${result.substring(0, maxChars - 1)}…`;
    }
    return result.trimEnd();
}
