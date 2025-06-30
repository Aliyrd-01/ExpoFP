export type EventStatus = "live" | "past" | "starting-soon" | "upcoming" | "none";

export interface TimeUntilStartData {
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isLessThan10Minutes: boolean;
}

function parseDateSafe(dateStr?: string): number | null {
    if (!dateStr) return null;
    const ts = Date.parse(dateStr);
    return isNaN(ts) ? null : ts;
}

export function calculateTimeUntilStart(startDate: string, now: number): TimeUntilStartData {
    const start = parseDateSafe(startDate);
    if (start === null) {
        return {
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            isLessThan10Minutes: false,
        };
    }

    const diffMs = start - now;

    if (diffMs <= 0) {
        return {
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            isLessThan10Minutes: false,
        };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
        minutes,
        seconds,
        totalSeconds,
        isLessThan10Minutes: totalSeconds < 600,
    };
}

export function formatTimeUntilStart(timeUntil: TimeUntilStartData): string {
    if (timeUntil.totalSeconds <= 0) {
        return "Started";
    }

    if (timeUntil.isLessThan10Minutes) {
        const minutesStr = timeUntil.minutes.toString().padStart(2, "0");
        const secondsStr = timeUntil.seconds.toString().padStart(2, "0");
        return `Starts in ${minutesStr}:${secondsStr}`;
    } else {
        return `Starts in ${timeUntil.minutes} min`;
    }
}

export function getEventStatus(
    event: { startDate: string; endDate?: string },
    now: number,
    timeUntil: TimeUntilStartData
): EventStatus {
    const start = parseDateSafe(event.startDate);
    const end = parseDateSafe(event.endDate) ?? Number.POSITIVE_INFINITY;

    if (start === null || end === null) return "none";

    if (now > end) return "past";

    if (start - now <= 1000 && now <= end) return "live";
    if (now >= start && now <= end) return "live";

    if (timeUntil.totalSeconds > 0 && timeUntil.totalSeconds <= 3600) return "starting-soon";

    const twentyFourHoursFromNow = now + 24 * 60 * 60 * 1000;
    if (start <= twentyFourHoursFromNow) return "upcoming";

    return "none";
}
