export function renderDashboardView(state, data) {
    const project = data.projects.find((item) => item.id === state.activeProjectId) ?? data.projects[0];
    const floors = project.floors ?? [];
    return `
        <section class="dm-dashboard">
            <button class="dm-link-button dm-dashboard__back" data-dm-back>← Späť na zoznam</button>
            <header class="dm-dashboard__hero">
                <div class="dm-dashboard__title">
                    <h1>${project.name}</h1>
                    <p>Dashboard / ${project.name}</p>
                </div>
            </header>
            <div class="dm-dashboard__media">
                <div class="dm-hero dm-hero--building">
                    ${floors
                        .map(
                            (floor, index) => `
                                <span class="dm-hero__label" style="top:${18 + index * 12}%">${floor.label}</span>
                            `,
                        )
                        .join('')}
                </div>
            </div>
            <section class="dm-dashboard__list">
                <header class="dm-dashboard__list-head">
                    <h2>Zoznam lokalít</h2>
                    <div class="dm-dashboard__actions">
                        <input type="search" placeholder="Vyhľadať lokalitu..." />
                        <select>
                            <option>Stav</option>
                        </select>
                        <button class="dm-button dm-button--dark" data-dm-modal="add-location">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus-icon lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                            Pridať lokalitu
                        </button>
                    </div>
                </header>
                <table class="dm-dashboard__table">
                    <thead>
                        <tr>
                            <th>Typ</th>
                            <th>Názov</th>
                            <th>Rozloha</th>
                            <th>Akcie</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${floors
                            .map(
                                (floor) => `
                                    <tr>
                                        <td>${floor.type}</td>
                                        <td>${floor.name.replace('Poschodie ', '')}</td>
                                        <td>${floor.area}</td>
                                        <td>
                                            <button class="dm-table-link" data-dm-modal="edit-map">Upraviť</button>
                                            <span>|</span>
                                            <button class="dm-table-link" data-dm-modal="delete-map">Odstrániť</button>
                                        </td>
                                    </tr>
                                `,
                            )
                            .join('')}
                    </tbody>
                </table>
            </section>
        </section>
    `;
}
