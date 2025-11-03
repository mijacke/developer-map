(() => {
    const config = window.dmFrontendConfig || {};
    const endpoint = typeof config.endpoint === 'string' ? config.endpoint : '';

    if (!endpoint) {
        console.warn('[Developer Map] Missing REST endpoint configuration.');
        return;
    }

    const AVAILABLE_KEYWORDS = ['available', 'free', 'voln', 'volne', 'volny', 'volny apartman', 'volne apartmany'];

    // Map to store popup instances per container
    const popupInstancesMap = new WeakMap();

    function ensureStyles() {
        const STYLE_ID = 'dm-map-viewer-style';
        if (document.getElementById(STYLE_ID)) {
            return;
        }
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .dm-map-viewer { font-family: 'Inter', 'Segoe UI', sans-serif; margin: 1.5rem 0; }
            .dm-map-viewer__card { border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 18px; padding: 24px; background: #ffffff; box-shadow: 0 18px 38px rgba(15, 23, 42, 0.06); display: grid; gap: 24px; }
            .dm-map-viewer__header h3 { margin: 0; font-size: 1.4rem; color: #1c134f; }
            .dm-map-viewer__header p { margin: 8px 0 0; color: #475569; line-height: 1.5; }
            .dm-map-viewer__surface { position: relative; border-radius: 20px; overflow: hidden; background: #0f172a; }
            .dm-map-viewer__image { width: 100%; height: auto; display: block; }
            .dm-map-viewer__overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
            .dm-map-viewer__regions { pointer-events: none; }
            .dm-map-viewer__region { fill: rgba(52, 69, 235, 0.72); stroke: none; pointer-events: auto; transition: fill 0.2s ease, opacity 0.2s ease; opacity: 0.88; outline: none; }
            .dm-map-viewer__region:hover { opacity: 1; fill: rgba(52, 69, 235, 0.88); }
            .dm-map-viewer__region.is-active { opacity: 1; fill: rgba(52, 69, 235, 0.92); }
            .dm-map-viewer__region:focus { outline: none; }
            .dm-map-viewer__region:focus-visible { outline: none; }
            .dm-map-viewer__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
            .dm-map-viewer__item { display: flex; align-items: center; gap: 12px; justify-content: space-between; border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 12px; padding: 12px 16px; background: #f8fafc; }
            .dm-map-viewer__item strong { font-weight: 600; color: #1c134f; }
            .dm-map-viewer__badge { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border-radius: 999px; background: rgba(124, 58, 237, 0.12); color: #5b21b6; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
            .dm-map-viewer__error { padding: 16px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); color: #b91c1c; }
            .dm-map-viewer__loading { padding: 16px; border-radius: 12px; background: rgba(30, 64, 175, 0.08); color: #1d4ed8; }
            .dm-map-viewer__empty { margin: 0; padding: 16px; borde+r-radius: 12px; background: rgba(15, 118, 110, 0.08); color: #0f766e; }
            .dm-map-viewer__popover { position: absolute; z-index: 10; display: none; pointer-events: auto; }
            .dm-map-viewer__popover.is-visible { display: block; }
            .dm-map-viewer__popover-card { background: #ffffff; border-radius: 16px; padding: 18px 20px; box-shadow: 0 18px 42px rgba(15, 23, 42, 0.22); min-width: 220px; max-width: 280px; border: 1px solid rgba(15, 23, 42, 0.08); display: flex; flex-direction: column; gap: 12px; }
            .dm-map-viewer__popover-summary { font-weight: 600; font-size: 0.95rem; color: #1c134f; text-align: center; }
            .dm-map-viewer__popover-summary strong { color: #16a34a; font-size: 1.05rem; margin-right: 6px; }
            .dm-map-viewer__popover-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: #334155; }
            .dm-map-viewer__popover-list li { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; }
            .dm-map-viewer__popover-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dm-status-color, #6366f1); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15); }
            .dm-map-viewer__popover-empty { font-size: 0.85rem; color: #64748b; text-align: center; }
            .dm-map-viewer__popover-cta { border: none; border-radius: 999px; padding: 10px 18px; background: #4d38ff; color: #ffffff; font-weight: 600; font-size: 0.9rem; cursor: pointer; align-self: center; min-width: 140px; text-align: center; transition: transform 0.15s ease, box-shadow 0.15s ease; box-shadow: 0 12px 24px rgba(77, 56, 255, 0.18); }
            .dm-map-viewer__popover-cta:hover { transform: translateY(-1px); box-shadow: 0 16px 32px rgba(77, 56, 255, 0.26); }
            .dm-map-viewer__popover-cta:active { transform: translateY(0); }
        `;
        style.textContent += `
            .dm-location-popup { position: fixed; inset: 0; z-index: 9999; display: none; align-items: flex-start; justify-content: center; padding: clamp(16px, 4vw, 48px); background: rgba(15, 23, 42, 0.62); backdrop-filter: blur(6px); box-sizing: border-box; }
            .dm-location-popup.is-visible { display: flex; }
            .dm-location-popup__backdrop { position: absolute; inset: 0; border-radius: 0; }
            .dm-location-popup__surface { position: relative; background: #ffffff; width: min(1180px, 100%); max-height: min(92vh, 960px); border-radius: 28px; box-shadow: 0 32px 80px rgba(15, 23, 42, 0.25); display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(15, 23, 42, 0.08); }
            .dm-location-popup__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: clamp(20px, 2.8vw, 32px) clamp(24px, 3.2vw, 40px); border-bottom: 1px solid rgba(15, 23, 42, 0.08); background: linear-gradient(145deg, rgba(99, 102, 241, 0.06), rgba(79, 70, 229, 0.04)); }
            .dm-location-popup__titles { display: flex; flex-direction: column; gap: 6px; }
            .dm-location-popup__subtitle { margin: 0; font-size: 0.95rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #6366f1; }
            .dm-location-popup__title { margin: 0; font-size: clamp(1.45rem, 2vw, 1.8rem); font-weight: 700; color: #1c134f; }
            .dm-location-popup__meta { display: flex; gap: 12px; color: #475569; font-size: 0.9rem; }
            .dm-location-popup__close { border: none; background: rgba(15, 23, 42, 0.06); color: #1c134f; width: 42px; height: 42px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }
            .dm-location-popup__close:hover { background: rgba(79, 70, 229, 0.12); transform: translateY(-1px); }
            .dm-location-popup__close:focus-visible { outline: 2px solid #4d38ff; outline-offset: 2px; }
            .dm-location-popup__content { display: grid; grid-template-rows: auto 1fr; gap: 0; flex: 1; overflow: hidden; }
            .dm-location-popup__plan { padding: clamp(20px, 2.5vw, 32px) clamp(24px, 3.2vw, 40px) clamp(16px, 2.5vw, 28px); display: flex; flex-direction: column; gap: clamp(16px, 2vw, 20px); background: #f8fafc; border-bottom: 1px solid rgba(15, 23, 42, 0.06); }
            .dm-location-popup__plan-body { position: relative; border-radius: 24px; overflow: hidden; background: #ffffff; box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06); }
            .dm-location-popup__canvas { position: relative; width: 100%; background: #eef2ff; }
            .dm-location-popup__image { width: 100%; height: auto; display: block; }
            .dm-location-popup__overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
            .dm-location-popup__overlay svg { width: 100%; height: 100%; display: block; }
            .dm-location-popup__areas { pointer-events: none; }
            .dm-location-popup__area { pointer-events: auto; cursor: pointer; fill: var(--dm-area-fill, rgba(99, 102, 241, 0.28)); stroke: var(--dm-area-stroke, rgba(79, 70, 229, 0.65)); stroke-width: var(--dm-area-stroke-width, 1.6); transition: filter 0.25s ease, stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease; }
            .dm-location-popup__area.is-hovered { filter: drop-shadow(0 12px 18px rgba(15, 23, 42, 0.18)); }
            .dm-location-popup__area.is-active { filter: drop-shadow(0 16px 26px rgba(15, 23, 42, 0.28)); stroke-width: 2.4; }
            .dm-location-popup__area.is-dimmed { opacity: 0.35; }
            .dm-location-popup__tooltip { position: absolute; min-width: 240px; max-width: 320px; border-radius: 18px; background: #ffffff; box-shadow: 0 24px 50px rgba(15, 23, 42, 0.22); padding: 18px 20px 20px; display: none; flex-direction: column; gap: 14px; z-index: 5; border: 1px solid rgba(15, 23, 42, 0.08); }
            .dm-location-popup__tooltip.is-visible { display: flex; }
            .dm-location-popup__tooltip-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
            .dm-location-popup__tooltip-status { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 0.95rem; color: #1c134f; margin: 0; }
            .dm-location-popup__tooltip-dot { width: 12px; height: 12px; border-radius: 999px; background: var(--dm-tooltip-color, #16a34a); box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.16); }
            .dm-location-popup__tooltip-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: #1c134f; }
            .dm-location-popup__tooltip-meta { display: grid; gap: 10px; font-size: 0.9rem; color: #334155; }
            .dm-location-popup__tooltip-meta dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; margin: 0; }
            .dm-location-popup__tooltip-meta dt { font-weight: 600; color: #1c134f; }
            .dm-location-popup__tooltip-meta dd { margin: 0; }
            .dm-location-popup__tooltip-cta { margin-top: 4px; border: none; border-radius: 999px; padding: 10px 18px; background: #4d38ff; color: #ffffff; font-weight: 600; cursor: pointer; box-shadow: 0 16px 34px rgba(77, 56, 255, 0.22); transition: transform 0.18s ease, box-shadow 0.18s ease; align-self: flex-start; }
            .dm-location-popup__tooltip-cta:hover { transform: translateY(-1px); box-shadow: 0 22px 42px rgba(77, 56, 255, 0.32); }
            .dm-location-popup__tooltip-close { border: none; background: rgba(148, 163, 184, 0.16); color: #0f172a; width: 32px; height: 32px; border-radius: 999px; cursor: pointer; font-size: 0.95rem; display: inline-flex; align-items: center; justify-content: center; }
            .dm-location-popup__legend { display: flex; flex-wrap: wrap; gap: 12px 18px; margin: 0; padding: 0; list-style: none; font-size: 0.85rem; color: #475569; }
            .dm-location-popup__legend-item { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: rgba(99, 102, 241, 0.08); }
            .dm-location-popup__legend-dot { width: 10px; height: 10px; border-radius: 999px; background: var(--dm-legend-color, #6366f1); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.16); }
            .dm-location-popup__footer { padding: clamp(18px, 2.4vw, 28px) clamp(24px, 3.2vw, 40px) clamp(24px, 3vw, 36px); display: flex; flex-direction: column; gap: clamp(18px, 2.6vw, 28px); background: #ffffff; }
            .dm-location-popup__filters { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
            .dm-location-popup__search { flex: 1 1 220px; display: flex; align-items: center; gap: 10px; background: #f1f5f9; border-radius: 14px; padding: 10px 14px; border: 1px solid transparent; transition: border 0.2s ease, background 0.2s ease; }
            .dm-location-popup__search svg { width: 18px; height: 18px; color: #64748b; }
            .dm-location-popup__search input { flex: 1; border: none; background: transparent; font-size: 0.95rem; color: #1c134f; }
            .dm-location-popup__search input:focus { outline: none; }
            .dm-location-popup__search:focus-within { border-color: rgba(99, 102, 241, 0.5); background: #eef2ff; }
            .dm-location-popup__select { appearance: none; border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 14px; padding: 10px 38px 10px 14px; font-size: 0.95rem; color: #1c134f; background: #f8fafc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='10' viewBox='0 0 16 10' fill='none' stroke='%23525857' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m2 2 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center / 14px 9px; cursor: pointer; transition: border 0.2s ease, background 0.2s ease; }
            .dm-location-popup__select:focus { outline: none; border-color: rgba(99, 102, 241, 0.5); background-color: #eef2ff; }
            .dm-location-popup__counter { margin-left: auto; font-size: 0.9rem; color: #475569; font-weight: 500; }
            .dm-location-popup__table-wrapper { border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 18px; overflow: hidden; background: #f8fafc; box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.08); }
            .dm-location-popup__table { width: 100%; border-collapse: collapse; font-size: 0.92rem; color: #1c134f; }
            .dm-location-popup__table thead { background: rgba(99, 102, 241, 0.08); color: #1c134f; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
            .dm-location-popup__table th, .dm-location-popup__table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid rgba(15, 23, 42, 0.06); }
            .dm-location-popup__table tbody tr:last-child td { border-bottom: none; }
            .dm-location-popup__row { cursor: pointer; transition: background 0.18s ease; }
            .dm-location-popup__row:hover { background: rgba(99, 102, 241, 0.08); }
            .dm-location-popup__row.is-hovered { background: rgba(99, 102, 241, 0.1); }
            .dm-location-popup__row.is-active { background: rgba(79, 70, 229, 0.12); }
            .dm-location-popup__status { display: inline-flex; align-items: center; justify-content: center; min-width: 94px; padding: 6px 14px; border-radius: 999px; font-size: 0.85rem; font-weight: 600; border: none; cursor: pointer; color: #0f172a; background: rgba(99, 102, 241, 0.12); position: relative; overflow: hidden; transition: transform 0.15s ease, box-shadow 0.15s ease; }
            .dm-location-popup__status::before { content: ''; position: absolute; inset: 0; background: var(--dm-status-color, rgba(99, 102, 241, 0.16)); opacity: 0.5; }
            .dm-location-popup__status span { position: relative; z-index: 1; }
            .dm-location-popup__status:hover { transform: translateY(-1px); box-shadow: 0 10px 18px rgba(99, 102, 241, 0.18); }
            .dm-location-popup__empty { padding: 32px 24px; text-align: center; color: #475569; font-size: 0.95rem; }
            .dm-location-popup__empty strong { display: block; font-size: 1.05rem; margin-bottom: 6px; color: #1c134f; }
            .dm-location-popup__badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 600; color: #334155; padding: 6px 12px; border-radius: 999px; background: rgba(148, 163, 184, 0.16); }
            .dm-location-popup__badge-dot { width: 8px; height: 8px; border-radius: 999px; background: currentColor; }
            @media (max-width: 1024px) {
                .dm-location-popup { padding: clamp(12px, 4vw, 24px); }
                .dm-location-popup__surface { border-radius: 22px; max-height: 94vh; }
                .dm-location-popup__header { padding: 20px; }
                .dm-location-popup__plan { padding: 20px; }
                .dm-location-popup__footer { padding: 20px; }
                .dm-location-popup__filters { gap: 10px; }
                .dm-location-popup__search { flex: 1 1 100%; }
                .dm-location-popup__counter { width: 100%; text-align: right; order: 99; }
            }
            @media (max-width: 720px) {
                .dm-location-popup__surface { width: 100%; max-height: 96vh; border-radius: 18px; }
                .dm-location-popup__content { display: flex; flex-direction: column; }
                .dm-location-popup__plan { padding: 18px; }
                .dm-location-popup__plan-body { border-radius: 18px; }
                .dm-location-popup__footer { padding: 18px; }
                .dm-location-popup__table th, .dm-location-popup__table td { padding: 12px 14px; font-size: 0.85rem; }
                .dm-location-popup__tooltip { min-width: 200px; }
            }
            @media (prefers-reduced-motion: reduce) {
                .dm-location-popup, .dm-location-popup * { transition-duration: 0s !important; animation-duration: 0s !important; }
            }
        `;
        document.head.appendChild(style);
    }

    const STATUS_FALLBACK_COLOR = '#6366f1';
    const RENT_PLACEHOLDER = 'Na vyžiadanie';

    function clamp(value, min, max) {
        if (!Number.isFinite(value)) {
            return min;
        }
        return Math.min(max, Math.max(min, value));
    }

    function toRgba(color, alpha = 1) {
        const safeAlpha = clamp(alpha, 0, 1);
        if (!color || typeof color !== 'string') {
            return `rgba(99, 102, 241, ${safeAlpha})`;
        }
        const trimmed = color.trim();
        if (trimmed.startsWith('rgb')) {
            if (trimmed.startsWith('rgba')) {
                return trimmed;
            }
            const values = trimmed
                .replace(/rgba?\(([^)]+)\)/, '$1')
                .split(',')
                .map((part) => Number(part.trim()));
            if (values.length >= 3) {
                const [r, g, b] = values;
                return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
            }
        }
        const hex = trimmed.replace('#', '');
        if (!hex) {
            return `rgba(99, 102, 241, ${safeAlpha})`;
        }
        const normalised = hex.length === 3 ? hex.split('').map((token) => token + token).join('') : hex.substring(0, 6);
        const numeric = Number.parseInt(normalised, 16);
        if (Number.isNaN(numeric)) {
            return `rgba(99, 102, 241, ${safeAlpha})`;
        }
        const r = (numeric >> 16) & 255;
        const g = (numeric >> 8) & 255;
        const b = numeric & 255;
        return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    }

    function normaliseStatusId(value) {
        return String(value ?? '').trim();
    }

    function parsePriceValue(value) {
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : Number.NaN;
        }
        if (typeof value !== 'string') {
            return Number.NaN;
        }
        const cleaned = value
            .replace(/\s+/g, '')
            .replace(/[^0-9,.-]/g, '')
            .replace(/,(?=\d{3}(?:[^0-9]|$))/g, '')
            .replace(/\.(?=\d{3}(?:[^0-9]|$))/g, '');
        const normalised = cleaned.includes(',') && !cleaned.includes('.') ? cleaned.replace(',', '.') : cleaned;
        const numeric = Number(normalised);
        return Number.isFinite(numeric) ? numeric : Number.NaN;
    }

    function formatCountSk(count) {
        const absolute = Math.abs(count);
        if (absolute === 1) {
            return `${count} lokalita`;
        }
        if (absolute >= 2 && absolute <= 4) {
            return `${count} lokality`;
        }
        return `${count} lokalít`;
    }

    function buildStatusesMap(statuses) {
        const map = new Map();
        if (!Array.isArray(statuses)) {
            return map;
        }
        statuses.forEach((status) => {
            if (!status || typeof status !== 'object') {
                return;
            }
            const id = normaliseStatusId(status.id ?? status.key ?? status.value);
            if (!id) {
                return;
            }
            map.set(id, {
                id,
                label: status.label ?? status.name ?? id,
                color: status.color ?? STATUS_FALLBACK_COLOR,
                raw: status,
            });
        });
        return map;
    }

    function createLocationPopup() {
        const root = document.createElement('div');
        root.className = 'dm-location-popup';
        root.hidden = true;
        root.innerHTML = `
            <div class="dm-location-popup__backdrop" data-role="backdrop"></div>
            <div class="dm-location-popup__surface" role="dialog" aria-modal="true" aria-labelledby="dm-location-popup-title">
                <header class="dm-location-popup__header">
                    <div class="dm-location-popup__titles">
                        <p class="dm-location-popup__subtitle" data-role="subtitle"></p>
                        <h2 class="dm-location-popup__title" id="dm-location-popup-title" data-role="title"></h2>
                        <div class="dm-location-popup__meta">
                            <span class="dm-location-popup__badge" data-role="badge" hidden>
                                <span class="dm-location-popup__badge-dot"></span>
                                <span data-role="badge-label"></span>
                            </span>
                        </div>
                    </div>
                    <button type="button" class="dm-location-popup__close" data-role="close" aria-label="Zavrieť detail">&times;</button>
                </header>
                <div class="dm-location-popup__content">
                    <section class="dm-location-popup__plan">
                        <div class="dm-location-popup__plan-body">
                            <div class="dm-location-popup__canvas" data-role="canvas">
                                <img class="dm-location-popup__image" data-role="plan-image" alt="" />
                                <div class="dm-location-popup__overlay">
                                    <svg data-role="plan-overlay" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet">
                                        <defs data-role="pattern-defs"></defs>
                                        <g class="dm-location-popup__areas" data-role="areas"></g>
                                    </svg>
                                </div>
                                <div class="dm-location-popup__tooltip" data-role="tooltip">
                                    <div class="dm-location-popup__tooltip-header">
                                        <p class="dm-location-popup__tooltip-status">
                                            <span class="dm-location-popup__tooltip-dot"></span>
                                            <span data-role="tooltip-status"></span>
                                        </p>
                                        <button type="button" class="dm-location-popup__tooltip-close" data-role="tooltip-close" aria-label="Skryť detail">&times;</button>
                                    </div>
                                    <h3 class="dm-location-popup__tooltip-title" data-role="tooltip-title"></h3>
                                    <div class="dm-location-popup__tooltip-meta">
                                        <dl>
                                            <dt>Plocha</dt>
                                            <dd data-role="tooltip-area"></dd>
                                        </dl>
                                        <dl>
                                            <dt>Cena</dt>
                                            <dd data-role="tooltip-price"></dd>
                                        </dl>
                                        <dl>
                                            <dt>Prenájom</dt>
                                            <dd data-role="tooltip-rent"></dd>
                                        </dl>
                                    </div>
                                    <button type="button" class="dm-location-popup__tooltip-cta" data-role="tooltip-cta">Detail</button>
                                </div>
                            </div>
                            <div class="dm-location-popup__plan-empty" data-role="plan-empty" hidden>
                                <div class="dm-location-popup__empty">
                                    <strong>Pôdorys nie je dostupný</strong>
                                    <span>Nastavte pôdorys v administrácii pre zobrazenie mapy.</span>
                                </div>
                            </div>
                        </div>
                        <ul class="dm-location-popup__legend" data-role="legend"></ul>
                    </section>
                    <section class="dm-location-popup__footer">
                        <div class="dm-location-popup__filters">
                            <label class="dm-location-popup__search" data-role="search-wrapper">
                                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
                                <input type="search" placeholder="Vyhľadať..." data-role="search" aria-label="Vyhľadať lokalitu" />
                            </label>
                            <select class="dm-location-popup__select" data-role="status-filter" aria-label="Filtrovať podľa stavu">
                                <option value="">Všetky stavy</option>
                            </select>
                            <select class="dm-location-popup__select" data-role="price-filter" aria-label="Zoradiť podľa ceny">
                                <option value="">Všetky ceny</option>
                                <option value="asc">Najnižšia cena</option>
                                <option value="desc">Najvyššia cena</option>
                            </select>
                            <span class="dm-location-popup__counter" data-role="counter"></span>
                        </div>
                        <div class="dm-location-popup__table-wrapper">
                            <table class="dm-location-popup__table">
                                <thead>
                                    <tr>
                                        <th>Typ</th>
                                        <th>Názov</th>
                                        <th>Označenie</th>
                                        <th>Rozloha</th>
                                        <th>Cena</th>
                                        <th>Prenájom</th>
                                        <th>Stav</th>
                                    </tr>
                                </thead>
                                <tbody data-role="table-body"></tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        `;

        const backdrop = root.querySelector('[data-role="backdrop"]');
        const surface = root.querySelector('.dm-location-popup__surface');
        const titleEl = root.querySelector('[data-role="title"]');
        const subtitleEl = root.querySelector('[data-role="subtitle"]');
        const badge = root.querySelector('[data-role="badge"]');
        const badgeLabel = root.querySelector('[data-role="badge-label"]');
        const closeButton = root.querySelector('[data-role="close"]');
        const canvas = root.querySelector('[data-role="canvas"]');
        const planImage = root.querySelector('[data-role="plan-image"]');
        const overlay = root.querySelector('[data-role="plan-overlay"]');
        const patternDefs = root.querySelector('[data-role="pattern-defs"]');
        const areasGroup = root.querySelector('[data-role="areas"]');
        const planEmpty = root.querySelector('[data-role="plan-empty"]');
        const legendList = root.querySelector('[data-role="legend"]');
        const tooltip = root.querySelector('[data-role="tooltip"]');
        const tooltipStatus = root.querySelector('[data-role="tooltip-status"]');
        const tooltipTitle = root.querySelector('[data-role="tooltip-title"]');
        const tooltipArea = root.querySelector('[data-role="tooltip-area"]');
        const tooltipPrice = root.querySelector('[data-role="tooltip-price"]');
        const tooltipRent = root.querySelector('[data-role="tooltip-rent"]');
        const tooltipDot = tooltip.querySelector('.dm-location-popup__tooltip-dot');
        const tooltipClose = root.querySelector('[data-role="tooltip-close"]');
        const tooltipCta = root.querySelector('[data-role="tooltip-cta"]');
        const searchInput = root.querySelector('[data-role="search"]');
        const statusFilter = root.querySelector('[data-role="status-filter"]');
        const priceFilter = root.querySelector('[data-role="price-filter"]');
        const counterEl = root.querySelector('[data-role="counter"]');
        const tableBody = root.querySelector('[data-role="table-body"]');

        const state = {
            open: false,
            project: null,
            region: null,
            blueprint: null,
            statuses: new Map(),
            floors: [],
            rows: [],
            filteredRows: [],
            areaElements: new Map(),
            areaByFloor: new Map(),
            areaById: new Map(),
            searchTerm: '',
            statusFilter: '',
            priceOrder: '',
            activeAreaId: null,
            hoverAreaId: null,
            previousBodyOverflow: '',
        };

        document.body.appendChild(root);

        function hideTooltip() {
            tooltip.classList.remove('is-visible');
            tooltip.style.left = '';
            tooltip.style.top = '';
            tooltipCta.onclick = null;
        }

        function closePopup() {
            if (!state.open) {
                return;
            }
            state.open = false;
            root.classList.remove('is-visible');
            root.hidden = true;
            surface.setAttribute('aria-hidden', 'true');
            hideTooltip();
            state.activeAreaId = null;
            state.hoverAreaId = null;
            document.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('resize', repositionActiveTooltip);
            if (typeof state.previousBodyOverflow === 'string') {
                document.body.style.overflow = state.previousBodyOverflow;
            }
        }

        function handleKeydown(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                closePopup();
            }
        }

        closeButton.addEventListener('click', closePopup);
        backdrop.addEventListener('click', closePopup);
        tooltipClose.addEventListener('click', hideTooltip);

        function normaliseBlueprint(region) {
            const raw = region?.meta?.blueprint ?? region?.blueprint ?? null;
            if (!raw || typeof raw !== 'object') {
                return null;
            }
            const width = Number(raw?.viewBox?.width ?? raw?.size?.width ?? raw?.width);
            const height = Number(raw?.viewBox?.height ?? raw?.size?.height ?? raw?.height);
            return {
                id: String(region?.id ?? 'region-blueprint'),
                image: raw.image ?? raw.imageUrl ?? raw.source ?? '',
                alt: raw.alt ?? region?.label ?? region?.name ?? 'Pôdorys lokality',
                width: Number.isFinite(width) && width > 0 ? width : 1280,
                height: Number.isFinite(height) && height > 0 ? height : 720,
                areas: Array.isArray(raw.areas) ? raw.areas : [],
            };
        }

        function normaliseBlueprintAreas(blueprint) {
            const entries = [];
            if (!blueprint || !Array.isArray(blueprint.areas)) {
                return entries;
            }
            blueprint.areas.forEach((area, index) => {
                if (!area || typeof area !== 'object') {
                    return;
                }
                const targetId = normaliseStatusId(
                    area.floorId ?? area.childId ?? area.targetId ?? area.target ?? area.for ?? area.ref ?? area.id,
                );
                const areaId = normaliseStatusId(area.id ?? (targetId ? `${targetId}` : `area-${index + 1}`)) || `area-${index + 1}`;
                const pointsSource = Array.isArray(area.points)
                    ? area.points
                    : Array.isArray(area?.geometry?.points)
                        ? area.geometry.points
                        : [];
                if (pointsSource.length < 3) {
                    return;
                }
                const converted = [];
                let usesNormalised = true;
                let minX = Number.POSITIVE_INFINITY;
                let minY = Number.POSITIVE_INFINITY;
                let maxX = Number.NEGATIVE_INFINITY;
                let maxY = Number.NEGATIVE_INFINITY;
                pointsSource.forEach((point) => {
                    const px = Number(Array.isArray(point) ? point[0] : point?.x ?? point?.X);
                    const py = Number(Array.isArray(point) ? point[1] : point?.y ?? point?.Y);
                    if (!Number.isFinite(px) || !Number.isFinite(py)) {
                        return;
                    }
                    if (px > 1 || py > 1 || px < 0 || py < 0) {
                        usesNormalised = false;
                    }
                    converted.push([px, py]);
                    if (px < minX) minX = px;
                    if (py < minY) minY = py;
                    if (px > maxX) maxX = px;
                    if (py > maxY) maxY = py;
                });
                if (converted.length < 3) {
                    return;
                }
                const scaleX = usesNormalised ? blueprint.width : 1;
                const scaleY = usesNormalised ? blueprint.height : 1;
                const pointsAttr = converted
                    .map(([x, y]) => {
                        const px = usesNormalised ? x * blueprint.width : x;
                        const py = usesNormalised ? y * blueprint.height : y;
                        return `${px},${py}`;
                    })
                    .join(' ');
                const centroid = [
                    ((minX + maxX) / 2) * scaleX,
                    ((minY + maxY) / 2) * scaleY,
                ];
                entries.push({
                    areaId,
                    targetId: targetId || areaId,
                    label: area.label ?? area.name ?? areaId,
                    fillColor: area.color ?? null,
                    fillOpacity: typeof area.opacity === 'number' ? area.opacity : null,
                    strokeColor: area.strokeColor ?? null,
                    strokeWidth: typeof area.strokeWidth === 'number' ? area.strokeWidth : null,
                    pattern: area.pattern ?? null,
                    pointsAttr,
                    centroid,
                    raw: area,
                });
            });
            return entries;
        }

        function buildPattern(areaEntry, index, baseColor) {
            const patternConfig = areaEntry.pattern;
            const fallbackFill = toRgba(areaEntry.fillColor ?? baseColor, areaEntry.fillOpacity ?? 0.32);
            if (!patternConfig || typeof patternConfig !== 'object') {
                return { fill: fallbackFill, markup: '', baseFill: fallbackFill };
            }
            const type = String(patternConfig.type ?? '').toLowerCase();
            if (!type || type === 'solid') {
                return { fill: fallbackFill, markup: '', baseFill: fallbackFill };
            }
            const patternId = `dm-location-pattern-${state.blueprint?.id ?? 'bp'}-${areaEntry.areaId}-${index}`;
            const spacing = clamp(Number(patternConfig.spacing ?? 16), 4, 120);
            const strokeWidth = clamp(Number(patternConfig.strokeWidth ?? 2), 0.5, 8);
            const strokeColor = toRgba(patternConfig.color ?? baseColor, patternConfig.opacity ?? 0.45);
            const background = toRgba(patternConfig.background ?? baseColor, patternConfig.backgroundOpacity ?? 0.18);
            let markup = '';
            if (type === 'diagonal') {
                markup = `
                    <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}" patternTransform="rotate(45)">
                        <rect width="${spacing}" height="${spacing}" fill="${background}"></rect>
                        <rect width="${strokeWidth}" height="${spacing}" fill="${strokeColor}"></rect>
                    </pattern>
                `;
            } else if (type === 'grid') {
                markup = `
                    <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}">
                        <rect width="${spacing}" height="${spacing}" fill="${background}"></rect>
                        <path d="M0 0 H ${spacing} M0 0 V ${spacing}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round"></path>
                    </pattern>
                `;
            } else if (type === 'dots' || type === 'dot') {
                const radius = clamp(Number(patternConfig.radius ?? spacing / 6), 1, spacing / 2);
                const opacity = clamp(patternConfig.opacity ?? 0.6, 0, 1);
                markup = `
                    <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}">
                        <rect width="${spacing}" height="${spacing}" fill="${background}"></rect>
                        <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${radius}" fill="${strokeColor}" opacity="${opacity}"></circle>
                    </pattern>
                `;
            } else if (type === 'cross') {
                markup = `
                    <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${spacing}" height="${spacing}">
                        <rect width="${spacing}" height="${spacing}" fill="${background}"></rect>
                        <path d="M0 0 L ${spacing} ${spacing} M${spacing} 0 L0 ${spacing}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round"></path>
                    </pattern>
                `;
            } else {
                return { fill: fallbackFill, markup: '', baseFill: fallbackFill };
            }
            return { fill: `url(#${patternId})`, markup, baseFill: fallbackFill };
        }

        function clearAreas() {
            state.areaElements.forEach((entry) => {
                entry.element.remove();
            });
            state.areaElements.clear();
            state.areaByFloor.clear();
            state.areaById.clear();
            patternDefs.innerHTML = '';
        }

        function updateHighlights() {
            state.areaElements.forEach((entry, areaId) => {
                const element = entry.element;
                const isActive = state.activeAreaId === areaId;
                const isHover = !isActive && state.hoverAreaId === areaId;
                const shouldDim = Boolean(state.activeAreaId && state.activeAreaId !== areaId);
                element.classList.toggle('is-active', isActive);
                element.classList.toggle('is-hovered', isHover);
                element.classList.toggle('is-dimmed', shouldDim);
            });
            tableBody.querySelectorAll('tr').forEach((row) => {
                const areaId = row.dataset.areaId;
                const isActive = state.activeAreaId === areaId;
                const isHover = !isActive && state.hoverAreaId === areaId;
                row.classList.toggle('is-active', isActive);
                row.classList.toggle('is-hovered', isHover);
            });
        }

        function repositionActiveTooltip() {
            if (!state.activeAreaId) {
                return;
            }
            const entry = state.areaElements.get(state.activeAreaId);
            if (entry) {
                positionTooltip(entry.element);
            }
        }

        function positionTooltip(polygon) {
            if (!polygon || !state.blueprint) {
                return;
            }
            const bbox = polygon.getBBox();
            const overlayRect = overlay.getBoundingClientRect();
            const svgWidth = state.blueprint.width || overlayRect.width || 1;
            const svgHeight = state.blueprint.height || overlayRect.height || 1;
            const scaleX = overlayRect.width / svgWidth;
            const scaleY = overlayRect.height / svgHeight;
            const tooltipRect = tooltip.getBoundingClientRect();
            let left = bbox.x * scaleX + (bbox.width * scaleX) / 2 - tooltipRect.width / 2;
            let top = bbox.y * scaleY - tooltipRect.height - 18;
            if (top < 12) {
                top = (bbox.y + bbox.height) * scaleY + 18;
            }
            const canvasRect = canvas.getBoundingClientRect();
            left = Math.max(12, Math.min(left, canvasRect.width - tooltipRect.width - 12));
            top = Math.max(12, Math.min(top, canvasRect.height - tooltipRect.height - 12));
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        }

        function showTooltipForArea(areaId) {
            const polygonEntry = state.areaElements.get(areaId);
            if (!polygonEntry) {
                hideTooltip();
                return;
            }
            const floorEntry = state.rows.find((row) => row.areaId === areaId) || state.rows.find((row) => row.floorId === polygonEntry.targetId);
            if (!floorEntry) {
                hideTooltip();
                return;
            }
            tooltipTitle.textContent = floorEntry.name || floorEntry.designation || 'Detail lokality';
            const statusLabel = floorEntry.statusLabel || 'Bez stavu';
            tooltipStatus.textContent = statusLabel;
            const statusColor = floorEntry.statusColor || STATUS_FALLBACK_COLOR;
            tooltipDot.style.setProperty('--dm-tooltip-color', statusColor);
            tooltipDot.style.background = statusColor;
            tooltipArea.textContent = floorEntry.area || 'Neuvedená';
            tooltipPrice.textContent = floorEntry.price || 'Neuvedená';
            tooltipRent.textContent = floorEntry.rent || RENT_PLACEHOLDER;
            const detailUrl = floorEntry.detailUrl || state.region?.meta?.detailUrl || state.region?.detailUrl || '';
            if (detailUrl) {
                tooltipCta.hidden = false;
                tooltipCta.onclick = () => {
                    window.location.href = detailUrl;
                };
            } else {
                tooltipCta.hidden = true;
                tooltipCta.onclick = null;
            }
            tooltip.classList.add('is-visible');
            positionTooltip(polygonEntry.element);
        }

        function focusArea(areaId, options = {}) {
            const showTooltipFlag = Boolean(options.showTooltip);
            if (areaId && !state.areaElements.has(areaId)) {
                state.activeAreaId = null;
                updateHighlights();
                hideTooltip();
                return;
            }
            state.activeAreaId = areaId || null;
            updateHighlights();
            if (state.activeAreaId && showTooltipFlag) {
                showTooltipForArea(state.activeAreaId);
            } else {
                hideTooltip();
            }
        }

        function renderLegendFromRows(rows) {
            const legendMap = new Map();
            rows.forEach((row) => {
                const statusId = normaliseStatusId(row.statusId);
                const label = row.statusLabel || state.statuses.get(statusId)?.label || 'Bez stavu';
                const color = row.statusColor || state.statuses.get(statusId)?.color || STATUS_FALLBACK_COLOR;
                if (!legendMap.has(statusId)) {
                    legendMap.set(statusId, { label, color, count: 0 });
                }
                legendMap.get(statusId).count += 1;
            });
            legendList.innerHTML = '';
            legendMap.forEach((entry) => {
                const li = document.createElement('li');
                li.className = 'dm-location-popup__legend-item';
                li.style.setProperty('--dm-legend-color', entry.color);
                const dot = document.createElement('span');
                dot.className = 'dm-location-popup__legend-dot';
                const text = document.createElement('span');
                text.textContent = entry.count ? `${entry.label} (${entry.count})` : entry.label;
                li.append(dot, text);
                legendList.appendChild(li);
            });
        }

        function renderRows(rows) {
            tableBody.innerHTML = '';
            if (!rows.length) {
                const emptyRow = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 7;
                cell.className = 'dm-location-popup__empty';
                cell.innerHTML = '<strong>Žiadne naviazané lokality</strong><span>Pre túto lokalitu zatiaľ nie sú priradené deti.</span>';
                emptyRow.appendChild(cell);
                tableBody.appendChild(emptyRow);
                return;
            }
            const fragment = document.createDocumentFragment();
            rows.forEach((row) => {
                const tr = document.createElement('tr');
                tr.className = 'dm-location-popup__row';
                tr.dataset.areaId = row.areaId;
                tr.dataset.floorId = row.floorId;

                const values = [
                    row.type || '—',
                    row.name || '—',
                    row.designation || '—',
                    row.area || '—',
                    row.price || '—',
                    row.rent || RENT_PLACEHOLDER,
                ];

                values.forEach((value, index) => {
                    const td = document.createElement('td');
                    td.textContent = value || '—';
                    if (index === 3 && value && typeof value === 'string' && !value.toLowerCase().includes('m')) {
                        td.textContent = `${value} m²`;
                    }
                    tr.appendChild(td);
                });

                const statusCell = document.createElement('td');
                const statusButton = document.createElement('button');
                statusButton.type = 'button';
                statusButton.className = 'dm-location-popup__status';
                statusButton.style.setProperty('--dm-status-color', row.statusColor || STATUS_FALLBACK_COLOR);
                statusButton.innerHTML = `<span>${row.statusLabel || 'Bez stavu'}</span>`;
                statusButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    focusArea(row.areaId, { showTooltip: true });
                });
                statusCell.appendChild(statusButton);
                tr.appendChild(statusCell);

                tr.addEventListener('mouseenter', () => {
                    state.hoverAreaId = row.areaId;
                    updateHighlights();
                });
                tr.addEventListener('mouseleave', () => {
                    state.hoverAreaId = null;
                    updateHighlights();
                });
                tr.addEventListener('click', () => {
                    focusArea(row.areaId, { showTooltip: true });
                });

                fragment.appendChild(tr);
            });
            tableBody.appendChild(fragment);
        }

        function updateStatusFilterOptions() {
            const previous = statusFilter.value;
            statusFilter.innerHTML = '';
            const optionAll = document.createElement('option');
            optionAll.value = '';
            optionAll.textContent = 'Všetky stavy';
            statusFilter.appendChild(optionAll);
            const seen = new Map();
            state.rows.forEach((row) => {
                const id = normaliseStatusId(row.statusId);
                const label = row.statusLabel || state.statuses.get(id)?.label || 'Bez stavu';
                if (!seen.has(id) && id) {
                    seen.set(id, label);
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = label;
                    statusFilter.appendChild(option);
                }
            });
            if (previous && seen.has(previous)) {
                statusFilter.value = previous;
            } else {
                statusFilter.value = '';
            }
        }

        function updateCounter(filteredCount, totalCount) {
            counterEl.textContent = `${formatCountSk(filteredCount)} • ${formatCountSk(totalCount)} celkom`;
        }

        function applyFilters(options = {}) {
            const preserveActive = options.preserveActive !== false;
            const searchTerm = state.searchTerm.trim().toLowerCase();
            let rows = state.rows.slice();
            if (searchTerm) {
                rows = rows.filter((row) => {
                    const haystack = [row.name, row.designation, row.type, row.area]
                        .map((value) => String(value ?? '').toLowerCase());
                    return haystack.some((segment) => segment.includes(searchTerm));
                });
            }
            if (state.statusFilter) {
                rows = rows.filter((row) => normaliseStatusId(row.statusId) === state.statusFilter);
            }
            if (state.priceOrder === 'asc' || state.priceOrder === 'desc') {
                rows.sort((a, b) => {
                    const priceA = parsePriceValue(a.price);
                    const priceB = parsePriceValue(b.price);
                    if (Number.isNaN(priceA) && Number.isNaN(priceB)) return 0;
                    if (Number.isNaN(priceA)) return state.priceOrder === 'asc' ? 1 : -1;
                    if (Number.isNaN(priceB)) return state.priceOrder === 'asc' ? -1 : 1;
                    return state.priceOrder === 'asc' ? priceA - priceB : priceB - priceA;
                });
            }
            state.filteredRows = rows;
            renderRows(rows);
            renderLegendFromRows(rows);
            updateCounter(rows.length, state.rows.length);
            if (!preserveActive && state.activeAreaId && !rows.some((row) => row.areaId === state.activeAreaId)) {
                focusArea(null);
            } else {
                updateHighlights();
            }
        }

        function setupBlueprint(areaEntries) {
            clearAreas();
            if (!state.blueprint || !state.blueprint.image) {
                planEmpty.hidden = false;
                canvas.style.display = 'none';
                if (planImage.src) {
                    planImage.removeAttribute('src');
                }
                return;
            }
            canvas.style.display = '';
            planEmpty.hidden = Array.isArray(areaEntries) && areaEntries.length > 0;
            planImage.src = state.blueprint.image;
            planImage.alt = state.blueprint.alt || 'Pôdorys lokality';
            overlay.setAttribute('viewBox', `0 0 ${state.blueprint.width} ${state.blueprint.height}`);
            patternDefs.innerHTML = '';
            state.areaElements.clear();
            (Array.isArray(areaEntries) ? areaEntries : []).forEach((area, index) => {
                state.areaById.set(area.areaId, area);
                if (!state.areaByFloor.has(area.targetId)) {
                    state.areaByFloor.set(area.targetId, []);
                }
                state.areaByFloor.get(area.targetId).push(area.areaId);
                const row = state.rows.find((entry) => entry.floorId === area.targetId);
                const statusColor = row?.statusColor || STATUS_FALLBACK_COLOR;
                const { fill, markup, baseFill } = buildPattern(area, index, statusColor);
                if (markup) {
                    patternDefs.insertAdjacentHTML('beforeend', markup);
                }
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', area.pointsAttr);
                polygon.dataset.areaId = area.areaId;
                polygon.dataset.floorId = area.targetId;
                polygon.style.setProperty('--dm-area-fill', baseFill);
                polygon.style.setProperty('--dm-area-stroke', toRgba(area.strokeColor ?? statusColor, 0.85));
                polygon.style.setProperty('--dm-area-stroke-width', String(area.strokeWidth ?? 1.8));
                polygon.setAttribute('fill', fill);
                areasGroup.appendChild(polygon);
                state.areaElements.set(area.areaId, {
                    element: polygon,
                    targetId: area.targetId,
                    area,
                });
                polygon.addEventListener('mouseenter', () => {
                    state.hoverAreaId = area.areaId;
                    updateHighlights();
                });
                polygon.addEventListener('mouseleave', () => {
                    state.hoverAreaId = null;
                    updateHighlights();
                });
                polygon.addEventListener('click', (event) => {
                    event.preventDefault();
                    focusArea(area.areaId, { showTooltip: true });
                });
            });
            if (planImage.complete) {
                repositionActiveTooltip();
            } else {
                planImage.addEventListener('load', repositionActiveTooltip, { once: true });
            }
        }

        searchInput.addEventListener('input', () => {
            state.searchTerm = searchInput.value || '';
            applyFilters();
        });

        statusFilter.addEventListener('change', () => {
            state.statusFilter = statusFilter.value || '';
            applyFilters({ preserveActive: true });
        });

        priceFilter.addEventListener('change', () => {
            const value = priceFilter.value;
            state.priceOrder = value === 'asc' || value === 'desc' ? value : '';
            applyFilters({ preserveActive: true });
        });

        return {
            open(payload) {
                if (!payload || typeof payload !== 'object') {
                    return;
                }
                state.project = payload.project || null;
                state.region = payload.region || null;
                state.floors = Array.isArray(payload.floors) ? payload.floors.slice() : [];
                state.statuses = buildStatusesMap(payload.statuses || (payload.project?.palette?.statuses ?? []));
                state.blueprint = normaliseBlueprint(state.region);
                const areaEntries = state.blueprint ? normaliseBlueprintAreas(state.blueprint) : [];
                state.areaByFloor.clear();
                state.areaById.clear();
                state.areaElements.clear();
                state.rows = state.floors
                    .map((floor) => {
                        if (!floor || typeof floor !== 'object') {
                            return null;
                        }
                        const floorId = normaliseStatusId(floor.id ?? floor.uuid ?? floor.slug);
                        if (!floorId) {
                            return null;
                        }
                        const statusId = normaliseStatusId(floor.statusId ?? floor.status);
                        let statusInfo = statusId ? state.statuses.get(statusId) : null;
                        if (!statusInfo && floor.statusLabel) {
                            statusInfo = {
                                id: statusId || floor.statusLabel,
                                label: floor.statusLabel,
                                color: floor.statusColor ?? STATUS_FALLBACK_COLOR,
                            };
                            if (statusId && !state.statuses.has(statusId)) {
                                state.statuses.set(statusId, statusInfo);
                            }
                        }
                        const mappedArea = areaEntries.find((entry) => entry.targetId === floorId);
                        return {
                            floor,
                            floorId,
                            areaId: mappedArea ? mappedArea.areaId : floorId,
                            type: floor.type ?? '',
                            name: floor.name ?? floor.title ?? '',
                            designation: floor.designation ?? floor.label ?? '',
                            area: floor.area ?? '',
                            price: floor.price ?? '',
                            rent: floor.rent ?? '',
                            statusId,
                            statusLabel: statusInfo?.label ?? floor.statusLabel ?? '',
                            statusColor: statusInfo?.color ?? floor.statusColor ?? STATUS_FALLBACK_COLOR,
                            detailUrl: floor.detailUrl ?? floor.url ?? '',
                        };
                    })
                    .filter(Boolean);

                setupBlueprint(areaEntries);
                updateStatusFilterOptions();
                state.activeAreaId = null;
                state.hoverAreaId = null;
                state.searchTerm = '';
                state.statusFilter = '';
                state.priceOrder = '';
                searchInput.value = '';
                statusFilter.value = '';
                priceFilter.value = '';
                titleEl.textContent = String(state.region?.label ?? state.region?.name ?? 'Detail lokality');
                subtitleEl.textContent = String(state.project?.name ?? state.project?.title ?? '');
                if (state.project?.badge) {
                    badge.hidden = false;
                    badgeLabel.textContent = String(state.project.badge);
                } else {
                    badge.hidden = true;
                }

                state.previousBodyOverflow = document.body.style.overflow;
                document.body.style.overflow = 'hidden';
                root.hidden = false;
                root.classList.add('is-visible');
                surface.setAttribute('aria-hidden', 'false');
                closeButton.focus({ preventScroll: true });
                state.open = true;
                applyFilters({ preserveActive: false });
                document.addEventListener('keydown', handleKeydown);
                window.addEventListener('resize', repositionActiveTooltip);
            },
            close: closePopup,
            isOpen() {
                return state.open;
            },
        };
    }

    function getLocationPopup(container) {
        // Each container gets its own popup instance
        if (!popupInstancesMap.has(container)) {
            popupInstancesMap.set(container, createLocationPopup());
        }
        return popupInstancesMap.get(container);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async function renderMap(container) {
        const key = container.dataset.dmMapKey;
        if (!key) {
            container.innerHTML = '<p class="dm-map-viewer__error">Chýba identifikátor mapy.</p>';
            return;
        }

        container.classList.add('dm-map-viewer');
        container.innerHTML = '<p class="dm-map-viewer__loading">Načítavam mapu…</p>';

        ensureStyles();

        try {
            // Pokús sa o štandardný REST API endpoint
            let response = await fetch(`${endpoint}?public_key=${encodeURIComponent(key)}`, {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                },
            });

            // Ak zlyhá (404 = REST API endpoint neexistuje), skús alternatívny endpoint
            if (!response.ok && response.status === 404) {
                console.warn('[Developer Map] Standard REST API endpoint failed, trying alternative endpoint...');
                const pluginUrl = window.location.origin + '/wp-content/plugins/developer-map';
                const alternativeUrl = `${pluginUrl}/get-project.php?public_key=${encodeURIComponent(key)}`;
                
                response = await fetch(alternativeUrl, {
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                    },
                });
            }

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const payload = await response.json();
            const project = payload?.project;

            if (!project || typeof project !== 'object') {
                throw new Error('Missing project payload');
            }

            const title = project.name ?? project.title ?? key;
            const description = project.description ?? '';
            const floors = Array.isArray(project.floors) ? project.floors : [];

            // Poskladaj kandidátov na URL obrázka v poradí preferencie
            const imageCandidates = [
                project.image,
                project.imageUrl,
                project.imageurl,
                project.img,
                project?.media?.image,
                project?.media?.heroImage,
            ];

            let imageUrl = '';

            for (const candidate of imageCandidates) {
                if (!candidate) {
                    continue;
                }
                if (typeof candidate === 'string') {
                    const trimmed = candidate.trim();
                    if (trimmed.length > 0) {
                        imageUrl = trimmed;
                        break;
                    }
                    continue;
                }
                if (typeof candidate === 'object') {
                    const nested = candidate.url ?? candidate.src ?? candidate.href ?? candidate.link ?? '';
                    if (typeof nested === 'string' && nested.trim().length > 0) {
                        imageUrl = nested.trim();
                        break;
                    }
                }
            }

            // Debug výpis do konzoly pre chýbajúci obrázok
            if (!imageUrl) {
                console.warn('[Developer Map] Missing image URL for project:', key);
                console.log('[Developer Map] Project data:', project);
            }
            
            const rendererOptions = project.renderer ?? {};
            const viewbox = rendererOptions.size ?? { width: 1280, height: 720 };
            const regions = Array.isArray(project.regions) ? project.regions : [];
            const statuses = Array.isArray(project?.palette?.statuses) ? project.palette.statuses : [];

            const lookupStatus = (statusId) => {
                const sought = String(statusId ?? '').trim();
                if (!sought) return null;
                return (
                    statuses.find((status) => String(status.key) === sought) ||
                    statuses.find((status) => String(status.id ?? '') === sought) ||
                    null
                );
            };

            const baseWidth = viewbox.width || 1280;
            const baseHeight = viewbox.height || 720;

            const polygonsMarkup = regions
                .map((region) => {
                    const points = Array.isArray(region?.geometry?.points) ? region.geometry.points : [];
                    if (points.length < 3) {
                        return '';
                    }
                    const status = lookupStatus(region.statusId ?? region.status);
                    const statusLabel = status?.label ?? region.statusLabel ?? '';
                    const color = status?.color ?? '#6366f1';
                    const pointsAttr = points
                        .map(([x, y]) => {
                            const px = Number(x) * baseWidth;
                            const py = Number(y) * baseHeight;
                            return `${px},${py}`;
                        })
                        .join(' ');
                    return `
                        <polygon
                            class="dm-map-viewer__region"
                            data-region-id="${escapeHtml(region.id)}"
                            points="${escapeHtml(pointsAttr)}"
                            style="--dm-region-color:${escapeHtml(color)}"
                            tabindex="0"
                        ></polygon>
                    `;
                })
                .join('');

            // Zobraz iba interaktívny obrázok bez zoznamu lokalít
            container.innerHTML = `
                <div class="dm-map-viewer__surface">
                    ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" class="dm-map-viewer__image" />` : '<p class="dm-map-viewer__error">Chýba obrázok mapy. Nahrajte obrázok v administrácii.</p>'}
                    ${imageUrl ? `<svg class="dm-map-viewer__overlay" viewBox="0 0 ${escapeHtml(String(baseWidth))} ${escapeHtml(String(baseHeight))}" aria-hidden="true">
                        <g class="dm-map-viewer__regions">${polygonsMarkup}</g>
                    </svg>` : ''}
                </div>
            `;

            const surface = container.querySelector('.dm-map-viewer__surface');
            const overlay = container.querySelector('.dm-map-viewer__overlay');
            const surfaceImage = container.querySelector('.dm-map-viewer__image');

            if (!surface || !overlay) {
                console.warn('[Developer Map] Rendering surface missing for map viewer.');
                return;
            }
            const regionElements = Array.from(container.querySelectorAll('.dm-map-viewer__region'));

            const floorById = new Map();
            floors.forEach((floor) => {
                const id = String(floor?.id ?? floor?.floorId ?? floor?.uuid ?? '').trim();
                if (id) {
                    floorById.set(id, floor);
                }
            });

            const regionById = new Map();
            regions.forEach((region) => {
                if (!region || region.id === undefined || region.id === null) {
                    return;
                }
                regionById.set(String(region.id), region);
            });

            const popover = document.createElement('div');
            popover.className = 'dm-map-viewer__popover';
            popover.innerHTML = `
                <div class="dm-map-viewer__popover-card">
                    <div class="dm-map-viewer__popover-summary" data-role="summary"></div>
                    <ul class="dm-map-viewer__popover-list" data-role="list"></ul>
                    <div class="dm-map-viewer__popover-empty" data-role="empty"></div>
                    <button type="button" class="dm-map-viewer__popover-cta" data-role="cta">Detail</button>
                </div>
            `;
            surface.appendChild(popover);
            const summaryEl = popover.querySelector('[data-role="summary"]');
            const listEl = popover.querySelector('[data-role="list"]');
            const emptyEl = popover.querySelector('[data-role="empty"]');
            const ctaButton = popover.querySelector('[data-role="cta"]');
            let activeRegionId = null;

            const sanitiseId = (value) => String(value ?? '').trim();

            const normaliseLabel = (value) => {
                const str = String(value ?? '').trim().toLowerCase();
                if (!str) {
                    return '';
                }
                let normalised = str;
                try {
                    normalised = str.normalize('NFD');
                } catch (error) {
                    normalised = str;
                }
                return normalised.replace(/[\u0300-\u036f]/g, '');
            };

            const parseAvailability = (statusInfo, statusIdRaw, label) => {
                const explicit = statusInfo?.available;
                if (typeof explicit === 'boolean') {
                    return explicit;
                }
                if (typeof explicit === 'string') {
                    const value = explicit.trim().toLowerCase();
                    if (['true', '1', 'yes', 'ano'].includes(value)) {
                        return true;
                    }
                    if (['false', '0', 'no', 'nie'].includes(value)) {
                        return false;
                    }
                }
                const labelNormalized = normaliseLabel(label);
                const keyNormalized = normaliseLabel(statusInfo?.key ?? statusIdRaw);
                return AVAILABLE_KEYWORDS.some(
                    (keyword) =>
                        labelNormalized.includes(keyword) ||
                        (keyNormalized ? keyNormalized.includes(keyword) : false),
                );
            };

            const summariseRegion = (region) => {
                const children = Array.isArray(region?.children) ? region.children : [];
                const entriesMap = new Map();
                const linkedFloors = [];
                let availableCount = 0;

                children.forEach((childId) => {
                    const floor = floorById.get(sanitiseId(childId));
                    if (!floor) {
                        return;
                    }
                    linkedFloors.push(floor);

                    const statusIdRaw = sanitiseId(floor.statusId ?? floor.status ?? '');
                    const statusInfo = lookupStatus(statusIdRaw);
                    const label =
                        statusInfo?.label ??
                        floor.statusLabel ??
                        (statusIdRaw || 'Bez stavu');
                    const key = (statusInfo?.id ?? statusInfo?.key ?? statusIdRaw) || label;
                    const color = statusInfo?.color ?? floor.statusColor ?? '#6366f1';
                    const entry = entriesMap.get(key) ?? { label, color, count: 0 };
                    entry.count += 1;
                    entriesMap.set(key, entry);

                    if (parseAvailability(statusInfo, statusIdRaw, label)) {
                        availableCount += 1;
                    }
                });

                const entries = Array.from(entriesMap.values()).sort((a, b) => b.count - a.count);
                return { entries, linkedFloors, availableCount };
            };

            const baseFill = 'rgba(52, 69, 235, 0.72)';
            const positiveFill = 'rgba(43, 134, 76, 0.75)';
            const negativeFill = 'rgba(220, 53, 69, 0.75)';
            const neutralFill = 'rgba(148, 163, 184, 0.65)';

            const applyRegionFill = (polygon, summary) => {
                if (!polygon) {
                    return;
                }
                const hasSummary = summary && Array.isArray(summary.entries);
                let fill = baseFill;
                let availabilityState = 'empty';

                if (hasSummary) {
                    if (!summary.entries.length) {
                        fill = neutralFill;
                        availabilityState = 'empty';
                    } else if (summary.availableCount > 0) {
                        fill = positiveFill;
                        availabilityState = 'available';
                    } else {
                        fill = negativeFill;
                        availabilityState = 'unavailable';
                    }
                } else {
                    fill = neutralFill;
                    availabilityState = 'empty';
                }

                polygon.style.fill = fill;
                polygon.style.stroke = fill;
                polygon.style.strokeWidth = '1';
                polygon.style.strokeLinejoin = 'round';
                polygon.style.strokeLinecap = 'round';
                polygon.style.paintOrder = 'fill stroke';
                polygon.style.vectorEffect = 'non-scaling-stroke';
                polygon.dataset.dmAvailability = availabilityState;
            };

            const renderPopover = (region, summary) => {
                if (!summary.entries.length) {
                    summaryEl.innerHTML = '<strong>Žiadne naviazané lokality</strong>';
                    listEl.hidden = true;
                    listEl.innerHTML = '';
                    emptyEl.textContent = 'Pre tento segment nie sú naviazané žiadne lokality.';
                    return;
                }

                const unitLabelSingular = region?.meta?.unitLabel ?? 'apartmán';
                const unitLabelPlural =
                    region?.meta?.unitLabelPlural ??
                    (unitLabelSingular === 'apartmán'
                        ? 'apartmány'
                        : unitLabelSingular.endsWith('a')
                            ? `${unitLabelSingular.slice(0, -1)}y`
                            : `${unitLabelSingular}s`);
                const hasAvailable = summary.availableCount > 0;
                const statusWord = hasAvailable
                    ? summary.availableCount === 1
                        ? 'voľný'
                        : 'voľné'
                    : 'Žiadne voľné';
                const unitsWord = hasAvailable
                    ? summary.availableCount === 1
                        ? unitLabelSingular
                        : unitLabelPlural
                    : unitLabelPlural;
                const headlineText = hasAvailable
                    ? `${summary.availableCount === 1 ? '1' : String(summary.availableCount)} ${statusWord} ${unitsWord}`
                    : `${statusWord} ${unitsWord}`;
                const headlineColor = hasAvailable ? '#16a34a' : '#dc2626';
                summaryEl.innerHTML = `<strong style="color:${headlineColor}">${escapeHtml(headlineText)}</strong>`;
                listEl.hidden = false;
                listEl.innerHTML = summary.entries
                    .map(
                        (entry) => `
                            <li>
                                <span class="dm-map-viewer__popover-dot" style="--dm-status-color:${escapeHtml(entry.color ?? '#6366f1')}"></span>
                                <span>${escapeHtml(entry.label)}</span>
                                <span>${escapeHtml(String(entry.count))}</span>
                            </li>
                        `,
                    )
                    .join('');
                emptyEl.textContent = '';
            };

            const positionPopover = (polygon) => {
                if (!overlay || !surface || popover.style.display === 'none') {
                    return;
                }
                const bbox = polygon.getBBox();
                const overlayRect = overlay.getBoundingClientRect();
                const surfaceRect = surface.getBoundingClientRect();
                const scaleX = overlayRect.width / baseWidth;
                const scaleY = overlayRect.height / baseHeight;
                const centerX = (bbox.x + bbox.width / 2) * scaleX;
                const topY = bbox.y * scaleY;

                const cardRect = popover.getBoundingClientRect();
                let left = centerX - cardRect.width / 2;
                let top = topY - cardRect.height - 16;
                if (top < 8) {
                    top = (bbox.y + bbox.height) * scaleY + 16;
                }
                left = Math.max(8, Math.min(left, surfaceRect.width - cardRect.width - 8));
                top = Math.max(8, Math.min(top, surfaceRect.height - cardRect.height - 8));
                popover.style.left = `${left}px`;
                popover.style.top = `${top}px`;
            };

            const hidePopover = () => {
                if (!activeRegionId) {
                    return;
                }
                activeRegionId = null;
                popover.style.display = 'none';
                popover.classList.remove('is-visible');
                summaryEl.textContent = '';
                listEl.innerHTML = '';
                listEl.hidden = false;
                emptyEl.textContent = '';
                ctaButton.hidden = true;
                ctaButton.onclick = null;
                regionElements.forEach((polygon) => {
                    polygon.classList.remove('is-active');
                    const region = regionById.get(polygon.getAttribute('data-region-id'));
                    const summary = region
                        ? summariseRegion(region)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summary);
                });
            };

            const showPopover = (region, polygon) => {
                const summary = summariseRegion(region);
                renderPopover(region, summary);

                const detailUrlCandidate =
                    region?.meta?.detailUrl ??
                    region?.detailUrl ??
                    region?.url ??
                    (() => {
                        const withUrl = summary.linkedFloors.find((floor) => floor.detailUrl || floor.url);
                        return withUrl ? withUrl.detailUrl ?? withUrl.url : '';
                    })();

                ctaButton.hidden = !detailUrlCandidate && !summary.linkedFloors.length;
                ctaButton.onclick = (event) => {
                    event.preventDefault();
                    const detailPayload = {
                        region,
                        floors: summary.linkedFloors,
                        project,
                        statuses,
                    };
                    const detailEvent = new CustomEvent('dmRegionDetail', {
                        detail: detailPayload,
                        cancelable: true,
                        bubbles: true,
                    });
                    const notCancelled = container.dispatchEvent(detailEvent);
                    if (notCancelled && detailUrlCandidate) {
                        window.location.href = detailUrlCandidate;
                    }
                };

                popover.style.display = 'block';
                popover.classList.add('is-visible');
                positionPopover(polygon);
                applyRegionFill(polygon, summary);
            };

            const openRegion = (polygon) => {
                const regionId = polygon.getAttribute('data-region-id');
                if (!regionId) {
                    return;
                }
                const region = regionById.get(regionId);
                if (!region) {
                    return;
                }
                if (activeRegionId === regionId) {
                    hidePopover();
                    return;
                }
                activeRegionId = regionId;
                regionElements.forEach((el) => {
                    const regionInstance = regionById.get(el.getAttribute('data-region-id'));
                    if (el === polygon) {
                        el.classList.add('is-active');
                    } else {
                        el.classList.remove('is-active');
                    }
                    const summary = regionInstance
                        ? summariseRegion(regionInstance)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(el, summary);
                });
                showPopover(region, polygon);
            };

            regionElements.forEach((polygon) => {
                const region = regionById.get(polygon.getAttribute('data-region-id'));
                const summary = region
                    ? summariseRegion(region)
                    : { entries: [], linkedFloors: [], availableCount: 0 };
                applyRegionFill(polygon, summary);

                polygon.addEventListener('mouseenter', () => {
                    polygon.classList.add('is-active');
                });
                polygon.addEventListener('mouseleave', () => {
                    if (activeRegionId === polygon.getAttribute('data-region-id')) {
                        return;
                    }
                    polygon.classList.remove('is-active');
                    const region = regionById.get(polygon.getAttribute('data-region-id'));
                    const summary = region
                        ? summariseRegion(region)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summary);
                });
                polygon.addEventListener('focus', () => {
                    polygon.classList.add('is-active');
                });
                polygon.addEventListener('blur', () => {
                    if (activeRegionId === polygon.getAttribute('data-region-id')) {
                        return;
                    }
                    polygon.classList.remove('is-active');
                    const region = regionById.get(polygon.getAttribute('data-region-id'));
                    const summary = region
                        ? summariseRegion(region)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summary);
                });
                polygon.addEventListener('click', (event) => {
                    event.preventDefault();
                    openRegion(polygon);
                });
                polygon.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openRegion(polygon);
                    } else if (event.key === 'Escape') {
                        hidePopover();
                    }
                });
            });

            container.addEventListener('dmRegionDetail', (event) => {
                if (!event || typeof event.preventDefault !== 'function') {
                    return;
                }
                event.preventDefault();
                const detail = event.detail || {};
                const popup = getLocationPopup(container);
                popup.open({
                    project,
                    region: detail.region ?? null,
                    floors: Array.isArray(detail.floors) ? detail.floors : [],
                    statuses,
                });
            });

            const handleDocumentClick = (event) => {
                if (!container.contains(event.target)) {
                    hidePopover();
                    return;
                }
                if (
                    !event.target.closest('.dm-map-viewer__popover') &&
                    !event.target.closest('.dm-map-viewer__region')
                ) {
                    hidePopover();
                }
            };
            document.addEventListener('click', handleDocumentClick);
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    hidePopover();
                }
            });

            const updatePolygonPoints = (width, height) => {
                if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
                    return;
                }
                if (overlay) {
                    overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
                }
                regionElements.forEach((polygon) => {
                    const regionId = polygon.getAttribute('data-region-id');
                    const region = regionById.get(regionId);
                    if (!region) {
                        polygon.setAttribute('points', '');
                        applyRegionFill(polygon, { entries: [], linkedFloors: [], availableCount: 0 });
                        return;
                    }
                    const points = Array.isArray(region?.geometry?.points) ? region.geometry.points : [];
                    if (!points.length) {
                        polygon.setAttribute('points', '');
                        applyRegionFill(polygon, { entries: [], linkedFloors: [], availableCount: 0 });
                        return;
                    }
                    const attr = points
                        .map(([x, y]) => {
                            const px = Number(x) * width;
                            const py = Number(y) * height;
                            return `${px},${py}`;
                        })
                        .join(' ');
                    polygon.setAttribute('points', attr);
                    const summary = summariseRegion(region);
                    applyRegionFill(polygon, summary);
                });
                if (activeRegionId) {
                    const activePolygon = regionElements.find(
                        (el) => el.getAttribute('data-region-id') === activeRegionId,
                    );
                    if (activePolygon) {
                        positionPopover(activePolygon);
                    }
                }
            };

            updatePolygonPoints(baseWidth, baseHeight);

            const shouldSyncViewbox =
                !rendererOptions.size ||
                !Number(rendererOptions.size.width) ||
                !Number(rendererOptions.size.height);

            if (surfaceImage && shouldSyncViewbox) {
                const syncToImage = () => {
                    if (surfaceImage.naturalWidth > 0 && surfaceImage.naturalHeight > 0) {
                        updatePolygonPoints(surfaceImage.naturalWidth, surfaceImage.naturalHeight);
                        if (activeRegionId) {
                            const activePolygon = regionElements.find(
                                (el) => el.getAttribute('data-region-id') === activeRegionId,
                            );
                            if (activePolygon) {
                                positionPopover(activePolygon);
                            }
                        }
                    }
                };
                if (surfaceImage.complete) {
                    syncToImage();
                } else {
                    surfaceImage.addEventListener('load', syncToImage, { once: true });
                }
            }

            window.addEventListener('resize', () => {
                if (activeRegionId) {
                    const activePolygon = regionElements.find(
                        (el) => el.getAttribute('data-region-id') === activeRegionId,
                    );
                    if (activePolygon) {
                        positionPopover(activePolygon);
                    }
                }
            });
        } catch (error) {
            console.error('[Developer Map] Failed to load map', error);
            container.innerHTML =
                '<p class="dm-map-viewer__error">Mapa sa nepodarila načítať. Skúste to prosím neskôr.</p>';
        }
    }

    function hydrate() {
        const containers = document.querySelectorAll('[data-dm-map-key]');
        containers.forEach((container) => {
            if (container.dataset.dmMapHydrated === '1') {
                return;
            }
            container.dataset.dmMapHydrated = '1';
            void renderMap(container);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hydrate, { once: true });
    } else {
        hydrate();
    }
})();
