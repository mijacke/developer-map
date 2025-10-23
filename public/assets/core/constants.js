export const APP_VIEWS = {
    MAPS: 'maps',
    DASHBOARD: 'dashboard',
    SETTINGS: 'settings',
};

export const MAP_SECTIONS = {
    LIST: 'list',
    FLOORS: 'floors',
    BLUEPRINTS: 'blueprints',
};

export const SETTINGS_SECTIONS = {
    OVERVIEW: 'overview',
    TYPES: 'types',
    STATUSES: 'statuses',
    COLORS: 'colors',
    FONTS: 'fonts',
};

export const MEDIA = {
    building: new URL('../media/demo-building-placeholder.svg', import.meta.url).href,
    draw: new URL('../media/demo-building-draw.svg', import.meta.url).href,
    floor: new URL('../media/demo-floorplan-placeholder.svg', import.meta.url).href,
    cursor: new URL('../media/demo-pointer.svg', import.meta.url).href,
};

export const DRAW_VIEWBOX = { width: 1280, height: 720 };

export const DEFAULT_DRAW_POINTS = [
    { x: 260, y: 320 },
    { x: 640, y: 260 },
    { x: 1005, y: 330 },
    { x: 960, y: 436 },
    { x: 600, y: 468 },
    { x: 320, y: 390 },
];
