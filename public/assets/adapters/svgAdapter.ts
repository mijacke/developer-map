import type { DMProjectConfig } from '../config/demo.config';

export interface SvgAdapterOptions {
    host: HTMLElement;
    projectConfig: DMProjectConfig;
    renderer?: {
        getSurface?: () => HTMLElement | null;
    };
    runtimeConfig?: Record<string, unknown>;
    state: {
        regions: Array<Record<string, unknown>>;
        regionsMap: Map<string, Record<string, unknown>>;
        selectedRegionId: string | null;
    };
}

export interface SvgAdapterInstance {
    mount: () => void;
    highlight: (regionId: string | null) => void;
    setStatus: (regionId: string, statusKey: string) => void;
    updateLotColor: (regionId: string, color: string) => void;
    updateRegionMaskColor: (regionId: string, color: string) => void;
    updatePalette: (palette: DMProjectConfig['palette']) => void;
    removeLot: (regionId: string) => void;
    removeRegion: (regionId: string) => void;
    destroy: () => void;
}

export declare function createSvgAdapter(options: SvgAdapterOptions): SvgAdapterInstance;

export { createSvgAdapter as default } from './svgAdapter.js';
