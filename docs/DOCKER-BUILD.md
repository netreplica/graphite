# Building Graphite as a Docker container

## Pre-requisites

1. Docker
2. Git

## Building a Docker image from source

1. Build `lighttpd` configuration

    ```Shell
    mkdir -p docker/etc/lighttpd/conf.d

    cp docker/lighttpd1.4/doc/config/conf.d/mime.conf docker/etc/lighttpd/conf.d
    cp docker/lighttpd1.4/doc/config/conf.d/dirlisting.conf docker/etc/lighttpd/conf.d

    cat docker/lighttpd1.4/doc/config/lighttpd.conf | \
    sed "s/^var.server_root.*$/var.server_root = \"\/var\/www\/localhost\"/" | \
    sed "s/^server.errorlog.*$/server.errorlog = \"\/dev\/stderr\"/" | \
    sed "s/^server.document-root.*$/server.document-root = \"\/htdocs\"/" | \
    grep -v "server.use-ipv6" | \
    grep -v "debug.conf" \
    > docker/etc/lighttpd/lighttpd.conf

    wget -O src/bootstrap-3.4.1-dist.zip https://github.com/twbs/bootstrap/releases/download/v3.4.1/bootstrap-3.4.1-dist.zip
    unzip src/bootstrap-3.4.1-dist.zip -d src/
    cp -R src/bootstrap-3.4.1-dist graphite/docker

    mkdir -p graphite/docker/default
    cp graphite/examples/topology-data.json graphite/docker/default/
    ```

4. Build

    ```Shell
    cd graphite
    # Current envsubst version in alpine has bugs, use a go implementation instead
    curl -L https://github.com/a8m/envsubst/releases/download/v1.2.0/envsubst-Linux-x86_64 -o docker/bin/envsubst
    chmod +x docker/bin/envsubst
    # You might need to add --no-cache=true parameter if latest changes in the dependencies are not propagating to the build
    # Nodedata-image
    docker image build --target nodedata-image --tag netreplica/graphite:nodedata-stage .
    # Webssh-image
    docker image build --target webssh-image --tag netreplica/graphite:webssh-stage .
    # Release-image
    docker image build --target release-image \
    --cache-from=netreplica/graphite:nodedata-stage \
    --cache-from=netreplica/graphite:webssh-stage \
    --tag netreplica/graphite:local .
    ```

5. Audit

    ```Shell
    docker run --rm -d --name graphite netreplica/graphite:local
    sleep 2
    docker logs graphite
    docker exec -t graphite sh -c "cd \$WEBSSH2; npm audit"
    docker stop graphite
    ```
