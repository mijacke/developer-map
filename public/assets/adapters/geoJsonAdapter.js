/**
 * GeoJSON adapter placeholder.
 * This skeleton prepares the structure for parsing and rendering GeoJSON sources.
 * @param {{ host: HTMLElement; projectConfig: object; renderer?: object; state: object }} options
 */
export function createGeoJsonAdapter(options) {
    const { host, renderer } = options;

    function mount() {
        const surface = renderer?.getSurface?.() ?? host;
        if (!surface) return;
        surface.classList.add('dm-map-surface');
        if (!surface.querySelector('.dm-map-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'dm-map-placeholder';
            placeholder.innerHTML = `
                <div class="dm-map-placeholder__inner">
                    <span>GeoJSON renderer pripravený</span>
                    <small>Implementácia bude doplnená počas integrácie dát.</small>
                </div>
            `;
            surface.appendChild(placeholder);
        }
    }

    function destroy() {
        const surface = renderer?.getSurface?.() ?? host;
        if (!surface) return;
        const placeholder = surface.querySelector('.dm-map-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
    }

    return {
        mount,
        destroy,
    };
}

export default createGeoJsonAdapter;
