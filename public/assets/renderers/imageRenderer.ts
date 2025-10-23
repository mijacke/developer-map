import type { DMProjectConfig } from '../config/demo.config';

export interface ImageRendererOptions {
    host: HTMLElement;
    projectConfig: DMProjectConfig;
    runtimeConfig?: Record<string, unknown>;
    state?: Record<string, unknown>;
}

export interface ImageRendererInstance {
    mount: () => void;
    destroy: () => void;
    setZoom: (zoom: number) => void;
    clampToBounds: (position: { x: number; y: number }) => { x: number; y: number };
    getSurface: () => HTMLElement | null;
}

export declare function createImageRenderer(options: ImageRendererOptions): ImageRendererInstance;

export { createImageRenderer as default } from './imageRenderer.js';
