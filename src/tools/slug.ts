function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w-]+/g, '')        // Remove all non-word chars
        .replace(/--+/g, '-')           // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

const generatedSlugs = new Set<string>();

export function generateUniqueSlug(text: string) {
    let append = 0;
    const slugBase = slugify(text);
    let slug: string;
    do {
        slug = slugBase + (append++ > 0 ? append : '');
    }
    while (generatedSlugs.has(slug))

    generatedSlugs.add(slug);
    return slug;
}