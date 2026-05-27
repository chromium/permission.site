NPM_COMMANDS = lint format

.PHONY: $(NPM_COMMANDS)
$(NPM_COMMANDS): setup
	npm run $@

.SILENT: lint-ci-rdjson
# We don't have `setup` as a dependency here, since:
# 1. It's already been run in CI.
# 2. This avoids having to suppress command output without duplicating the `setup` target.
.PHONY: lint-ci-rdjson
lint-ci-rdjson:
	npm run --silent lint-ci-rdjson

.PHONY: setup
setup:
	npm install
