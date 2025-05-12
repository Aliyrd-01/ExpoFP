export function shortenName(name: string): string {
    if (typeof name !== "string") return name;
    return name
        .split(" ")
        .map((x) => x.replace(/[^A-Z0-9]/gi, ""))
        .map((x) => x.substring(0, 1).toLocaleUpperCase())
        .join("");
}
