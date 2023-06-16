export function getColorFromClickCount(count: number) {
    if (count > 450) {
        return "#DC143C";
    } else if (count > 90) {
        return "#939C0E";
    } else if (count > 25) {
        return "#116B16";
    } else {
        return "#000000";
    }
}
