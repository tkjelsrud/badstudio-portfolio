#!/usr/bin/env bash
set -euo pipefail
# Helper to run Jekyll in Docker and install the missing webrick gem
# Usage: ./scripts/docker-jekyll-serve.sh

docker run --rm -p 4000:4000 \
  -v "$PWD":/srv/jekyll -w /srv/jekyll \
  jekyll/jekyll:latest \
  sh -c "gem install webrick --no-document && jekyll serve --host 0.0.0.0 --watch"
