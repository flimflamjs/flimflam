#!/bin/bash
echo "Testing $1..."
PATH=$(npm bin):$PATH
browserify -t babelify -t cssify $1/test/index.js | tape-run | tap-spec
