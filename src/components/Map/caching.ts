import c from './drawing-context'

// cache
interface Intersecting { intersects(r: Rect): boolean; }
interface WithRect { rect: Rect; }
type IntersetingOrRectContainer = Intersecting | WithRect;
const cache = new Map<IntersetingOrRectContainer[], Map<string, IntersetingOrRectContainer[]>>();
export function getSpriteIntersectingObjects<T extends IntersetingOrRectContainer>(primitives: T[]): T[] {
    let subCache = cache.get(primitives);
    if (!subCache) {
        subCache = new Map<string, T[]>();
        cache.set(primitives, subCache);
    }

    const spriteKey = c.spriteSRect.toString();
    let result = subCache.get(spriteKey);
    if (!result) {
        // const r = c.spriteSRect;
        // console.log(c.spriteSRect);
        result = primitives.filter(b => (b as WithRect).rect ? (b as WithRect).rect.intersects(c.spriteSRect) : (b as Intersecting).intersects(c.spriteSRect));
        subCache.set(spriteKey, result);
    }

    return result as T[];
}
