/**
 * Initial data structure for Developer Map plugin
 * Contains hierarchical structure of projects (buildings) and their floors
 */
export function createInitialData() {
    return {
        projects: [],
        types: [],
        statuses: [],
        colors: [],
        fonts: [],
    };
}

/**
 * Default types for new installations
 */
export function getDefaultTypes() {
    return [
        { id: 'type-1', name: 'Bytovka', label: 'Bytovka', color: '#405ECD' },
        { id: 'type-2', name: 'Dom', label: 'Dom', color: '#AE40CD' },
        { id: 'type-3', name: 'Pozemok', label: 'Pozemok', color: '#40AECD' },
        { id: 'type-4', name: 'Poschodie', label: 'Poschodie', color: '#1c9967ff' },
        { id: 'type-5', name: 'Byt', label: 'Byt', color: '#8c1726ff' },
    ];
}

/**
 * Default statuses for new installations
 */
export function getDefaultStatuses() {
    return [
        { id: 'status-1', label: 'Voľný', color: '#49CD40' },
        { id: 'status-2', label: 'Rezervovaný', color: '#D79E21' },
        { id: 'status-3', label: 'Predaný', color: '#CD4040' },
    ];
}

/**
 * Default colors for new installations
 */
export function getDefaultColors() {
    return [
        { id: 'color-1', name: 'Farba tlačidiel', value: '#7c3aed' },
        { id: 'color-2', name: 'Farba nadpisov', value: '#1C134F' },
        { id: 'color-3', name: 'Farba obsahových textov', value: '#6b7280' },
    ];
}
