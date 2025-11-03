/**
 * WordPress Admin Layout Manager
 * 
 * Dynamicky meria a aplikuje offsety pre vlastný panel/editor vo WordPress admin rozhraní,
 * aby nezaliezel pod ľavé menu ani horný admin bar.
 * 
 * Features:
 * - Automatické meranie reálnej šírky WP menu a výšky admin baru
 * - Reaguje na fold/unfold menu
 * - Sleduje resize okna
 * - MutationObserver pre zmeny v DOM
 * - Čistý vanilla JS, žiadne závislosti
 * 
 * @version 1.0.0
 * @date 2025-11-03
 */

export class WPAdminLayoutManager {
    constructor(editorSelector = '.dm-editor-overlay') {
        this.editorSelector = editorSelector;
        this.editor = null;
        
        // WordPress admin selektory
        this.selectors = {
            adminBar: '#wpadminbar',
            adminMenu: '#adminmenuwrap',
            adminMenuMain: '#adminmenu',
            body: 'body'
        };
        
        // Cache pre DOM elementy
        this.elements = {
            adminBar: null,
            adminMenu: null,
            adminMenuMain: null,
            body: null
        };
        
        // Aktuálne offsety
        this.offsets = {
            left: 0,
            top: 0
        };
        
        // Debounce timer
        this.resizeTimer = null;
        this.resizeDelay = 150;
        
        // MutationObserver
        this.observer = null;
        
        // Bind metódy
        this.handleResize = this.handleResize.bind(this);
        this.handleMenuTransition = this.handleMenuTransition.bind(this);
        this.updateLayout = this.updateLayout.bind(this);
    }
    
    /**
     * Inicializuje layout manager
     */
    init() {
        // Nájdi editor element
        this.editor = document.querySelector(this.editorSelector);
        if (!this.editor) {
            console.warn(`[WPAdminLayout] Editor element not found: ${this.editorSelector}`);
            return false;
        }
        
        // Cache WordPress admin elementy
        this.cacheElements();
        
        // Počiatočné meranie
        this.updateLayout();
        
        // Nastav event listeners
        this.attachListeners();
        
        // Nastav MutationObserver pre zmeny v DOM
        this.setupObserver();
        
        console.log('[WPAdminLayout] Initialized successfully');
        return true;
    }
    
    /**
     * Cache WordPress admin DOM elementy
     */
    cacheElements() {
        this.elements.adminBar = document.querySelector(this.selectors.adminBar);
        this.elements.adminMenu = document.querySelector(this.selectors.adminMenu);
        this.elements.adminMenuMain = document.querySelector(this.selectors.adminMenuMain);
        this.elements.body = document.body;
    }
    
    /**
     * Zmeria aktuálne rozmery WordPress admin UI
     */
    measureAdminUI() {
        const measurements = {
            menuWidth: 0,
            adminBarHeight: 0,
            isFolded: false,
            isAutoFold: false,
            hasAdminBar: false,
            hasAdminMenu: false
        };
        
        // Zmeraj admin bar výšku
        if (this.elements.adminBar) {
            const barRect = this.elements.adminBar.getBoundingClientRect();
            measurements.adminBarHeight = barRect.height;
            measurements.hasAdminBar = true;
        }
        
        // Zmeraj menu šírku
        if (this.elements.adminMenu) {
            measurements.hasAdminMenu = true;
            
            // Zisti či je menu folded
            measurements.isFolded = this.elements.body.classList.contains('folded');
            measurements.isAutoFold = this.elements.body.classList.contains('auto-fold');
            
            // Zmeraj REÁLNU šírku menu
            const menuRect = this.elements.adminMenu.getBoundingClientRect();
            measurements.menuWidth = menuRect.width;
            
            // Ak je šírka 0, skús alternatívne meranie
            if (measurements.menuWidth === 0 && this.elements.adminMenuMain) {
                const mainMenuRect = this.elements.adminMenuMain.getBoundingClientRect();
                measurements.menuWidth = mainMenuRect.width;
            }
            
            // Fallback na štandardné hodnoty ak meranie zlyhá
            if (measurements.menuWidth === 0) {
                if (measurements.isFolded || measurements.isAutoFold) {
                    measurements.menuWidth = 36; // Folded menu width
                } else {
                    measurements.menuWidth = 160; // Expanded menu width
                }
            }
        }
        
        return measurements;
    }
    
    /**
     * Aktualizuje layout editora na základe meraní
     */
    updateLayout() {
        if (!this.editor) return;
        
        const measurements = this.measureAdminUI();
        
        // Vypočítaj offsety
        const leftOffset = measurements.hasAdminMenu ? measurements.menuWidth : 0;
        const topOffset = measurements.hasAdminBar ? measurements.adminBarHeight : 0;
        
        // Aplikuj len ak sa zmenili
        if (this.offsets.left !== leftOffset || this.offsets.top !== topOffset) {
            this.offsets.left = leftOffset;
            this.offsets.top = topOffset;
            
            this.applyOffsets();
            
            console.log('[WPAdminLayout] Layout updated:', {
                left: leftOffset,
                top: topOffset,
                isFolded: measurements.isFolded,
                isAutoFold: measurements.isAutoFold
            });
        }
    }
    
    /**
     * Aplikuje offsety na editor
     */
    applyOffsets() {
        if (!this.editor) return;
        
        // Aplikuj CSS custom properties
        this.editor.style.setProperty('--wp-admin-menu-width', `${this.offsets.left}px`);
        this.editor.style.setProperty('--wp-admin-bar-height', `${this.offsets.top}px`);
        
        // Aplikuj aj ako inline styles pre istotu
        this.editor.style.left = `${this.offsets.left}px`;
        this.editor.style.top = `${this.offsets.top}px`;
        this.editor.style.width = `calc(100vw - ${this.offsets.left}px)`;
        this.editor.style.height = `calc(100vh - ${this.offsets.top}px)`;
    }
    
    /**
     * Nastav event listeners
     */
    attachListeners() {
        // Window resize s debounce
        window.addEventListener('resize', this.handleResize);
        
        // Body class changes (fold/unfold)
        if (this.elements.body) {
            // Sleduj zmeny tried na body
            const bodyObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        // Delay pre dokončenie CSS transitions
                        setTimeout(() => {
                            this.updateLayout();
                        }, 350); // WordPress menu transition je 300ms
                    }
                });
            });
            
            bodyObserver.observe(this.elements.body, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
        
        // Menu transition end
        if (this.elements.adminMenu) {
            this.elements.adminMenu.addEventListener('transitionend', this.handleMenuTransition);
        }
        
        // Admin bar events (pre mobilné breakpointy)
        if (this.elements.adminBar) {
            // Pozoruj zmeny na admin bare
            const barObserver = new MutationObserver(() => {
                this.updateLayout();
            });
            
            barObserver.observe(this.elements.adminBar, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
    }
    
    /**
     * Handle window resize s debounce
     */
    handleResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.updateLayout();
        }, this.resizeDelay);
    }
    
    /**
     * Handle menu transition end
     */
    handleMenuTransition(event) {
        // Aktualizuj len pri width transitions
        if (event.propertyName === 'width' || event.propertyName === 'margin-left') {
            this.updateLayout();
        }
    }
    
    /**
     * Nastav MutationObserver pre sledovanie DOM zmien
     */
    setupObserver() {
        this.observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                // Sleduj pridanie/odstránenie admin elementov
                if (mutation.addedNodes.length || mutation.removedNodes.length) {
                    const relevantChange = Array.from(mutation.addedNodes)
                        .concat(Array.from(mutation.removedNodes))
                        .some(node => {
                            if (node.nodeType !== Node.ELEMENT_NODE) return false;
                            const el = node;
                            return el.id === 'wpadminbar' || 
                                   el.id === 'adminmenuwrap' || 
                                   el.id === 'adminmenu';
                        });
                    
                    if (relevantChange) {
                        shouldUpdate = true;
                        this.cacheElements(); // Re-cache elements
                    }
                }
            });
            
            if (shouldUpdate) {
                setTimeout(() => {
                    this.updateLayout();
                }, 100);
            }
        });
        
        // Sleduj celý document body
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Vyčistí event listeners a observers
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        
        if (this.elements.adminMenu) {
            this.elements.adminMenu.removeEventListener('transitionend', this.handleMenuTransition);
        }
        
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // Clear timer
        clearTimeout(this.resizeTimer);
        
        // Reset editor styles
        if (this.editor) {
            this.editor.style.removeProperty('--wp-admin-menu-width');
            this.editor.style.removeProperty('--wp-admin-bar-height');
            this.editor.style.left = '';
            this.editor.style.top = '';
            this.editor.style.width = '';
            this.editor.style.height = '';
        }
        
        console.log('[WPAdminLayout] Destroyed');
    }
    
    /**
     * Manuálne vynúti update
     */
    forceUpdate() {
        this.cacheElements();
        this.updateLayout();
    }
    
    /**
     * Získaj aktuálne offsety
     */
    getOffsets() {
        return { ...this.offsets };
    }
}

/**
 * Helper funkcia pre rýchlu inicializáciu
 */
export function initWPAdminLayout(editorSelector = '.dm-editor-overlay') {
    const manager = new WPAdminLayoutManager(editorSelector);
    const initialized = manager.init();
    return initialized ? manager : null;
}

export default WPAdminLayoutManager;
