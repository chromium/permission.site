NPM_COMMANDS = lint lint-ci lint-ci-formatter-annotations format

.PHONY: $(NPM_COMMANDS)
$(NPM_COMMANDS): setup
	npm run $@

.SILENT: lint-ci-comments-rdjson
# We don't have `setup` as a dependency here, since:
# 1. It's already been run in CI.
# 2. This avoids having to suppress command output without duplicating the `setup` target.
.PHONY: lint-ci-comments-rdjson
lint-ci-comments-rdjson:
	npm run --silent lint-ci-comments-rdjson

.PHONY: setup
setup:
	npm install
