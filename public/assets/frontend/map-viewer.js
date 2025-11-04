(() => {
    const config = window.dmFrontendConfig || {};
    const endpoint = typeof config.endpoint === 'string' ? config.endpoint : '';

    if (!endpoint) {
        console.warn('[Developer Map] Missing REST endpoint configuration.');
        return;
    }

    const AVAILABLE_KEYWORDS = ['available', 'free', 'voln', 'volne', 'volny', 'volny apartman', 'volne apartmany'];

    const DASHBOARD_TOOLBAR_ICONS = {
        search: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
        chevron: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    };

    const DASHBOARD_ACTION_ICONS = {
        open: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.9598 17.4821L19.6287 5.49985C20.5944 5.02976 21.2663 4.04695 21.2663 2.9C21.2663 1.29891 19.9674 0 18.3663 0C16.9607 0 15.7891 1.00166 15.524 2.3287L7.3892 3.49102C6.90403 2.5694 5.94674 1.93343 4.83314 1.93343C3.23205 1.93343 1.93314 3.23234 1.93314 4.83343C1.93314 5.92383 2.54301 6.86198 3.43215 7.35759L2.39482 13.5845C1.03443 13.824 0 15.0049 0 16.4334C0 18.0345 1.29891 19.3334 2.9 19.3334C3.93559 19.3334 4.83923 18.7856 5.3505 17.9684L17.436 20.6541C17.6123 22.0861 18.8198 23.2 20.3 23.2C21.9011 23.2 23.2 21.9011 23.2 20.3C23.2 18.9266 22.2418 17.7822 20.9598 17.4821ZM4.30099 13.909L5.33832 7.68239C6.51166 7.47562 7.44256 6.56821 7.67572 5.40444L15.8105 4.24241C16.1965 4.97495 16.88 5.5245 17.7068 5.71793L19.0379 17.7002C18.549 17.9388 18.1366 18.3063 17.8483 18.765L5.76404 16.0793C5.64891 15.1409 5.09211 14.3489 4.30099 13.909Z" fill="#2E1F7E"/></svg>',
        edit: '<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.99414 15.2877C1.99416 17.79 2.47827 19.4353 3.54395 20.4644C4.61213 21.4958 6.3227 21.9644 8.91895 21.9644H15.584C18.1806 21.9644 19.8909 21.4957 20.959 20.4644C22.0247 19.4354 22.5088 17.7902 22.5088 15.2877V13.1422C22.5089 12.6732 22.9013 12.3079 23.3652 12.3101C23.8237 12.3101 24.2103 12.6687 24.2168 13.1304C24.3661 16.3022 24.1111 18.9516 22.8447 20.8004C21.5625 22.6721 19.2932 23.6609 15.5869 23.6324H15.583C13.7562 23.5923 11.929 23.6751 10.1455 23.6695C8.38109 23.664 6.69074 23.5707 5.22559 23.1685C3.75499 22.7648 2.49702 22.0457 1.61816 20.7828C0.741989 19.5234 0.263834 17.7531 0.289062 15.2886V15.2857C0.33034 13.521 0.244166 11.7602 0.25 10.0357C0.255772 8.3316 0.352901 6.69676 0.770508 5.27887C1.19013 3.85419 1.93677 2.63863 3.24316 1.79059C4.54383 0.946463 6.3716 0.485869 8.91895 0.508362V0.507385H11.1406C11.4041 0.507393 11.621 0.607205 11.7695 0.772034C11.914 0.932426 11.9814 1.13978 11.9814 1.33942C11.9814 1.53921 11.9143 1.74741 11.7695 1.90778C11.6208 2.07248 11.4032 2.17197 11.1396 2.17145H11.1318V2.17047C8.19979 2.07322 5.89969 2.19213 4.34082 3.09625C2.82145 3.97765 1.94819 5.64801 1.99414 8.8443V15.2877Z" fill="#2E1F7E" stroke="#2E1F7E" stroke-width="0.5"/><path d="M19.4894 0.25C20.6352 0.25 21.7542 0.800077 22.8342 1.84277C23.9131 2.88445 24.4875 3.96743 24.4875 5.08203C24.4875 6.19654 23.9129 7.2793 22.8342 8.32129L14.0754 16.7744L14.0676 16.7822L14.0666 16.7812C13.5286 17.2598 12.8627 17.5815 12.1457 17.709L12.1359 17.7109L8.7912 18.1748C8.01463 18.294 7.18442 18.0896 6.60272 17.5332L6.59784 17.5283C6.04202 16.9641 5.79366 16.1755 5.93378 15.4043L6.41522 12.1807L6.4162 12.1709C6.54829 11.4716 6.88513 10.8237 7.38397 10.3037L7.39081 10.2969L16.1447 1.84473C17.2253 0.800587 18.3439 0.250143 19.4894 0.25ZM8.17206 12.2334C8.15028 12.3165 8.12715 12.4128 8.10468 12.5205C8.0356 12.8517 7.96789 13.2707 7.90546 13.6982C7.84307 14.1255 7.78654 14.5564 7.73846 14.9111C7.69156 15.2573 7.65132 15.5481 7.62128 15.6758L7.6203 15.6748C7.56891 15.9155 7.63718 16.1655 7.80585 16.3545C8.00307 16.5195 8.27068 16.588 8.53046 16.5352C8.65989 16.5073 8.95678 16.4682 9.31366 16.4229C9.68165 16.3761 10.1298 16.3214 10.5744 16.2607C11.0197 16.2 11.4571 16.1347 11.8019 16.0684C11.9049 16.0486 11.9976 16.027 12.0793 16.0078L8.17206 12.2334ZM9.20135 10.8887L13.4748 15.0146L19.4308 9.26367C17.5524 8.41348 16.0404 6.95302 15.1613 5.13379L9.20135 10.8887ZM19.4865 1.90527C18.8344 1.90544 18.1468 2.25078 17.3439 3.02637L16.4758 3.86426C17.1943 5.78128 18.7605 7.29287 20.7541 7.98535L21.6301 7.14062C22.4351 6.36408 22.7883 5.70392 22.7883 5.08398C22.7883 4.46401 22.4352 3.80371 21.6301 3.02637C20.8266 2.25069 20.1388 1.90527 19.4865 1.90527Z" fill="#2E1F7E" stroke="#2E1F7E" stroke-width="0.5"/></svg>',
    };

    const PREDEFINED_STATUS_STYLES = {
    volne: { background: '#dcfce7', color: '#15803d' },
    volny: { background: '#dcfce7', color: '#15803d' },
    'volny-apartman': { background: '#dcfce7', color: '#15803d' },
    obsadene: { background: '#fee2e2', color: '#b91c1c' },
    obsadeny: { background: '#fee2e2', color: '#b91c1c' },
    obsadena: { background: '#fee2e2', color: '#b91c1c' },
    predane: { background: '#fee2e2', color: '#b91c1c' },
    predany: { background: '#fee2e2', color: '#b91c1c' },
    predana: { background: '#fee2e2', color: '#b91c1c' },
    rezervovane: { background: '#fef3c7', color: '#b45309' },
    rezervovany: { background: '#fef3c7', color: '#b45309' },
    rezervovana: { background: '#fef3c7', color: '#b45309' },
    unknown: { background: 'rgba(124, 58, 237, 0.12)', color: 'rgba(45, 45, 78, 0.65)' },
    };

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
            .dm-map-viewer__region { fill: rgba(52, 69, 235, 0.12); stroke: none; pointer-events: auto; transition: fill 0.18s ease, opacity 0.18s ease; opacity: 0.4; outline: none; }
            .dm-map-viewer__region:hover { opacity: 0.72; }
            .dm-map-viewer__region.is-active { opacity: 0.82; }
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
            .dm-location-popup { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; padding: clamp(12px, 2vw, 24px); background: rgba(15, 23, 42, 0.62); backdrop-filter: blur(6px); box-sizing: border-box; }
            .dm-location-popup.is-visible { display: flex; }
            .dm-location-popup__backdrop { position: absolute; inset: 0; border-radius: 0; }
            .dm-location-popup__surface { position: relative; background: #ffffff; width: min(92vw, 1200px); min-height: min(80vh, 640px); height: min(82vh, 760px); max-height: min(82vh, 760px); border-radius: clamp(18px, 2.8vw, 24px); box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22); display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(15, 23, 42, 0.08); }
            .dm-location-popup button,
            .dm-location-popup input,
            .dm-location-popup select { box-shadow: none !important; outline: none !important; }
            .dm-location-popup__header { display: flex; align-items: flex-start; justify-content: space-between; gap: clamp(12px, 2vw, 16px); padding: clamp(16px, 2.5vw, 24px) clamp(20px, 3vw, 32px); border-bottom: none; background: linear-gradient(145deg, rgba(99, 102, 241, 0.06), rgba(79, 70, 229, 0.04)); }
            .dm-location-popup__titles { display: flex; flex-direction: column; gap: clamp(4px, 0.8vw, 6px); }
            .dm-location-popup__subtitle { margin: 0; font-size: clamp(13px, 1.5vw, 14px); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #6366f1; }
            .dm-location-popup__title { margin: 0; font-size: clamp(18px, 2.2vw, 22px); font-weight: 700; color: #1c134f; }
            .dm-location-popup__meta { display: none !important; }
            .dm-location-popup__badge { display: none !important; }
            .dm-location-popup__close { border: none; background: linear-gradient(140deg, #6366f1, #4f46e5) !important; color: #ffffff !important; width: clamp(38px, 5vw, 42px); height: clamp(38px, 5vw, 42px); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: clamp(18px, 2.2vw, 20px); font-weight: 600; line-height: 1; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; flex-shrink: 0; box-shadow: 0 14px 28px rgba(79, 70, 229, 0.28); }
            .dm-location-popup__close:hover { background: linear-gradient(140deg, #4f46e5, #4338ca) !important; transform: translateY(-1px); box-shadow: 0 18px 36px rgba(79, 70, 229, 0.35); }
            .dm-location-popup__close:active { transform: translateY(0); box-shadow: 0 10px 20px rgba(79, 70, 229, 0.25); }
            .dm-location-popup__close:is(:focus, :focus-visible) { outline: none !important; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.32), 0 14px 28px rgba(79, 70, 229, 0.28); }
            .dm-location-popup__content { display: grid; grid-template-rows: minmax(0, auto) minmax(0, 1fr); gap: 0; flex: 1; overflow: hidden; }
            .dm-location-popup__content > * { min-height: 0; }
            .dm-location-popup__plan { padding: clamp(14px, 2.2vw, 22px) clamp(18px, 2.8vw, 32px) clamp(12px, 2vw, 20px); display: flex; flex-direction: column; gap: clamp(12px, 1.8vw, 16px); background: #f8fafc; border-bottom: 1px solid rgba(15, 23, 42, 0.06); }
            .dm-location-popup__plan-body { position: relative; border-radius: clamp(16px, 2.5vw, 20px); overflow: hidden; background: #ffffff; box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06); }
            .dm-location-popup__canvas { position: relative; width: 100%; background: #eef2ff; }
            .dm-location-popup__image { width: 100%; height: auto; display: block; }
            .dm-location-popup__overlay { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
            .dm-location-popup__overlay svg { width: 100%; height: 100%; display: block; }
            .dm-location-popup__areas { pointer-events: none; }
            .dm-location-popup__area { pointer-events: auto; cursor: pointer; fill: var(--dm-area-fill, rgba(99, 102, 241, 0.28)); stroke: var(--dm-area-stroke, rgba(79, 70, 229, 0.65)); stroke-width: var(--dm-area-stroke-width, 1.6); transition: filter 0.25s ease, stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease; }
            .dm-location-popup__area.is-hovered { filter: drop-shadow(0 12px 18px rgba(15, 23, 42, 0.18)); }
            .dm-location-popup__area.is-active { filter: drop-shadow(0 16px 26px rgba(15, 23, 42, 0.28)); stroke-width: 2.4; }
            .dm-location-popup__area.is-dimmed { opacity: 0.35; }
            .dm-location-popup__tooltip { position: absolute; min-width: clamp(200px, 28vw, 260px); max-width: clamp(260px, 35vw, 320px); border-radius: clamp(14px, 2vw, 16px); background: #ffffff; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.2); padding: clamp(14px, 2vw, 16px) clamp(16px, 2.2vw, 18px); display: none; flex-direction: column; gap: clamp(10px, 1.5vw, 12px); z-index: 5; border: 1px solid rgba(15, 23, 42, 0.08); }
            .dm-location-popup__tooltip.is-visible { display: flex; }
            .dm-location-popup__tooltip-header { display: flex; justify-content: space-between; align-items: flex-start; gap: clamp(10px, 1.5vw, 12px); }
            .dm-location-popup__tooltip-status { display: flex; align-items: center; gap: clamp(8px, 1.2vw, 10px); font-weight: 600; font-size: clamp(13px, 1.5vw, 14px); color: #1c134f; margin: 0; }
            .dm-location-popup__tooltip-dot { width: clamp(10px, 1.4vw, 12px); height: clamp(10px, 1.4vw, 12px); border-radius: 999px; background: var(--dm-tooltip-color, #16a34a); box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.14); }
            .dm-location-popup__tooltip-title { margin: 0; font-size: clamp(14px, 1.8vw, 16px); font-weight: 700; color: #1c134f; }
            .dm-location-popup__tooltip-meta { display: grid; gap: clamp(8px, 1.2vw, 10px); font-size: clamp(12px, 1.4vw, 13px); color: #334155; }
            .dm-location-popup__tooltip-meta dl { display: grid; grid-template-columns: auto 1fr; gap: clamp(6px, 1vw, 8px) clamp(10px, 1.5vw, 12px); margin: 0; }
            .dm-location-popup__tooltip-meta dt { font-weight: 600; color: #1c134f; }
            .dm-location-popup__tooltip-meta dd { margin: 0; }
            .dm-location-popup__tooltip-cta { margin-top: clamp(2px, 0.5vw, 4px); border: none; border-radius: 999px; padding: clamp(8px, 1.2vw, 10px) clamp(14px, 2vw, 16px); background: #4d38ff; color: #ffffff; font-weight: 600; font-size: clamp(12px, 1.4vw, 13px); cursor: pointer; box-shadow: 0 12px 28px rgba(77, 56, 255, 0.2); transition: transform 0.18s ease, box-shadow 0.18s ease; align-self: flex-start; }
            .dm-location-popup__tooltip-cta:hover { transform: translateY(-1px); box-shadow: 0 16px 34px rgba(77, 56, 255, 0.28); }
            .dm-location-popup__tooltip-close { border: none; background: rgba(148, 163, 184, 0.16); color: #0f172a; width: clamp(28px, 4vw, 32px); height: clamp(28px, 4vw, 32px); border-radius: 999px; cursor: pointer; font-size: clamp(14px, 1.6vw, 16px); display: inline-flex; align-items: center; justify-content: center; }
            .dm-location-popup__legend { display: none !important; }
            .dm-location-popup__legend-item { display: none !important; }
            .dm-location-popup__legend-dot { display: none !important; }
            .dm-location-popup__footer { padding: clamp(18px, 2.4vw, 28px) clamp(24px, 3.2vw, 40px) clamp(24px, 3vw, 36px); display: flex; flex-direction: column; gap: clamp(18px, 2.6vw, 28px); background: #ffffff; flex: 1; overflow: hidden; min-height: 0; }
            .dm-location-popup__filters { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
            .dm-location-popup__search { flex: 1 1 220px; display: flex; align-items: center; gap: 10px; background: #f1f5f9; border-radius: 14px; padding: 10px 14px; border: 1px solid transparent; transition: border 0.2s ease, background 0.2s ease; }
            .dm-location-popup__search svg { width: 18px; height: 18px; color: #64748b; }
            .dm-location-popup__search input { flex: 1; border: none; background: transparent; font-size: 0.95rem; color: #1c134f; }
            .dm-location-popup__search input:focus { outline: none; }
            .dm-location-popup__search:focus-within { border-color: rgba(99, 102, 241, 0.5) !important; background: #eef2ff !important; }
            .dm-location-popup__select { appearance: none; border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 14px; padding: 10px 38px 10px 14px; font-size: 0.95rem; color: #1c134f; background: #f8fafc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='10' viewBox='0 0 16 10' fill='none' stroke='%23525857' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m2 2 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center / 14px 9px; cursor: pointer; transition: border 0.2s ease, background 0.2s ease; }
            .dm-location-popup__select:focus { outline: none !important; border-color: rgba(99, 102, 241, 0.5) !important; background-color: #eef2ff !important; }
            .dm-location-popup__counter { margin-left: auto; font-size: 0.9rem; color: #475569; font-weight: 500; }
            .dm-location-popup__table-wrapper { border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 18px; overflow: auto; background: #f8fafc; box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.08); flex: 1; }
            .dm-location-popup__table { width: 100%; border-collapse: collapse; font-size: 0.92rem; color: #1c134f; }
            .dm-location-popup__table thead { background: rgba(99, 102, 241, 0.08); color: #1c134f; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
            .dm-location-popup__table th, .dm-location-popup__table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid rgba(15, 23, 42, 0.06); }
            .dm-location-popup__table tbody tr:last-child td { border-bottom: none; }
            .dm-location-popup__row { cursor: pointer; transition: background 0.18s ease; }
            .dm-location-popup__row:hover { background: transparent; }
            .dm-location-popup__row.is-hovered { background: transparent; }
            .dm-location-popup__row.is-active { background: transparent; }
            .dm-location-popup__status { display: inline-flex; align-items: center; justify-content: center; min-width: 94px; padding: 6px 14px; border-radius: 999px; font-size: 0.85rem; font-weight: 600; border: none; cursor: pointer; color: #0f172a; background: rgba(99, 102, 241, 0.12); position: relative; overflow: hidden; transition: none; }
            .dm-location-popup__status::before { content: ''; position: absolute; inset: 0; background: var(--dm-status-color, rgba(99, 102, 241, 0.16)); opacity: 0.5; }
            .dm-location-popup__status span { position: relative; z-index: 1; }
            .dm-location-popup__status:hover { transform: none; box-shadow: none; }
            .dm-location-popup__empty { padding: 32px 24px; text-align: center; color: #475569; font-size: 0.95rem; }
            .dm-location-popup__empty strong { display: block; font-size: 1.05rem; margin-bottom: 6px; color: #1c134f; }
            .dm-location-popup__badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 600; color: #334155; padding: 6px 12px; border-radius: 999px; background: rgba(148, 163, 184, 0.16); }
            .dm-location-popup__badge-dot { width: 8px; height: 8px; border-radius: 999px; background: currentColor; }
            .dm-dashboard--modal { display: flex; flex-direction: column; height: 100%; min-height: 0; }
            .dm-dashboard__card--modal { display: flex; flex-direction: column; flex: 1; min-height: 0; }
            .dm-dashboard__toolbar--modal { flex: 0 0 auto; margin-bottom: clamp(16px, 2.4vw, 24px); }
            .dm-dashboard--modal .dm-dashboard__table-wrapper { flex: 1; max-height: 100%; overflow-y: auto; overscroll-behavior: contain; }
            .dm-location-popup__tooltip-cta:is(:focus, :focus-visible),
            .dm-location-popup__tooltip-close:is(:focus, :focus-visible),
            .dm-dashboard__select-trigger:is(:focus, :focus-visible),
            .filters-scope .dm-dashboard__select-option:is(:focus, :focus-visible),
            .dm-dashboard__search input:is(:focus, :focus-visible),
            .dm-location-popup__status:is(:focus, :focus-visible) { outline: none !important; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.28) !important; }
            @media (max-width: 1024px) {
                .dm-location-popup { padding: clamp(10px, 2vw, 16px); }
                .dm-location-popup__surface { border-radius: clamp(16px, 2.5vw, 20px); min-height: auto; height: min(88vh, 720px); max-height: min(88vh, 720px); }
                .dm-location-popup__header { padding: clamp(14px, 2.2vw, 18px) clamp(16px, 2.5vw, 24px); }
                .dm-location-popup__plan { padding: clamp(12px, 2vw, 18px); }
            }
            @media (max-width: 720px) {
                .dm-location-popup__surface { width: 95vw; min-height: auto; height: auto; max-height: 94vh; border-radius: clamp(14px, 2.2vw, 16px); }
                .dm-location-popup__content { display: flex; flex-direction: column; }
                .dm-location-popup__plan { padding: clamp(10px, 1.8vw, 14px); }
                .dm-location-popup__plan-body { border-radius: clamp(12px, 2vw, 14px); }
                .dm-location-popup__tooltip { min-width: 180px; max-width: 260px; }
            }
            @media (max-width: 480px) {
                .dm-location-popup__surface { width: 98vw; max-height: 96vh; }
                .dm-location-popup__header { flex-direction: column; gap: clamp(10px, 2vw, 12px); }
                .dm-location-popup__close { align-self: flex-end; }
            }
            @media (prefers-reduced-motion: reduce) {
                .dm-location-popup, .dm-location-popup * { transition-duration: 0s !important; animation-duration: 0s !important; }
            }
        `;
        style.textContent += `
            .dm-location-popup__footer--dashboard { padding: clamp(12px, 2vw, 20px); background: transparent; }
            .dm-location-popup__footer--dashboard .dm-dashboard { gap: clamp(14px, 2vw, 20px); }
            .dm-location-popup__footer--dashboard .dm-dashboard__card { margin: 0; }
            .dm-dashboard { display: flex; flex-direction: column; gap: clamp(14px, 2vw, 20px); }
            .dm-dashboard__card { background: var(--dm-surface, #ffffff); border-radius: clamp(16px, 2.5vw, 24px); border: 1px solid rgba(85, 60, 154, 0.08); padding: clamp(16px, 2.5vw, 28px) clamp(18px, 2.8vw, 32px); box-shadow: 0 18px 48px rgba(82, 51, 143, 0.06); }
            .dm-dashboard__toolbar-heading { display: none !important; }
            .filters-scope {
                --dm-filter-surface: #ffffff;
                --dm-filter-brand: #4d38ff;
                --dm-filter-brand-strong: #3a2cc8;
                --dm-filter-border: rgba(28, 19, 79, 0.28);
                --dm-filter-border-strong: rgba(28, 19, 79, 0.45);
                --dm-filter-shadow-focus: 0 0 0 4px rgba(77, 56, 255, 0.12);
                --dm-filter-control-height: clamp(48px, 5.4vw, 56px);
                --dm-filter-control-radius: clamp(16px, 2.4vw, 18px);
                --dm-dashboard-control-height: var(--dm-filter-control-height);
                display: grid;
                grid-template-columns: 2fr 1fr 1fr;
                align-items: stretch;
                column-gap: clamp(12px, 1.8vw, 18px);
                row-gap: clamp(12px, 1.8vw, 18px);
                width: 100%;
            }
            .filters-scope .dm-dashboard__search {
                position: relative;
                display: flex;
                align-items: center;
                width: 100%;
                height: var(--dm-filter-control-height);
                border-radius: var(--dm-filter-control-radius);
                border: 1.5px solid var(--dm-filter-border);
                background: var(--dm-filter-surface);
                padding: 0 clamp(24px, 3.4vw, 30px) 0 clamp(60px, 8vw, 72px);
                transition: border-color 0.2s ease;
                box-shadow: none;
                color: #1c134f;
            }

            .filters-scope .dm-dashboard__search:focus-within {
                border-color: var(--dm-filter-brand);
            }
            .filters-scope .dm-dashboard__search input {
                flex: 1;
                height: 100%;
                border: none;
                background: transparent;
                font-size: clamp(13px, 1.6vw, 14px);
                font-weight: 600;
                color: #1c134f;
                padding: 0;
                margin: 0;
                outline: none;
                box-shadow: none !important;
                caret-color: var(--dm-filter-brand);
                appearance: none;
            }
            .filters-scope .dm-dashboard__search input::placeholder { color: transparent; }
            .filters-scope .dm-dashboard__search input::-webkit-search-decoration,
            .filters-scope .dm-dashboard__search input::-webkit-search-cancel-button { display: none; }
            .filters-scope .dm-dashboard__search-icon {
                position: absolute;
                left: clamp(14px, 2vw, 18px);
                top: clamp(14px, 2vw, 18px);
                transform: none;
                width: clamp(16px, 2.2vw, 18px);
                height: clamp(16px, 2.2vw, 18px);
                color: rgba(28, 19, 79, 0.65);
                pointer-events: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 2;
            }
            .filters-scope .dm-dashboard__search-icon svg { width: 100%; height: 100%; }
            .filters-scope .dm-dashboard__search-label {
                position: absolute;
                left: clamp(38px, 5vw, 44px);
                top: 50%;
                transform: translateY(-50%);
                font-size: clamp(11px, 1.5vw, 12px);
                font-weight: 650;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: rgba(28, 19, 79, 0.58);
                pointer-events: none;
                transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), color 0.28s cubic-bezier(0.4, 0, 0.2, 1), top 0.28s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
                background: transparent;
                padding: 0 0.5em;
                border-radius: 999px;
                white-space: nowrap;
                z-index: 2;
            }
            .filters-scope .dm-dashboard__search:focus-within .dm-dashboard__search-icon,
            .filters-scope .dm-dashboard__search input:not(:placeholder-shown) ~ .dm-dashboard__search-icon {
                color: var(--dm-filter-brand);
            }
            .filters-scope .dm-dashboard__search:focus-within .dm-dashboard__search-label,
            .filters-scope .dm-dashboard__search input:not(:placeholder-shown) ~ .dm-dashboard__search-label {
                top: -2px;
                transform: translateY(-50%) scale(0.82);
                background: var(--dm-filter-surface);
                color: var(--dm-filter-brand);
            }
            .filters-scope .dm-dashboard__select {
                position: relative;
                width: 100%;
            }
            .filters-scope .dm-dashboard__select-label {
                position: absolute;
                left: clamp(24px, 3.2vw, 30px);
                top: -2px;
                transform: translateY(-50%) scale(0.82);
                font-size: clamp(11px, 1.5vw, 12px);
                font-weight: 650;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: rgba(28, 19, 79, 0.58);
                pointer-events: none;
                transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), color 0.28s cubic-bezier(0.4, 0, 0.2, 1), left 0.28s cubic-bezier(0.4, 0, 0.2, 1), top 0.28s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
                background: var(--dm-filter-surface);
                padding: 0 0.4em;
                border-radius: 999px;
                box-shadow: none;
                z-index: 1;
            }
            .filters-scope .dm-dashboard__select-trigger {
                width: 100%;
                border: 1.5px solid var(--dm-filter-border);
                border-radius: var(--dm-filter-control-radius);
                background: var(--dm-filter-surface);
                padding: 0 clamp(56px, 7.4vw, 66px) 0 clamp(30px, 4vw, 38px);
                height: var(--dm-filter-control-height);
                display: flex;
                align-items: center;
                gap: clamp(10px, 1.5vw, 16px);
                justify-content: space-between;
                cursor: pointer;
                box-shadow: none;
                transition: border-color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
                outline: none;
            }

            .filters-scope .dm-dashboard__select-trigger:focus-visible {
                border-color: var(--dm-filter-brand);
            }
            .filters-scope .dm-dashboard__select-value {
                flex: 1;
                font-size: clamp(13px, 1.6vw, 14px);
                font-weight: 600;
                color: #1c134f;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .filters-scope .dm-dashboard__select-icon {
                position: absolute;
                right: clamp(18px, 2.6vw, 22px);
                top: 50%;
                transform: translateY(-50%);
                width: clamp(18px, 2.4vw, 20px);
                height: clamp(18px, 2.4vw, 20px);
                border-radius: 999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: rgba(28, 19, 79, 0.08);
                color: rgba(28, 19, 79, 0.65);
                flex-shrink: 0;
                transition: background 0.28s cubic-bezier(0.4, 0, 0.2, 1), color 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .filters-scope .dm-dashboard__select-icon::before {
                content: '';
                width: clamp(12px, 1.6vw, 14px);
                height: clamp(7px, 1vw, 9px);
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='10' viewBox='0 0 16 10' fill='none' stroke='%231c134f' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' stroke-opacity='0.65'%3E%3Cpath d='m2 2 6 6 6-6'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-size: 100% 100%;
                display: inline-block;
                transition: transform 0.2s ease;
            }
            .filters-scope .dm-dashboard__select.is-open .dm-dashboard__select-icon {
                transform: translateY(-50%) rotate(180deg);
            }
            .filters-scope .dm-dashboard__select.is-open .dm-dashboard__select-trigger {
                border-color: var(--dm-filter-brand);
                box-shadow: none;
            }
            .filters-scope .dm-dashboard__select.is-open .dm-dashboard__select-icon {
                background: rgba(77, 56, 255, 0.14);
                color: var(--dm-filter-brand);
            }
            .filters-scope .dm-dashboard__select.is-open .dm-dashboard__select-icon::before {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='10' viewBox='0 0 16 10' fill='none' stroke='%234d38ff' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m2 2 6 6 6-6'/%3E%3C/svg%3E");
            }
            .filters-scope .dm-dashboard__select.is-open .dm-dashboard__select-label {
                color: var(--dm-filter-brand);
                box-shadow: none;
            }
            .filters-scope .dm-dashboard__select-dropdown {
                position: absolute;
                top: calc(100% + clamp(6px, 1vw, 10px));
                left: 0;
                width: 100%;
                background: var(--dm-filter-surface);
                border: 1.5px solid rgba(28, 19, 79, 0.22);
                border-radius: clamp(16px, 2.4vw, 20px);
                box-shadow: 0 26px 48px rgba(15, 23, 42, 0.22);
                padding: 0;
                z-index: 70;
                max-height: min(40vh, 320px);
                overflow: hidden;
            }
            .filters-scope .dm-dashboard__select-dropdown[hidden] { display: none; }
            .filters-scope .dm-dashboard__select-dropdown-inner {
                display: flex;
                flex-direction: column;
                gap: clamp(4px, 0.8vw, 6px);
                padding: clamp(6px, 1vw, 8px);
                max-height: min(40vh, 320px);
                overflow-y: auto;
                overscroll-behavior: contain;
                border-radius: inherit;
                scrollbar-color: rgba(77, 56, 255, 0.32) rgba(77, 56, 255, 0.08);
            }
            .filters-scope .dm-dashboard__select-dropdown-inner::-webkit-scrollbar { width: 8px; }
            .filters-scope .dm-dashboard__select-dropdown-inner::-webkit-scrollbar-track {
                background: rgba(77, 56, 255, 0.08);
                border-radius: 999px;
            }
            .filters-scope .dm-dashboard__select-dropdown-inner::-webkit-scrollbar-thumb {
                background: rgba(77, 56, 255, 0.32);
                border-radius: 999px;
            }
            .filters-scope .dm-dashboard__select-option {
                width: 100%;
                border: none;
                border-radius: clamp(12px, 1.8vw, 14px);
                background: transparent;
                padding: clamp(12px, 1.8vw, 14px) clamp(16px, 2.4vw, 20px);
                text-align: left;
                font-size: clamp(13px, 1.6vw, 14px);
                font-weight: 600;
                color: #1c134f;
                cursor: pointer;
                transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
            }
            .filters-scope .dm-dashboard__select-option.is-disabled {
                opacity: 0.45;
                cursor: not-allowed;
            }
            .filters-scope .dm-dashboard__select-option:hover {
                background: rgba(77, 56, 255, 0.2);
                color: #2b217c;
                transform: translateY(-1px);
            }
            .filters-scope .dm-dashboard__select-option.is-disabled:hover {
                background: transparent;
                color: #1c134f;
                transform: none;
            }
            .filters-scope .dm-dashboard__select-option.is-selected {
                background: rgba(77, 56, 255, 0.28);
                color: #211873;
                box-shadow: inset 0 0 0 1px rgba(77, 56, 255, 0.16);
            }
            .filters-scope .dm-dashboard__select-option:focus {
                outline: none;
            }
            .filters-scope .dm-dashboard__select-option:focus-visible {
                box-shadow: 0 0 0 3px rgba(77, 56, 255, 0.22);
            }
            .filters-scope .dm-dashboard__select-native { position: absolute; opacity: 0; pointer-events: none; }
            .dm-dashboard__legend { display: flex; align-items: center; gap: clamp(8px, 1.2vw, 10px); padding: clamp(10px, 1.5vw, 14px) clamp(12px, 1.8vw, 16px); border-radius: clamp(12px, 1.8vw, 14px); border: 1px solid rgba(85, 60, 154, 0.12); background: #ffffff; min-height: var(--dm-dashboard-control-height); grid-column: 1 / -1; flex-wrap: wrap; }
            .dm-dashboard__legend-heading { font-size: clamp(11px, 1.4vw, 12px); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(28, 19, 79, 0.7); white-space: nowrap; margin-right: clamp(6px, 1vw, 8px); }
            .dm-dashboard__legend-list { display: flex; align-items: center; gap: clamp(6px, 1vw, 8px); flex-wrap: wrap; flex: 1; }
            .dm-dashboard__legend-badge { display: inline-flex; align-items: center; justify-content: center; padding: clamp(4px, 0.8vw, 6px) clamp(10px, 1.5vw, 12px); border-radius: 999px; font-size: clamp(12px, 1.4vw, 13px); font-weight: 600; color: rgba(45, 45, 78, 0.85); background: rgba(124, 58, 237, 0.08); transition: opacity 0.18s ease; white-space: nowrap; }
            .dm-dashboard__legend-badge.is-inactive { opacity: 0.45; }
            .dm-dashboard__legend-counter { margin-left: auto; font-size: clamp(12px, 1.4vw, 13px); font-weight: 500; color: rgba(45, 45, 78, 0.65); white-space: nowrap; }
            .dm-dashboard__table-wrapper { background: #ffffff; border-radius: clamp(16px, 2.5vw, 20px); border: 1px solid #d2d2dc; padding: clamp(14px, 2.2vw, 20px); box-shadow: 0 8px 20px rgba(22, 22, 29, 0.05); overflow: visible; }
            .dm-dashboard__table { display: flex; flex-direction: column; gap: clamp(10px, 1.5vw, 14px); overflow: visible; width: 100%; }
            .dm-dashboard__table thead { display: block; }
            .dm-dashboard__table thead tr { display: grid; grid-template-columns: minmax(70px, 0.8fr) minmax(100px, 1.2fr) minmax(80px, 0.9fr) minmax(70px, 0.8fr) minmax(70px, 0.8fr) minmax(80px, 0.9fr) minmax(90px, 1.1fr); gap: clamp(8px, 1.2vw, 12px); align-items: center; background: #e8e9f0; border-radius: clamp(14px, 2vw, 18px); padding: clamp(12px, 1.8vw, 16px) clamp(14px, 2vw, 18px); border: none !important; border-top: none !important; border-bottom: none !important; box-shadow: none !important; }
            .dm-dashboard__table th { text-align: left; font-size: clamp(11px, 1.3vw, 12px); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(45, 45, 78, 0.7); padding: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border: none !important; border-top: none !important; border-bottom: none !important; box-shadow: none; }
            .dm-dashboard__table tbody { display: flex; flex-direction: column; gap: 0; }
            .dm-dashboard__table tbody tr { display: grid; grid-template-columns: minmax(70px, 0.8fr) minmax(100px, 1.2fr) minmax(80px, 0.9fr) minmax(70px, 0.8fr) minmax(70px, 0.8fr) minmax(80px, 0.9fr) minmax(90px, 1.1fr); gap: clamp(8px, 1.2vw, 12px); align-items: center; padding: clamp(12px, 1.8vw, 16px) clamp(14px, 2vw, 18px); border-bottom: none; background: #ffffff !important; position: relative; border-left: none; border-right: none; border-top: none; box-shadow: none; }
            .dm-dashboard__table tbody tr:last-child { border-bottom: none; }
            .dm-dashboard__table tbody tr.is-hovered { background: transparent !important; border-radius: clamp(14px, 2vw, 18px); border-bottom-color: transparent; box-shadow: none; }
            .dm-dashboard__table tbody tr.is-active { background: transparent !important; border-radius: clamp(16px, 2.2vw, 20px); border-bottom-color: transparent; box-shadow: none; }
            .dm-dashboard__table td { padding: 0; font-size: clamp(13px, 1.5vw, 14px); color: var(--dm-text, #1C134F); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border: none !important; border-top: none !important; border-bottom: none !important; background: #ffffff !important; }
            .dm-dashboard__cell--actions { display: none !important; }
            .dm-dashboard__cell--status { cursor: pointer; }
            .dm-dashboard__empty-row td { padding: clamp(32px, 5vw, 42px) clamp(18px, 2.8vw, 24px); grid-column: 1 / -1; }
            .dm-dashboard__empty-state { text-align: center; display: flex; flex-direction: column; gap: clamp(14px, 2vw, 16px); align-items: center; justify-content: center; color: rgba(45, 45, 78, 0.75); font-size: clamp(13px, 1.6vw, 14px); max-width: 380px; margin: 0 auto; padding: clamp(32px, 5vw, 42px) clamp(28px, 4vw, 36px); border-radius: clamp(16px, 2.5vw, 20px); border: 1px dashed rgba(124, 58, 237, 0.28); background: linear-gradient(155deg, rgba(124, 58, 237, 0.1), rgba(124, 58, 237, 0.04)); box-shadow: 0 16px 32px rgba(36, 24, 76, 0.1); }
            .dm-dashboard__empty-state h3 { font-size: clamp(16px, 2.2vw, 18px); font-weight: 700; color: #1C134F; margin: 0; }
            .dm-dashboard__empty-state p { margin: 0; line-height: 1.5; color: rgba(45, 45, 78, 0.75); }
            .dm-dashboard__empty-icon { width: clamp(42px, 5.5vw, 48px); height: clamp(42px, 5.5vw, 48px); display: grid; place-items: center; border-radius: clamp(12px, 2vw, 16px); background: rgba(124, 58, 237, 0.16); color: #5b21b6; box-shadow: 0 12px 22px rgba(124, 58, 237, 0.18); }
            .dm-dashboard__empty-icon svg { width: clamp(18px, 2.5vw, 22px); height: clamp(18px, 2.5vw, 22px); }
            .dm-status { display: inline-flex; align-items: center; justify-content: center; font-size: clamp(12px, 1.4vw, 13px); font-weight: 600; padding: clamp(5px, 1vw, 6px) clamp(12px, 1.8vw, 14px); border-radius: 999px; background: rgba(124, 58, 237, 0.08); color: rgba(45, 45, 78, 0.85); white-space: normal; word-wrap: break-word; max-width: 100%; text-align: center; line-height: 1.3; }
            .dm-status--volne { background: #dcfce7; color: #15803d; }
            .dm-status--obsadene, .dm-status--predane { background: #fee2e2; color: #b91c1c; }
            .dm-status--rezervovane { background: #fef3c7; color: #b45309; }
            .dm-status--unknown { background: rgba(124, 58, 237, 0.12); color: rgba(45, 45, 78, 0.65); }
            @media (max-width: 960px) {
                .dm-location-popup__footer--dashboard { padding: clamp(14px, 2.5vw, 18px); }
                .filters-scope { grid-template-columns: 1fr 1fr; }
                .filters-scope .dm-dashboard__search { grid-column: 1 / -1; }
                .dm-dashboard__legend { gap: clamp(6px, 1vw, 8px); padding: clamp(10px, 1.5vw, 12px); grid-column: 1 / -1; }
                .dm-dashboard__legend-heading { font-size: clamp(10px, 1.3vw, 11px); }
                .dm-dashboard__legend-counter { margin-left: 0; margin-top: 4px; flex: 0 0 100%; }
                .dm-dashboard__table thead { display: none; }
                .dm-dashboard__table { gap: clamp(12px, 2vw, 16px); }
                .dm-dashboard__table tbody tr { display: flex; flex-direction: column; gap: clamp(10px, 1.5vw, 12px); padding: clamp(14px, 2.2vw, 18px) clamp(16px, 2.5vw, 20px); border: 1px solid #d5d6e0; border-radius: clamp(14px, 2vw, 16px); background: #ffffff !important; border-left: 1px solid #d5d6e0; border-right: 1px solid #d5d6e0; border-top: 1px solid #d5d6e0; }
                .dm-dashboard__table tbody tr:last-child { border-bottom: 1px solid #d5d6e0; }
                .dm-dashboard__table td { display: flex; justify-content: space-between; align-items: center; width: 100%; white-space: normal; border: none; }
                .dm-dashboard__table td::before { content: attr(data-label); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: clamp(11px, 1.3vw, 12px); color: rgba(45, 45, 78, 0.6); margin-right: clamp(12px, 2vw, 14px); flex: 1; }
                .dm-dashboard__cell--actions { justify-content: flex-start; flex-wrap: wrap; gap: clamp(8px, 1.2vw, 10px); }
                .dm-dashboard__cell--actions::before { margin-bottom: clamp(4px, 0.8vw, 6px); flex: 0 0 100%; }
            }
            @media (max-width: 640px) {
                .filters-scope { grid-template-columns: 1fr; }
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
                    <section class="dm-location-popup__footer dm-location-popup__footer--dashboard">
                        <div class="dm-dashboard dm-dashboard--modal">
                            <div class="dm-dashboard__card dm-dashboard__card--modal">
                                <div class="dm-dashboard__toolbar dm-dashboard__toolbar--modal filters-scope" role="search">
                                    <label class="dm-dashboard__search" data-role="search-wrapper">
                                        <span class="dm-dashboard__search-icon" aria-hidden="true">${DASHBOARD_TOOLBAR_ICONS.search}</span>
                                        <input type="search" placeholder=" " data-role="search" aria-label="Vyhľadať lokalitu" />
                                        <span class="dm-dashboard__search-label">Vyhľadať lokalitu</span>
                                    </label>
                                    <div class="dm-dashboard__select" data-role="status-filter-wrapper">
                                        <label class="dm-dashboard__select-label" id="dm-location-popup-status-label" for="dm-location-popup-status-native">Stav</label>
                                        <button type="button" class="dm-dashboard__select-trigger" data-role="status-trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="dm-location-popup-status-label dm-location-popup-status-value">
                                            <span class="dm-dashboard__select-value" data-role="status-value" id="dm-location-popup-status-value">Všetky stavy</span>
                                            <span class="dm-dashboard__select-icon" aria-hidden="true"></span>
                                        </button>
                                        <div class="dm-dashboard__select-dropdown" data-role="status-dropdown" role="listbox" aria-labelledby="dm-location-popup-status-label" hidden>
                                            <div class="dm-dashboard__select-dropdown-inner" data-role="status-dropdown-inner"></div>
                                        </div>
                                        <select id="dm-location-popup-status-native" class="dm-dashboard__select-native" data-role="status-filter" aria-labelledby="dm-location-popup-status-label" hidden>
                                            <option value="">Všetky stavy</option>
                                        </select>
                                    </div>
                                    <div class="dm-dashboard__select" data-role="price-filter-wrapper">
                                        <label class="dm-dashboard__select-label" id="dm-location-popup-price-label" for="dm-location-popup-price-native">Cena</label>
                                        <button type="button" class="dm-dashboard__select-trigger" data-role="price-trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="dm-location-popup-price-label dm-location-popup-price-value">
                                            <span class="dm-dashboard__select-value" data-role="price-value" id="dm-location-popup-price-value">Všetky ceny</span>
                                            <span class="dm-dashboard__select-icon" aria-hidden="true"></span>
                                        </button>
                                        <div class="dm-dashboard__select-dropdown" data-role="price-dropdown" role="listbox" aria-labelledby="dm-location-popup-price-label" hidden>
                                            <div class="dm-dashboard__select-dropdown-inner" data-role="price-dropdown-inner"></div>
                                        </div>
                                        <select id="dm-location-popup-price-native" class="dm-dashboard__select-native" data-role="price-filter" aria-labelledby="dm-location-popup-price-label" hidden>
                                            <option value="">Všetky ceny</option>
                                            <option value="asc">Najnižšia</option>
                                            <option value="desc">Najvyššia</option>
                                        </select>
                                    </div>
                                    <div class="dm-dashboard__legend" data-role="toolbar-legend">
                                        <span class="dm-dashboard__legend-heading">Legenda stavov</span>
                                        <div class="dm-dashboard__legend-list" data-role="toolbar-legend-list"></div>
                                        <span class="dm-dashboard__legend-counter" data-role="counter"></span>
                                    </div>
                                </div>
                                <div class="dm-dashboard__table-wrapper">
                                    <table class="dm-dashboard__table" role="table">
                                        <thead>
                                            <tr role="row">
                                                <th scope="col">Typ</th>
                                                <th scope="col">Názov</th>
                                                <th scope="col">Označenie</th>
                                                <th scope="col">Rozloha</th>
                                                <th scope="col">Cena</th>
                                                <th scope="col">Prenájom</th>
                                                <th scope="col">Stav</th>
                                            </tr>
                                        </thead>
                                        <tbody data-role="table-body"></tbody>
                                    </table>
                                </div>
                            </div>
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
        const statusFilterWrapper = root.querySelector('[data-role="status-filter-wrapper"]');
        const priceFilterWrapper = root.querySelector('[data-role="price-filter-wrapper"]');
        const statusTrigger = root.querySelector('[data-role="status-trigger"]');
        const priceTrigger = root.querySelector('[data-role="price-trigger"]');
        const statusValueDisplay = root.querySelector('[data-role="status-value"]');
        const priceValueDisplay = root.querySelector('[data-role="price-value"]');
    const statusDropdown = root.querySelector('[data-role="status-dropdown"]');
    const priceDropdown = root.querySelector('[data-role="price-dropdown"]');
    const statusDropdownList = root.querySelector('[data-role="status-dropdown-inner"]');
    const priceDropdownList = root.querySelector('[data-role="price-dropdown-inner"]');
        const toolbarLegend = root.querySelector('[data-role="toolbar-legend"]');
        const toolbarLegendList = root.querySelector('[data-role="toolbar-legend-list"]');
        const counterEl = root.querySelector('[data-role="counter"]');
        const tableBody = root.querySelector('[data-role="table-body"]');

        const customSelectRegistry = new Map();
        let openCustomSelectRef = null;

        function handleGlobalPointer(event) {
            if (!openCustomSelectRef) {
                return;
            }
            const selectConfig = customSelectRegistry.get(openCustomSelectRef);
            if (!selectConfig) {
                openCustomSelectRef = null;
                return;
            }
            if (!selectConfig.wrapper.contains(event.target)) {
                closeCustomSelectMenu(openCustomSelectRef);
            }
        }

        function handleGlobalKey(event) {
            if (!openCustomSelectRef) {
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                const selectConfig = customSelectRegistry.get(openCustomSelectRef);
                closeCustomSelectMenu(openCustomSelectRef);
                selectConfig?.trigger?.focus();
            }
        }

        function focusOptionForSelect(select, targetValue) {
            const selectConfig = customSelectRegistry.get(select);
            if (!selectConfig) {
                return;
            }
            const scope = selectConfig.list ?? selectConfig.dropdown;
            const optionButtons = Array.from(scope.querySelectorAll('.dm-dashboard__select-option'));
            if (!optionButtons.length) {
                return;
            }
            const target =
                (targetValue && optionButtons.find((button) => button.dataset.value === targetValue)) ||
                optionButtons.find((button) => button.classList.contains('is-selected')) ||
                optionButtons[0];
            if (target) {
                target.focus({ preventScroll: false });
            }
        }

        function handleOptionNavigation(select, event) {
            const selectConfig = customSelectRegistry.get(select);
            if (!selectConfig) {
                return;
            }
            const scope = selectConfig.list ?? selectConfig.dropdown;
            const optionButtons = Array.from(scope.querySelectorAll('.dm-dashboard__select-option'));
            if (!optionButtons.length) {
                return;
            }
            let currentIndex = optionButtons.indexOf(document.activeElement);
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                currentIndex = currentIndex >= 0 && currentIndex < optionButtons.length - 1 ? currentIndex + 1 : 0;
                optionButtons[currentIndex].focus();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                currentIndex = currentIndex > 0 ? currentIndex - 1 : optionButtons.length - 1;
                optionButtons[currentIndex].focus();
            } else if (event.key === 'Home') {
                event.preventDefault();
                optionButtons[0].focus();
            } else if (event.key === 'End') {
                event.preventDefault();
                optionButtons[optionButtons.length - 1].focus();
            } else if (event.key === ' ' || event.key === 'Enter') {
                if (document.activeElement && optionButtons.includes(document.activeElement)) {
                    event.preventDefault();
                    document.activeElement.click();
                }
            } else if (event.key === 'Tab') {
                closeCustomSelectMenu(select);
            }
        }

        function updateCustomSelectDisplay(select) {
            const selectConfig = customSelectRegistry.get(select);
            if (!selectConfig) {
                return;
            }
            const selectedOption = select.options[select.selectedIndex] || select.options[0];
            if (selectedOption) {
                selectConfig.valueEl.textContent = selectedOption.textContent;
            }
            const scope = selectConfig.list ?? selectConfig.dropdown;
            Array.from(scope.querySelectorAll('.dm-dashboard__select-option')).forEach(
                (button) => {
                    const isSelected = button.dataset.value === select.value;
                    button.classList.toggle('is-selected', isSelected);
                    button.setAttribute('aria-selected', isSelected ? 'true' : 'false');
                },
            );
            syncSelectStates();
        }

        function rebuildCustomSelectOptions(select) {
            const selectConfig = customSelectRegistry.get(select);
            if (!selectConfig) {
                return;
            }
            const host = selectConfig.list ?? selectConfig.dropdown;
            host.innerHTML = '';
            Array.from(select.options).forEach((option) => {
                const optionButton = document.createElement('button');
                optionButton.type = 'button';
                optionButton.className = 'dm-dashboard__select-option';
                optionButton.dataset.value = option.value;
                optionButton.textContent = option.textContent;
                optionButton.tabIndex = -1;
                optionButton.disabled = option.disabled;
                optionButton.setAttribute('role', 'option');
                optionButton.setAttribute('aria-selected', option.selected ? 'true' : 'false');
                optionButton.setAttribute('aria-disabled', option.disabled ? 'true' : 'false');
                if (option.disabled) {
                    optionButton.classList.add('is-disabled');
                }
                if (option.selected) {
                    optionButton.classList.add('is-selected');
                }
                optionButton.addEventListener('click', () => {
                    if (option.disabled) {
                        return;
                    }
                    select.value = option.value;
                    updateCustomSelectDisplay(select);
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    closeCustomSelectMenu(select);
                    selectConfig.trigger.focus();
                });
                host.appendChild(optionButton);
            });
            host.scrollTop = 0;
            updateCustomSelectDisplay(select);
        }

        function openCustomSelectMenu(select, options = {}) {
            const selectConfig = customSelectRegistry.get(select);
            if (!selectConfig) {
                return;
            }
            if (openCustomSelectRef && openCustomSelectRef !== select) {
                closeCustomSelectMenu(openCustomSelectRef);
            }
            rebuildCustomSelectOptions(select);
            selectConfig.dropdown.hidden = false;
            selectConfig.wrapper.classList.add('is-open');
            selectConfig.trigger.setAttribute('aria-expanded', 'true');
            openCustomSelectRef = select;
            document.addEventListener('pointerdown', handleGlobalPointer, true);
            document.addEventListener('keydown', handleGlobalKey);
            if (options.focusSelected) {
                requestAnimationFrame(() => {
                    focusOptionForSelect(select);
                });
            }
        }

        function closeCustomSelectMenu(select) {
            const selectConfig = customSelectRegistry.get(select);
            if (!selectConfig) {
                return;
            }
            selectConfig.dropdown.hidden = true;
            selectConfig.wrapper.classList.remove('is-open');
            selectConfig.trigger.setAttribute('aria-expanded', 'false');
            if (openCustomSelectRef === select) {
                openCustomSelectRef = null;
                document.removeEventListener('pointerdown', handleGlobalPointer, true);
                document.removeEventListener('keydown', handleGlobalKey);
            }
        }

        function toggleCustomSelectMenu(select) {
            if (openCustomSelectRef === select) {
                closeCustomSelectMenu(select);
            } else {
                openCustomSelectMenu(select, { focusSelected: true });
            }
        }

        function registerCustomSelect(select, config) {
            if (!select || !config?.wrapper || !config?.trigger || !config?.dropdown || !config?.valueEl) {
                return;
            }
            customSelectRegistry.set(select, config);
            config.trigger.setAttribute('aria-expanded', 'false');
            config.trigger.addEventListener('click', (event) => {
                event.preventDefault();
                toggleCustomSelectMenu(select);
            });
            config.trigger.addEventListener('keydown', (event) => {
                const { key } = event;
                if (key === ' ' || key === 'Enter' || key === 'ArrowDown' || key === 'ArrowUp') {
                    event.preventDefault();
                    openCustomSelectMenu(select, { focusSelected: true });
                }
            });
            const keydownTarget = config.list ?? config.dropdown;
            keydownTarget.addEventListener('keydown', (event) => {
                handleOptionNavigation(select, event);
            });
            config.wrapper.addEventListener('focusout', (event) => {
                if (config.wrapper.contains(event.relatedTarget)) {
                    return;
                }
                closeCustomSelectMenu(select);
            });
            select.addEventListener('change', () => {
                updateCustomSelectDisplay(select);
            });
            rebuildCustomSelectOptions(select);
        }

        if (
            statusFilter &&
            statusFilterWrapper &&
            statusTrigger &&
            statusDropdown &&
            statusDropdownList &&
            statusValueDisplay
        ) {
            registerCustomSelect(statusFilter, {
                wrapper: statusFilterWrapper,
                trigger: statusTrigger,
                dropdown: statusDropdown,
                list: statusDropdownList,
                valueEl: statusValueDisplay,
            });
        }

        if (
            priceFilter &&
            priceFilterWrapper &&
            priceTrigger &&
            priceDropdown &&
            priceDropdownList &&
            priceValueDisplay
        ) {
            registerCustomSelect(priceFilter, {
                wrapper: priceFilterWrapper,
                trigger: priceTrigger,
                dropdown: priceDropdown,
                list: priceDropdownList,
                valueEl: priceValueDisplay,
            });
        }

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
            toolbarLegendItems: new Map(),
            searchTerm: '',
            statusFilter: '',
            priceOrder: '',
            activeAreaId: null,
            hoverAreaId: null,
            previousBodyOverflow: '',
        };

        document.body.appendChild(root);

        function slugifyStatus(label) {
            if (!label) {
                return 'unknown';
            }
            return String(label)
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-)|(-$)/g, '') || 'unknown';
        }

        function normaliseCurrencyDisplay(value) {
            const raw = String(value ?? '').trim();
            if (!raw) {
                return '';
            }
            let result = raw.replace(/\beur\b/gi, '€');
            result = result.replace(/\s+/g, ' ').trim();
            if (result.includes('€')) {
                result = result.replace(/\s*€\s*/g, ' € ').replace(/\s+/g, ' ').trim();
                if (result.startsWith('€')) {
                    const remainder = result.slice(1).trim();
                    result = remainder ? `${remainder} €` : '€';
                } else if (!result.endsWith('€')) {
                    const parts = result.split('€');
                    if (parts.length === 2) {
                        const prefix = parts[0].trim();
                        const suffix = parts[1].trim();
                        result = suffix ? `${prefix} € ${suffix}` : `${prefix} €`;
                    }
                }
                return result.replace(/\s+/g, ' ').trim();
            }
            return `${result} €`;
        }

        function formatPriceDisplay(value) {
            const raw = String(value ?? '').trim();
            if (!raw) {
                return '—';
            }
            if (!/[0-9]/.test(raw)) {
                return raw;
            }
            const display = normaliseCurrencyDisplay(value);
            if (!display || display === '€') {
                return '—';
            }
            return display;
        }

        function formatRentDisplay(value) {
            const raw = String(value ?? '').trim();
            if (!raw) {
                return RENT_PLACEHOLDER;
            }
            const display = normaliseCurrencyDisplay(value);
            if (!display) {
                return RENT_PLACEHOLDER;
            }
            if (!/[0-9]/.test(raw)) {
                return RENT_PLACEHOLDER;
            }
            const normalised = display.toLowerCase().replace(/\s+/g, '');
            const hasPerMonth = normalised.includes('€/mes') || normalised.includes('€/mesiac');
            if (hasPerMonth) {
                const cleaned = display
                    .replace(/€\s*\/\s*mesiac/gi, '€ /mes')
                    .replace(/€\s*\/\s*mes/gi, '€ /mes')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .replace('€ /mes', '€/mes');
                return cleaned && cleaned !== '€/mes' ? cleaned : RENT_PLACEHOLDER;
            }
            const base = display.replace(/\s*€$/, '').trim();
            if (!base) {
                return RENT_PLACEHOLDER;
            }
            return `${base} €/mes`;
        }

        function formatAreaDisplay(value) {
            const raw = String(value ?? '').trim();
            if (!raw) {
                return '—';
            }
            const normalised = raw.toLowerCase().replace(/\s+/g, '');
            if (normalised.endsWith('m²') || normalised.endsWith('m2')) {
                return raw.replace(/m2$/i, 'm²');
            }
            return `${raw} m²`;
        }

        function applyStatusBadgeStyles(element, slug, color) {
            if (!element) {
                return;
            }
            const preset = PREDEFINED_STATUS_STYLES[slug];
            if (preset) {
                element.style.background = preset.background;
                element.style.color = preset.color;
                return;
            }
            const base = color || STATUS_FALLBACK_COLOR;
            element.style.background = toRgba(base, 0.16);
            element.style.color = base;
        }

        function syncSelectStates() {
            if (statusFilterWrapper) {
                const hasStatusValue = Boolean(statusFilter?.value);
                statusFilterWrapper.classList.toggle('dm-dashboard__select--has-value', hasStatusValue);
            }
            if (priceFilterWrapper) {
                const hasPriceValue = Boolean(priceFilter?.value);
                priceFilterWrapper.classList.toggle('dm-dashboard__select--has-value', hasPriceValue);
            }
        }

        function createActionButton(type, label, handler) {
            const iconMarkup = DASHBOARD_ACTION_ICONS[type] ?? '';
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `dm-icon-button dm-icon-button--${type}`;
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
            button.innerHTML = `<span class="dm-icon-button__icon" aria-hidden="true">${iconMarkup}</span>`;
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                handler(event);
            });
            return button;
        }

        syncSelectStates();

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
            if (openCustomSelectRef) {
                closeCustomSelectMenu(openCustomSelectRef);
            }
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
            if (!legendList) {
                return;
            }
            const legendMap = new Map();
            rows.forEach((row) => {
                const statusKey = row.statusKey || normaliseStatusId(row.statusId) || slugifyStatus(row.statusLabel || 'unknown');
                const label = row.statusLabel || state.statuses.get(normaliseStatusId(row.statusId))?.label || 'Bez stavu';
                const color = row.statusColor || state.statuses.get(normaliseStatusId(row.statusId))?.color || STATUS_FALLBACK_COLOR;
                if (!legendMap.has(statusKey)) {
                    legendMap.set(statusKey, { label, color, count: 0 });
                }
                legendMap.get(statusKey).count += 1;
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

        function buildToolbarLegend() {
            if (!toolbarLegendList) {
                return;
            }
            toolbarLegendList.innerHTML = '';
            state.toolbarLegendItems.clear();
            const resolved = new Map();

            state.statuses.forEach((status) => {
                if (!status) {
                    return;
                }
                const key = normaliseStatusId(status.id) || slugifyStatus(status.label);
                if (!key || resolved.has(key)) {
                    return;
                }
                resolved.set(key, {
                    key,
                    label: status.label || 'Bez stavu',
                    color: status.color || STATUS_FALLBACK_COLOR,
                });
            });

            state.rows.forEach((row) => {
                const key = row.statusKey || normaliseStatusId(row.statusId) || slugifyStatus(row.statusLabel || 'unknown');
                if (!resolved.has(key)) {
                    resolved.set(key, {
                        key,
                        label: row.statusLabel || 'Bez stavu',
                        color: row.statusColor || STATUS_FALLBACK_COLOR,
                    });
                }
            });

            resolved.forEach((entry) => {
                const badgeSlug = slugifyStatus(entry.label);
                const badge = document.createElement('span');
                badge.className = `dm-status dm-status--${badgeSlug} dm-dashboard__legend-badge`;
                badge.dataset.statusKey = entry.key;
                badge.dataset.baseLabel = entry.label;
                badge.textContent = entry.label;
                applyStatusBadgeStyles(badge, badgeSlug, entry.color);
                toolbarLegendList.appendChild(badge);
                state.toolbarLegendItems.set(entry.key, {
                    element: badge,
                    label: entry.label,
                    color: entry.color,
                });
            });

            updateToolbarLegend(state.filteredRows.length ? state.filteredRows : state.rows);
        }

        function updateToolbarLegend(rows) {
            if (!toolbarLegendList) {
                return;
            }
            const counts = new Map();
            rows.forEach((row) => {
                const key = row.statusKey || normaliseStatusId(row.statusId) || slugifyStatus(row.statusLabel || 'unknown');
                counts.set(key, (counts.get(key) || 0) + 1);
            });

            state.toolbarLegendItems.forEach((entry, key) => {
                const count = counts.get(key) || 0;
                entry.element.textContent = count ? `${entry.label} (${count})` : entry.label;
                entry.element.classList.toggle('is-inactive', count === 0);
                entry.element.setAttribute('aria-disabled', count === 0 ? 'true' : 'false');
                entry.element.setAttribute('title', count ? `${entry.label}: ${formatCountSk(count)}` : `${entry.label}: 0`);
            });

            if (toolbarLegend) {
                toolbarLegend.hidden = state.toolbarLegendItems.size === 0;
            }
        }

        function renderRows(rows) {
            tableBody.innerHTML = '';
            if (!rows.length) {
                tableBody.innerHTML = `
                    <tr role="row" class="dm-dashboard__empty-row">
                        <td role="cell" colspan="7" class="dm-dashboard__empty-cell">
                            <div class="dm-dashboard__empty-state" role="group" aria-label="Žiadne lokality">
                                <span class="dm-dashboard__empty-icon" aria-hidden="true">${DASHBOARD_TOOLBAR_ICONS.search}</span>
                                <h3>Žiadne lokality</h3>
                                <p>Pre túto lokalitu zatiaľ nie sú dostupné žiadne údaje.</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }
            const fragment = document.createDocumentFragment();
            rows.forEach((row) => {
                const tr = document.createElement('tr');
                tr.setAttribute('role', 'row');
                tr.dataset.areaId = row.areaId;
                tr.dataset.floorId = row.floorId;

                const columns = [
                    { label: 'Typ', value: row.type || '—' },
                    { label: 'Názov', value: row.name || '—' },
                    { label: 'Označenie', value: row.designation || '—' },
                    { label: 'Rozloha', value: row.area || '—' },
                    { label: 'Cena', value: row.price || '—' },
                    { label: 'Prenájom', value: row.rent || RENT_PLACEHOLDER },
                ];

                columns.forEach((column) => {
                    const td = document.createElement('td');
                    td.setAttribute('role', 'cell');
                    td.dataset.label = column.label;
                    td.textContent = column.value || '—';
                    tr.appendChild(td);
                });

                const statusCell = document.createElement('td');
                statusCell.setAttribute('role', 'cell');
                statusCell.dataset.label = 'Stav';
                statusCell.classList.add('dm-dashboard__cell--status');
                const statusLabel = row.statusLabel || 'Bez stavu';
                const statusSlug = slugifyStatus(statusLabel);
                const statusBadge = document.createElement('span');
                statusBadge.className = `dm-status dm-status--${statusSlug}`;
                statusBadge.textContent = statusLabel;
                const statusKey = normaliseStatusId(row.statusId) || statusSlug;
                const statusInfo = statusKey ? state.statuses.get(statusKey) : null;
                const statusColor = row.statusColor || statusInfo?.color || STATUS_FALLBACK_COLOR;
                applyStatusBadgeStyles(statusBadge, statusSlug, statusColor);
                statusCell.appendChild(statusBadge);
                statusCell.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    focusArea(row.areaId, { showTooltip: true });
                });
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
            rebuildCustomSelectOptions(statusFilter);
        }

        function updateCounter(_filteredCount, totalCount) {
            counterEl.textContent = `${formatCountSk(totalCount)} celkom`;
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
            updateToolbarLegend(rows);
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
            syncSelectStates();
            applyFilters({ preserveActive: true });
        });

        priceFilter.addEventListener('change', () => {
            const value = priceFilter.value;
            state.priceOrder = value === 'asc' || value === 'desc' ? value : '';
            syncSelectStates();
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
                        const areaDisplay = formatAreaDisplay(floor.area);
                        const priceDisplay = formatPriceDisplay(floor.price);
                        const rentDisplay = formatRentDisplay(floor.rent);
                        const statusLabelResolved = statusInfo?.label ?? floor.statusLabel ?? floor.status ?? 'Bez stavu';
                        const statusColor = statusInfo?.color ?? floor.statusColor ?? STATUS_FALLBACK_COLOR;
                        const statusKey = normaliseStatusId(statusInfo?.id ?? statusId) || slugifyStatus(statusLabelResolved);
                        return {
                            floor,
                            floorId,
                            areaId: mappedArea ? mappedArea.areaId : floorId,
                            type: floor.type ?? '',
                            name: floor.name ?? floor.title ?? '',
                            designation: floor.designation ?? floor.label ?? '',
                            area: areaDisplay,
                            price: priceDisplay,
                            rent: rentDisplay,
                            statusId,
                            statusKey,
                            statusLabel: statusLabelResolved,
                            statusColor,
                            detailUrl: floor.detailUrl ?? floor.url ?? '',
                        };
                    })
                    .filter(Boolean);

                setupBlueprint(areaEntries);
                updateStatusFilterOptions();
                buildToolbarLegend();
                state.activeAreaId = null;
                state.hoverAreaId = null;
                state.searchTerm = '';
                state.statusFilter = '';
                state.priceOrder = '';
                searchInput.value = '';
                if (statusFilter) {
                    statusFilter.value = '';
                    updateCustomSelectDisplay(statusFilter);
                }
                if (priceFilter) {
                    priceFilter.value = '';
                    updateCustomSelectDisplay(priceFilter);
                }
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

            const baseFillColor = '#3445eb';
            const positiveFillColor = '#2b864c';
            const negativeFillColor = '#dc3545';
            const neutralFillColor = '#94a3b8';
            const idleAlpha = 0.32;
            const hoverAlpha = 0.54;
            const selectedAlpha = 0.68;
            const idleStrokeAlpha = 0.45;
            const hoverStrokeAlpha = 0.65;
            const selectedStrokeAlpha = 0.82;
            const idleOpacity = 0.42;
            const hoverOpacity = 0.64;
            const selectedOpacity = 0.78;

            const applyRegionFill = (polygon, summary) => {
                if (!polygon) {
                    return;
                }
                const hasSummary = summary && Array.isArray(summary.entries);
                let color = baseFillColor;
                let availabilityState = 'empty';

                if (hasSummary) {
                    if (!summary.entries.length) {
                        color = neutralFillColor;
                        availabilityState = 'empty';
                    } else if (summary.availableCount > 0) {
                        color = positiveFillColor;
                        availabilityState = 'available';
                    } else {
                        color = negativeFillColor;
                        availabilityState = 'unavailable';
                    }
                } else {
                    color = neutralFillColor;
                    availabilityState = 'empty';
                }

                const isSelected = polygon.dataset.dmSelected === 'true';
                const isHover = polygon.dataset.dmHover === 'true';
                const alpha = isSelected ? selectedAlpha : isHover ? hoverAlpha : idleAlpha;
                const strokeAlpha = isSelected ? selectedStrokeAlpha : isHover ? hoverStrokeAlpha : idleStrokeAlpha;
                const opacity = isSelected ? selectedOpacity : isHover ? hoverOpacity : idleOpacity;

                polygon.style.fill = toRgba(color, alpha);
                polygon.style.stroke = toRgba(color, strokeAlpha);
                polygon.style.strokeWidth = '1';
                polygon.style.strokeLinejoin = 'round';
                polygon.style.strokeLinecap = 'round';
                polygon.style.paintOrder = 'fill stroke';
                polygon.style.vectorEffect = 'non-scaling-stroke';
                polygon.style.opacity = String(opacity);
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
                    polygon.dataset.dmSelected = 'false';
                    polygon.dataset.dmHover = 'false';
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
                    const isSelected = el === polygon;
                    el.dataset.dmSelected = isSelected ? 'true' : 'false';
                    if (!isSelected) {
                        el.dataset.dmHover = 'false';
                    }
                    if (isSelected) {
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
                polygon.dataset.dmSelected = 'false';
                polygon.dataset.dmHover = 'false';
                applyRegionFill(polygon, summary);

                polygon.addEventListener('mouseenter', () => {
                    polygon.dataset.dmHover = 'true';
                    polygon.classList.add('is-active');
                    const regionInstance = regionById.get(polygon.getAttribute('data-region-id'));
                    const summaryActive = regionInstance
                        ? summariseRegion(regionInstance)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summaryActive);
                });
                polygon.addEventListener('mouseleave', () => {
                    polygon.dataset.dmHover = 'false';
                    const isSelected = activeRegionId === polygon.getAttribute('data-region-id');
                    if (!isSelected) {
                        polygon.classList.remove('is-active');
                    }
                    const region = regionById.get(polygon.getAttribute('data-region-id'));
                    const summary = region
                        ? summariseRegion(region)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summary);
                });
                polygon.addEventListener('focus', () => {
                    polygon.dataset.dmHover = 'true';
                    polygon.classList.add('is-active');
                    const regionInstance = regionById.get(polygon.getAttribute('data-region-id'));
                    const summaryActive = regionInstance
                        ? summariseRegion(regionInstance)
                        : { entries: [], linkedFloors: [], availableCount: 0 };
                    applyRegionFill(polygon, summaryActive);
                });
                polygon.addEventListener('blur', () => {
                    polygon.dataset.dmHover = 'false';
                    const isSelected = activeRegionId === polygon.getAttribute('data-region-id');
                    if (!isSelected) {
                        polygon.classList.remove('is-active');
                    }
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
