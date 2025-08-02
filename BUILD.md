# Graphite Build System

This document describes the new build system that supports both Docker and static website deployments.

## Project Structure

```
graphite/
├── src/                          # Shared source code
│   ├── assets/                   # Images, icons, templates  
│   ├── css/                      # Stylesheets
│   ├── js/                       # JavaScript modules
│   │   ├── core/                 # Core topology logic (shared)
│   │   ├── features/             # Feature modules (conditional)
│   │   └── config/               # Runtime configuration
│   └── templates/                # HTML templates
├── build/                        # Build configurations
│   ├── webpack.common.js         # Shared webpack config
│   ├── webpack.docker.js         # Docker-specific build
│   └── webpack.static.js         # Static-specific build
├── dist/                         # Generated builds
│   ├── docker/                   # Docker deployment files
│   └── static/                   # Static website files
└── package.json                  # Build scripts and dependencies
```

## Build Commands

### Build Both Versions
```bash
npm run build
```

### Build Docker Version Only
```bash
npm run build:docker
```

### Build Static Version Only  
```bash
npm run build:static
```

### Development Server
```bash
npm run dev
```

### Clean Build Artifacts
```bash
npm run clean
```

## Deployment Modes

### Docker Mode
- **Features**: Full feature set including WebSSH and live data
- **Dependencies**: Requires containerlab backend services
- **Paths**: Server-relative paths (`/next-bower/`, `/bootstrap-3.4.1-dist/`)
- **Output**: `dist/docker/`

### Static Mode
- **Features**: Client-side only (drag-and-drop, visualization)
- **Dependencies**: Self-contained with bundled assets
- **Paths**: Relative paths (`./vendor/next-bower/`, `./vendor/bootstrap-3.4.1-dist/`)
- **Output**: `dist/static/`

## Feature System

Features are conditionally loaded based on deployment mode:

- **Core Features** (both modes): Topology visualization, file upload, layout controls
- **Docker-Only Features**: WebSSH terminal, live device data, auto-refresh
- **Configuration**: `src/js/config/deployment.js` handles runtime feature detection

## Integration with Existing Docker Build

The Docker deployment continues to work with the existing Dockerfile by:

1. Copying `dist/docker/` contents to the container
2. Using the same volume mounts and port configurations
3. Maintaining backward compatibility with current deployments

## Static Website Deployment

The static build creates a self-contained website that can be:

1. Hosted on any web server (Apache, Nginx, CDN)
2. Served from GitHub Pages or Netlify
3. Run locally with any HTTP server

Files in `dist/static/` include all necessary assets and dependencies.