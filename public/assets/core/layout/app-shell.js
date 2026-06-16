export function renderAppShell(state, data, {
    renderHeader,
    renderMapsView,
    renderDashboardView,
    renderSettingsView,
    renderGuidesView,
    APP_VIEWS,
    assetsBase,
}) {
    return `
        <div class="dm-app">
            ${renderHeader(state, assetsBase)}
            <div class="dm-page">
                ${state.view === APP_VIEWS.MAPS ? renderMapsView(state, data) : ''}
                ${state.view === APP_VIEWS.DASHBOARD ? renderDashboardView(state, data) : ''}
                ${state.view === APP_VIEWS.SETTINGS ? renderSettingsView(state, data) : ''}
                ${state.view === APP_VIEWS.GUIDES ? renderGuidesView(state, data) : ''}
            </div>
        </div>
    `;
}
