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

export interface DMLotMeta {
    area?: number;
    ctaEnabled?: boolean;
    maskColor?: string;
}

export interface DMLotDefinition {
    id: string;
    label: string;
    type: string;
    status: DMStatusKey;
    tags?: string[];
    geometry: DMGeometry;
    meta?: DMLotMeta;
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
    adapter: DMAdapterConfig;
    renderer: DMRendererConfig;
    palette: {
        statuses: DMStatusDefinition[];
    };
    lots: DMLotDefinition[];
}

export declare const demoProjectConfig: DMProjectConfig;

export { demoProjectConfig as default } from './demo.config.js';
