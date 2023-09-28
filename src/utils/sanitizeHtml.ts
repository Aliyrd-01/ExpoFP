const sanitizeHTML = (html: string, tags?: string[], attributes?: string[]): string => {
    const allowedTags: string[] = tags || ["p", "span", "strong", "em", "ul", "ol", "li", "a"];
    const allowedAttributes: string[] = attributes || ["href", "target", "rel"];

    const container = document.createElement("template");
    container.innerHTML = html;

    const element = container.content;

    Array.from(element.querySelectorAll("*")).forEach((el: Element) => {
        if (!allowedTags.includes(el.tagName.toLowerCase())) {
            el.remove();
        }
    });

    Array.from(element.querySelectorAll("*")).forEach((el: Element) => {
        Array.from(el.attributes).forEach((attr: Attr) => {
            if (!allowedAttributes.includes(attr.name.toLowerCase())) {
                el.removeAttribute(attr.name);
            }
        });
    });

    return container.innerHTML;
};

export default sanitizeHTML;
