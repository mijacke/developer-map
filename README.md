# Developer Map 🗺️

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/yourusername/developer-map)
[![WordPress Plugin](https://img.shields.io/badge/WordPress-Plugin-blue.svg)](https://wordpress.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Developer Map** is a WordPress plugin that provides an interactive administrative dashboard for managing property statuses with an interactive map interface. Perfect for real estate developers, architects, and property management teams who need to visualize and manage floor plans, blueprints, and property statuses.

## 🌟 Features

### Core Functionality
- **Interactive Map Interface** - Visualize properties on interactive floor plans and blueprints
- **Property Status Management** - Track property states (Available, Reserved, Sold)
- **Multi-Project Support** - Manage multiple developments simultaneously
- **Real-time Updates** - Dynamic UI updates without page reloads
- **Custom Color Palettes** - Configurable status colors with hatch patterns

### Technical Features
- **ES Module Architecture** - Modern JavaScript with dynamic imports
- **SVG & GeoJSON Adapters** - Support for multiple map formats
- **Image Renderer** - Efficient rendering with canvas support
- **Modular Design** - Clean separation of concerns with adapters, renderers, and core logic
- **Cache-Busting** - Automatic versioning for asset updates
- **TypeScript Support** - Type definitions available for adapters and renderers

### Dashboard Views
- **Maps View** - Browse and manage all projects and their maps
- **Floor Plans** - Detailed floor plan visualization
- **Blueprints** - Technical blueprint overlays
- **Settings** - Comprehensive configuration interface
  - Overview settings
  - Property types management
  - Status configuration
  - Color customization
  - Typography settings

## 📋 Requirements

- **WordPress**: 5.0 or higher
- **PHP**: 7.4 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (with ES6+ support)

## 🚀 Installation

### Manual Installation

1. **Download or Clone** this repository:
   ```bash
   git clone https://github.com/yourusername/developer-map.git
   ```

2. **Upload to WordPress**:
   - Copy the `developer-map` folder to `/wp-content/plugins/`
   - Or zip the folder and upload via WordPress admin panel

3. **Activate the Plugin**:
   - Navigate to `Plugins` in your WordPress admin
   - Find "Developer Map" and click `Activate`

4. **Create the Dev Page**:
   - Create a new page with slug: `/devtest-9kq7wza3`
   - Add the shortcode: `[devmap]`
   - Publish the page

## 📖 Usage

### Basic Usage

Once activated, the plugin can be accessed via shortcode:

```php
[devmap]
```

This shortcode should be placed on a page with the specific slug `/devtest-9kq7wza3` (configurable in `developer-map.php`).

### Configuration

The plugin includes a demo configuration file at `public/assets/config/demo.config.js`:

```javascript
export const demoProjectConfig = {
    id: 'demo-project',
    title: 'Developer Map – Demo Projekt',
    description: 'Dashboard for managing property statuses',
    adapter: {
        type: 'svg',
        options: { snapTolerance: 8 }
    },
    renderer: {
        type: 'image',
        clamp: true,
        size: { width: 1600, height: 900 },
        source: './media/demo-floorplan-placeholder.svg'
    },
    palette: {
        statuses: [
            { key: 'available', label: 'Available', color: '#16a34a' },
            { key: 'reserved', label: 'Reserved', color: '#f97316' },
            { key: 'sold', label: 'Sold', color: '#ef4444' }
        ]
    }
};
```

### Project Structure

```
developer-map/
├── developer-map.php          # Main plugin file
├── public/
│   └── assets/
│       ├── dm.css            # Main styles
│       ├── dm.js             # Entry point (ES module)
│       ├── adapters/         # Map format adapters
│       │   ├── geoJsonAdapter.js
│       │   ├── geoJsonAdapter.ts
│       │   ├── svgAdapter.js
│       │   └── svgAdapter.ts
│       ├── config/           # Configuration files
│       │   ├── demo.config.js
│       │   └── demo.config.ts
│       ├── core/
│       │   └── app.js        # Core application logic
│       ├── media/            # Images and assets
│       └── renderers/        # Rendering engines
│           ├── imageRenderer.js
│           └── imageRenderer.ts
└── README.md
```

## 🔧 Development

### Asset Versioning

The plugin uses file modification time for cache-busting:

```php
$css_ver = filemtime($base_path.'dm.css');
$js_ver  = filemtime($base_path.'dm.js');
```

### ES Modules

The main entry point `dm.js` dynamically loads the core application:

```javascript
const ver = runtimeConfig.ver || Date.now();
const mod = await import(`./core/app.js?ver=${ver}`);
```

### Adding Custom Adapters

Create a new adapter in `public/assets/adapters/`:

```javascript
export class CustomAdapter {
    constructor(options) {
        this.options = options;
    }
    
    // Implement adapter methods
    parse(data) { /* ... */ }
    render(canvas) { /* ... */ }
}
```

### Adding Custom Renderers

Create a new renderer in `public/assets/renderers/`:

```javascript
export class CustomRenderer {
    constructor(config) {
        this.config = config;
    }
    
    // Implement renderer methods
    render(context, data) { /* ... */ }
}
```

## 🎨 Customization

### CSS Customization

Main styles are in `public/assets/dm.css`. The plugin uses a BEM-like naming convention:

```css
.dm-shell { /* Main container */ }
.dm-shell__header { /* Header */ }
.dm-shell__main { /* Main content */ }
.dm-map { /* Map container */ }
.dm-canvas { /* Canvas element */ }
```

### Status Colors

Customize status colors in your project configuration:

```javascript
palette: {
    statuses: [
        {
            key: 'available',
            label: 'Available',
            color: '#16a34a',
            hatchClass: 'dm-hatch-available'
        }
        // Add more statuses...
    ]
}
```

## 🐛 Troubleshooting

### Plugin Not Loading

1. Check browser console for JavaScript errors
2. Verify the shortcode is on the correct page slug
3. Ensure WordPress is enqueuing the scripts properly

### Map Not Displaying

1. Verify the media file path in your configuration
2. Check that the renderer type matches your data format
3. Look for errors in the browser console

### Fallback UI Appears

The plugin will show a fallback UI if:
- Runtime config is missing
- `core/app.js` fails to load
- Invalid root element

Check the console for specific error messages.

## 📝 Changelog

### Version 0.1.0 (Initial Release)
- ✨ Interactive map dashboard
- 🗺️ SVG and GeoJSON adapter support
- 🎨 Image renderer with canvas support
- ⚙️ Comprehensive settings interface
- 📊 Multi-project management
- 🎨 Customizable status palettes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Mario**

- Plugin: Developer Map
- Version: 0.1.0

## 🙏 Acknowledgments

- Built with modern ES modules and WordPress best practices
- Inspired by real estate property management needs
- Special thanks to the WordPress community

---

**Note**: This plugin is designed for administrative use only and loads exclusively via the `[devmap]` shortcode on the designated development page.
