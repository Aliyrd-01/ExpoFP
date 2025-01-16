export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        var img = new Image();
        img.onerror = () => resolve(null);
        img.onload = () => resolve(img);
        img.crossOrigin = "anonymous";
        img.src = src;
    });
}
