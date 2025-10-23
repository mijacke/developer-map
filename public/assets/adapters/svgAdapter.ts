import type { DMProjectConfig } from '../config/demo.config';

export interface SvgAdapterOptions {
    host: HTMLElement;
    projectConfig: DMProjectConfig;
    renderer?: {
        getSurface?: () => HTMLElement | null;
    };
    runtimeConfig?: Record<string, unknown>;
    state: {
        lots: Array<Record<string, unknown>>;
        lotsMap: Map<string, Record<string, unknown>>;
        selectedLotId: string | null;
    };
}

export interface SvgAdapterInstance {
    mount: () => void;
    highlight: (lotId: string | null) => void;
    setStatus: (lotId: string, statusKey: string) => void;
    updateLotColor: (lotId: string, color: string) => void;
    updatePalette: (palette: DMProjectConfig['palette']) => void;
    removeLot: (lotId: string) => void;
    destroy: () => void;
}

export declare function createSvgAdapter(options: SvgAdapterOptions): SvgAdapterInstance;

export { createSvgAdapter as default } from './svgAdapter.js';
