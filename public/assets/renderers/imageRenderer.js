const DEFAULT_VIEWBOX = { width: 1920, height: 1080 };

/**
 * Image renderer placeholder. Responsible for producing the canvas container and managing clamped pan/zoom.
 * @param {{ host: HTMLElement; projectConfig: object; runtimeConfig: object; state: object }} options
 */
export function createImageRenderer(options) {
    const { host, projectConfig } = options;

    if (!(host instanceof HTMLElement)) {
        throw new Error('Developer Map: renderer host missing.');
    }

    const view = document.createElement('div');
    view.className = 'dm-canvas';

    const background = document.createElement('div');
    background.className = 'dm-canvas__background';
    background.innerHTML = `
        <span>Mapa projektu</span>
        <small>Integrácia podkladu bude doplnená podľa konfigurácie.</small>
    `;

    view.appendChild(background);
    host.appendChild(view);

    let zoomLevel = 1;
    const clamp = projectConfig.renderer?.clamp ?? true;
    const bounds = projectConfig.renderer?.size ?? DEFAULT_VIEWBOX;

    function setZoom(nextZoom) {
        zoomLevel = Math.min(Math.max(nextZoom, 0.5), 4);
        view.style.setProperty('--dm-zoom', String(zoomLevel));
    }

    function clampToBounds(position) {
        if (!clamp) return position;
        const x = Math.min(Math.max(position.x, 0), bounds.width);
        const y = Math.min(Math.max(position.y, 0), bounds.height);
        return { x, y };
    }

    function destroy() {
        host.innerHTML = '';
    }

    function getSurface() {
        return view;
    }

    return {
        mount() {
            /* Mounting handled in factory */
        },
        destroy,
        setZoom,
        clampToBounds,
        getSurface,
    };
}

export default createImageRenderer;
