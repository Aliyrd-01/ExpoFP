import { STRING_META_DELIMITER } from "../constants";

export function extractMetaFromString(input: string): { text: string; meta: Record<string, string> | null } {
    const parts = input.split(STRING_META_DELIMITER);

    if (parts.length !== 2) {
        return { text: input, meta: null };
    }

    const [text, metaPart] = parts;

    const meta = metaPart.split(",").reduce<Record<string, string>>((acc, pair) => {
        const [key, value] = pair.split(":");
        if (key) {
            acc[key.trim()] = value?.trim() ?? "";
        }
        return acc;
    }, {});

    return { text, meta };
}
