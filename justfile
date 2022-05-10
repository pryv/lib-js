# add node bin script path for recipes
export PATH := "./node_modules/.bin:" + env_var('PATH')

# Default: display available recipes
_help:
    @just --list

# –––––––––––––----------------------------------------------------------------
# Setup
# –––––––––––––----------------------------------------------------------------

# Set up the dev environment on a MacOS or GNU/Linux system
setup-dev-env:
    scripts/setup-dev-env

# Clean up `dist/` (resetting it to the currently published state) and `test-browser/`
clean:
    #!/bin/sh
    set -e
    rm -rf test-browser
    cd dist
    git fetch origin
    git reset --hard origin/gh-pages
    git clean -fdx

# Install node modules
install *params:
    npm install {{params}}

# Compile code to `dist/`
build *params:
    webpack {{params}}

# Compile code to `dist/`, then watch and recompile on changes
build-watch *params:
    webpack --watch {{params}}

# –––––––––––––----------------------------------------------------------------
# Test & related
# –––––––––––––----------------------------------------------------------------

# Run code linting
lint *params:
    semistandard {{params}}

# Run tests on the given component ('all' for all components) with optional extra parameters
test component *params:
    NODE_ENV=test COMPONENT={{component}} components-run \
        npx mocha -- {{params}}

# Run tests for debugging
test-debug component *params:
    NODE_ENV=test COMPONENT={{component}} components-run \
        npx mocha -- --timeout 3600000 --inspect-brk=40000 {{params}}

# Run tests and generate coverage report
test-cover component *params:
    NODE_ENV=test COMPONENT={{component}} nyc --reporter=lcov --reporter=text --report-dir=./coverage \
        components-run npx mocha -- {{params}}

# Run browser tests (assumes browser files are built)
test-browser:
    (sleep 1 && open https://l.rec.la:8443/?pryvServiceInfoUrl=https://zouzou.com/service/info) &
    rec.la ./test-browser 8443

# Start a `rec.la` web server on `dist/`
serve:
    (sleep 1 && open https://l.rec.la:9443/) &
    rec.la ./dist 9443

# –––––––––––––----------------------------------------------------------------
# Misc. utils
# –––––––––––––----------------------------------------------------------------

# Run source licensing tool
license:
    source-licenser --config-file .licenser.yml ./

# Set version on all `package.json` (root’s and components’)
version version:
    npm version --workspaces --include-workspace-root {{version}}

# Publish all components to NPM
publish-npm:
    npm publish --workspaces

# Publish browser files in `dist/` (i.e. the `gh-pages` branch)
publish-browser:
    #!/bin/sh
    set -e
    cd dist
    git add --all
    git commit -m "Updated generated files"
    git push
