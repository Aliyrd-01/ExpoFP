export function isRTLText(text: string) {
    const rtlChars = "\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC";
    const rtlDirCheck = new RegExp("^[^" + rtlChars + "]*?[" + rtlChars + "]");

    return rtlDirCheck.test(text);
}

export function isHebrewText(text: string): boolean {
    const hebrew = /[\u0590-\u05FF]/;
    return hebrew.test(text);
}
