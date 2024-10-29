class GalleryPreLoader {
    cache: HTMLImageElement[] = [];

    public load = (url: string): Promise<HTMLImageElement> => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            if (!url) resolve(null);

            var image = this.cache.filter((i) => i.src === url)[0];

            if (image) {
                resolve(image);
            } else {
                image = new Image();
                image.crossOrigin = "anonymous";
                image.src = url;
                image.onload = () => {
                    if (this.cache.length > 10) this.cache.shift();
                    this.cache.push(image);
                    resolve(image);
                };
                image.onerror = (e) => {
                    reject(e);
                };
            }
        });
    };
}

export default new GalleryPreLoader();
