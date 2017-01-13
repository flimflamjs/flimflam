#!/bin/bash
echo "Testing $1..."
PATH=$(npm bin):$PATH
browserify $1/test/index.js | tape-run | tap-spec
