import logger from "./logger";

let loadedBytes = 0;
let loggedMb = 0;
const loggedByCategory = new Map<string, number>();

let logFinishedTimeout: NodeJS.Timeout;

export function logBuffer(bytes: number, category: string) {
    loadedBytes += bytes;
    let categoryBytes = loggedByCategory.get(category) || 0;
    loggedByCategory.set(category, categoryBytes + bytes);

    log(false);

    if (logFinishedTimeout) clearTimeout(logFinishedTimeout);
    logFinishedTimeout = setTimeout(() => log(true), 5000);
}

function log(finished: boolean) {
    const loadedMbRounded = Math.floor(loadedBytes / 1024 / 1024);
    // log every 10MB
    if (finished || loadedMbRounded > loggedMb + 10) {
        loggedMb = loadedMbRounded;

        const catLogMessage = Array.from(loggedByCategory.entries())
            .map(([key, value]) => {
                const roundedMb = Math.floor(value / 1024 / 1024);
                return `${key}: ${roundedMb}MB`;
            })
            .join(", ");

        logger.log(`${finished ? "Finished " : ""}GPU: ${loadedMbRounded}MB, ${catLogMessage}`);
    }
}

//4029410018626614;
