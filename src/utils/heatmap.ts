export function getColorFromClickCount(count: number) {
    if (count > 30) {
        return "#DC143C";
    } else if (count > 15) {
        return "#939C0E";
    } else if (count > 5) {
        return "#116B16";
    } else {
        return "#786e6e";
    }
}
