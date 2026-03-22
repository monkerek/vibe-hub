import { getPackByName } from './packs.js';
// ─── Motto resolver ─────────────────────────────────────────────────────────
// Selects a motto based on the configured strategy.
export function resolveMotto(config) {
    if (!config.enabled)
        return undefined;
    // Manual override takes priority
    if (config.strategy === 'manual') {
        return config.current || undefined;
    }
    // Get the motto list
    const mottos = getMottoList(config);
    if (mottos.length === 0)
        return undefined;
    switch (config.strategy) {
        case 'day-of-week':
            return resolveByDayOfWeek(mottos, config);
        case 'random':
            return mottos[Math.floor(Math.random() * mottos.length)];
        case 'sequential':
            return resolveSequential(mottos);
        case 'time-of-day':
            return resolveByTimeOfDay(mottos, config);
        default:
            return mottos[0];
    }
}
function getMottoList(config) {
    // Custom mottos first
    if (config.custom && config.custom.length > 0) {
        return config.custom;
    }
    // Then pack mottos
    if (config.pack) {
        const pack = getPackByName(config.pack);
        if (pack)
            return pack.mottos;
    }
    return [];
}
function resolveByDayOfWeek(mottos, config) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = new Date().getDay();
    const today = days[dayIndex];
    // Check explicit day-of-week mapping first
    if (config.dayOfWeek && config.dayOfWeek[today]) {
        return config.dayOfWeek[today];
    }
    // Fall back to cycling through the list by day
    return mottos[dayIndex % mottos.length];
}
function resolveSequential(mottos) {
    // Use day-of-year for a stable but progressing index
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / 86_400_000);
    return mottos[dayOfYear % mottos.length];
}
function resolveByTimeOfDay(mottos, config) {
    const hour = new Date().getHours();
    // Check explicit time-of-day mapping
    if (config.timeOfDay) {
        if (hour < 6 && config.timeOfDay['night'])
            return config.timeOfDay['night'];
        if (hour < 12 && config.timeOfDay['morning'])
            return config.timeOfDay['morning'];
        if (hour < 18 && config.timeOfDay['afternoon'])
            return config.timeOfDay['afternoon'];
        if (config.timeOfDay['evening'])
            return config.timeOfDay['evening'];
    }
    // Fall back to index based on time quadrant
    const quadrant = Math.floor(hour / 6); // 0-3
    return mottos[quadrant % mottos.length];
}
//# sourceMappingURL=resolver.js.map