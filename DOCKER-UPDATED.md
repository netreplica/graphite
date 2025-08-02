# Updated Docker Deployment

This document describes the updated Docker deployment process using the new build system.

## What Changed

### Before
- Graphite app files were copied directly from `app/` folder
- No build process during Docker image creation
- Dependencies like NextUI were cloned at runtime

### After  
- Graphite app is built during Docker image creation
- Source code is in `src/` with shared components
- Built artifacts are copied from `dist/docker/`
- Feature modules are conditionally included

## New Dockerfile Structure

```dockerfile
# Multi-stage build with new Graphite build stage
FROM alpine:3.15 AS graphite-build-image
RUN apk add --no-cache npm
WORKDIR /build
COPY package.json package-lock.json ./
COPY build/ ./build/
COPY src/ ./src/
COPY docker/ ./docker/
RUN npm ci --production=false && npm run build:docker

# Final stage uses built artifacts
COPY --from=graphite-build-image /build/dist/docker/ ${WWW_HOME}/graphite/
```

## Building the Docker Image

### Standard Build
```bash
docker build -t netreplica/graphite .
```

### Development Build
```bash
# Build locally first (optional, for testing)
npm run build:docker

# Then build Docker image  
docker build -t netreplica/graphite:dev .
```

## File Changes

### New Files
- `package.json` - Build dependencies and scripts
- `package-lock.json` - Locked dependency versions
- `build/webpack.*.js` - Build configurations
- `src/` - Source code structure
- `.dockerignore` - Optimize build context

### Modified Files
- `Dockerfile` - Added build stage
- Existing functionality preserved

## Backward Compatibility

✅ **Deployment**: Same container behavior and volumes  
✅ **Configuration**: Same environment variables and ports  
✅ **Features**: All Docker features (WebSSH, live data) preserved  
✅ **Integration**: Works with existing containerlab setups  

## Benefits

1. **Cleaner Builds**: Source code compiled during image creation
2. **Feature Management**: Conditional loading of Docker-only features  
3. **Consistency**: Same build system for both Docker and static deployments
4. **Optimization**: Smaller final image with only built artifacts

## Troubleshooting

### Build Fails
```bash
# Check build context size
du -sh .

# Clean and rebuild
npm run clean
docker build --no-cache -t netreplica/graphite .
```

### Missing Dependencies
```bash
# Verify package.json exists
ls -la package*.json

# Check build files
ls -la build/
```

### Runtime Issues
The new built application should behave identically to the previous version. If you encounter issues:

1. Check browser console for JavaScript errors
2. Verify all feature modules are loaded correctly
3. Compare generated HTML with previous version

## Next Steps

This update is backward compatible and can be deployed as a drop-in replacement for the existing Docker setup.