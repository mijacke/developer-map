export type DMStatusKey = 'available' | 'reserved' | 'sold';

export interface DMStatusDefinition {
    key: DMStatusKey;
    label: string;
    color: string;
    hatchClass: string;
    autoShadeColor?: string;
}

export interface DMGeometry {
    type: 'polygon';
    points: Array<[number, number]>;
}

export interface DMRegionMeta {
    area?: number;
    ctaEnabled?: boolean;
    maskColor?: string;
}

export interface DMRegionDefinition {
    id: string;
    label: string;
    type: string;
    status: DMStatusKey;
    statusId?: string;
    tags?: string[];
    geometry: DMGeometry;
    hatchClass?: string;
    meta?: DMRegionMeta;
    children?: string[];
}

export interface DMRendererConfig {
    type: 'image';
    clamp?: boolean;
    size?: {
        width: number;
        height: number;
    };
    source?: string;
}

export interface DMAdapterConfig {
    type: 'svg' | 'geojson';
    options?: {
        snapTolerance?: number;
    };
}

export interface DMProjectConfig {
    id: string;
    title: string;
    description?: string;
    publicKey: string;
    adapter: DMAdapterConfig;
    renderer: DMRendererConfig;
    palette: {
        statuses: DMStatusDefinition[];
    };
    regions: DMRegionDefinition[];
}

export declare const demoProjectConfig: DMProjectConfig;

export { demoProjectConfig as default } from './demo.config.js';
