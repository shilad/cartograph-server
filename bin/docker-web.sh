#!/usr/bin/env bash


conf=$1

if [ -z "$conf" ] || ! [ -f "$conf" ]; then
    echo "Configuration file $conf not found or not specified" >&2
    echo "Usage: $0 path/to/configuration" >&2
    exit 1
fi
if [[ "$conf" = /* ]]; then
    echo "Path to configuration file must be relative, not absolute" >&2
    echo "Usage: $0 path/to/configuration" >&2
    exit 1
fi

function die() {
    echo $@ >&2
    exit 1
}

# TODO SWS: Add ":delegated" to the end of the -v line to improve mounted volume
# performance after version 17.04 is released.
docker pull shilad/cartograph-base:latest || die "Docker pull failed."


docker run \
    -e PYTHONPATH=.:./server \
    -e CARTOGRAPH_CONFIGS="$conf" \
    -v "$(pwd)":/cartograph-server \
    -w /cartograph-server \
    -p 3000:3000 \
    shilad/cartograph-base:latest \
    gunicorn --workers 4 -b 0.0.0.0:3000 app2:app --reload
