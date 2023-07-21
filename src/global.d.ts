declare global {
    class FontFace {
        constructor(family: string, source: string, descriptors?: FontFaceDescriptors);
        family: string;
        style: string;
        weight: string;
        stretch: string;
        unicodeRange: string;
        variant: string;
        featureSettings: string;
        variationSettings: string;
        display: string;
        load(): Promise<FontFace>;
        status: "unloaded" | "loading" | "loaded" | "error";
        readonly loaded: Promise<FontFace>;
    }

    interface FontFaceDescriptors {
        style?: string;
        weight?: string;
        stretch?: string;
        unicodeRange?: string;
        variant?: string;
        featureSettings?: string;
        variationSettings?: string;
        display?: string;
    }
}

export {};
