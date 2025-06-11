export function mapEntity<T extends Record<string, any>>(item: T): FloorPlanEntity | T {
    switch (item.entity.type) {
        case "booth":
            return {
                id: item.id,
                name: getSafeString(item.name),
                externalId: getSafeString(item.externalId),
                isSpecial: item.entity.variant === "special",
                exhibitors: extractIds(item.exhibitors),
                layer: {
                    name: getSafeString(item.layer?.name),
                    description: getSafeString(item.layer?.description),
                },
                meta: item.meta,
                description: getSafeString(item.description),
                entity: item.entity,
            };

        case "category":
            return {
                id: item.id,
                name: getSafeString(item.name),
                exhibitors: extractIds(item.exhibitors),
                entity: item.entity,
                slug: getSafeString(item.slug),
            };

        case "exhibitor":
            return {
                id: item.id,
                name: getSafeString(item.name),
                externalId: getSafeString(item.externalId),
                booths: extractIds(item.booths),
                entity: item.entity,
                slug: getSafeString(item.slug),
            };

        case "schedule":
            return {
                id: item.id,
                externalId: getSafeString(item.externalId),
                boothId: item.boothId,
                exhibitorId: item.exhibitorId,
                name: getSafeString(item.name),
                description: getSafeString(item.description),
                startDate: getSafeString(item.startDate),
                endDate: getSafeString(item.endDate),
                link: getSafeString(item.link),
                entity: item.entity,
                isEnded: item.isEnded,
            };

        case "language":
            return {
                id: item.id,
                name: getSafeString(item.name),
                entity: item.entity,
                selected: item.selected || false,
            };

        case "heatmap-yah":
            return {
                id: getSafeString(item.id),
                name: getSafeString(item.name),
                viewCount: item.viewCount || 0,
                x: item.x || 0,
                y: item.y || 0,
                z: item.z,
                entity: item.entity,
            };

        default:
            return item;
    }
}

function extractIds(list: { id: number }[]): number[] {
    return Array.isArray(list)
        ? list
              .filter(Boolean)
              .map((e) => e.id)
              .filter(Boolean)
        : [];
}

function getSafeString(value: unknown): string {
    return typeof value === "string" ? value : "";
}
