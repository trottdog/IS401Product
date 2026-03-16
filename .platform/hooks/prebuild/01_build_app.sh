#!/bin/bash
set -euo pipefail

npm run expo:static:build
npm run server:build