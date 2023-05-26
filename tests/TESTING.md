# Testing

## Manual testing - Docker image `netreplica/graphite:local`

```
TOPOLOGY="$(pwd)/default.json"
CLABDIR=$(pwd)
GRAPHITE_DEFAULT_TYPE=clab
GRAPHITE_DEFAULT_TOPO=colo
```

1. No mount/bind – a topology included as a default should rendered: http://localhost:8080/graphite/index.html

```
docker run -d -t --rm \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite:local
```

2. The default topology file is directly mounted: http://localhost:8080/graphite/index.html. Live device data will be disabled

```
docker run -d -t --rm \
  --mount type=bind,source="${TOPOLOGY}",target=/htdocs/default/default.json,readonly \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite:local
```

3. The default lab folder is directly mounted: http://localhost:8080/graphite/index.html. Live device data may be be enabled – TODO check

```
docker run -d -t --rm \
  -v "${CLABDIR}/default":/htdocs/lab/default:ro \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite:local
```

4. The topology file is mounted under a default lab folder: http://localhost:8080/graphite/index.html. Live device data will be disabled

```
docker run -d -t --rm \
  --mount type=bind,source="${TOPOLOGY}",target=/htdocs/lab/default/topology-data.json,readonly \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite:local
```

5. A directory with lab subfolders is mounted, and a specific lab is selected via URL: http://localhost:8080/graphite/index.html?type=clab&topo=colo. Live device data may be be enabled – TODO check

```
docker run -d -t --rm \
  -v "${CLABDIR}":/htdocs/lab:ro \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite:local
```

5. A directory with lab subfolders is mounted, and a default lab is pointed via env vars:: http://localhost:8080/graphite/index.html. A specific lab cab be selected via URL: http://localhost:8080/graphite/index.html?type=clab&topo=colo. Live device data may be be enabled – TODO check

```
docker run -d -t --rm \
  -v "${CLABDIR}":/htdocs/lab:ro \
  -e GRAPHITE_DEFAULT_TYPE="${GRAPHITE_DEFAULT_TYPE}" \
  -e GRAPHITE_DEFAULT_TOPO="${GRAPHITE_DEFAULT_TOPO}" \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite:local
```
