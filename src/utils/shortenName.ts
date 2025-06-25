export function shortenName(name: string): string {
    if (typeof name !== "string") return name;
    return name
        .split(" ")
        .map((word) => {
            const cleaned = word.replace(/[^A-Z0-9+-]/gi, "");
            const numberMatch = cleaned.match(/^[-+]?\d+$/);
            if (numberMatch) {
                return numberMatch[0];
            }
            return cleaned.charAt(0).toUpperCase();
        })
        .join("");
}
