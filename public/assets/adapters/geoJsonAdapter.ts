import type { DMProjectConfig } from '../config/types';

export interface GeoJsonAdapterOptions {
    host: HTMLElement;
    projectConfig: DMProjectConfig;
    renderer?: {
        getSurface?: () => HTMLElement | null;
    };
    state: Record<string, unknown>;
}

export interface GeoJsonAdapterInstance {
    mount: () => void;
    destroy: () => void;
}

export declare function createGeoJsonAdapter(options: GeoJsonAdapterOptions): GeoJsonAdapterInstance;

export { createGeoJsonAdapter as default } from './geoJsonAdapter.js';
