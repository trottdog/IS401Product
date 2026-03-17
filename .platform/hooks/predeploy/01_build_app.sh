#!/bin/bash
set -euo pipefail

npm run server:build
npm run expo:static:build
