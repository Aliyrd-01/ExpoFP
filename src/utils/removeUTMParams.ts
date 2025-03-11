export function removeUTMParams(input: string) {
    return input ? input.replace(/(^|\?|&)utm_[^&]*/g, "") : input;
}
