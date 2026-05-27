NPM_COMMANDS = lint lint-ci-github format

.PHONY: $(NPM_COMMANDS)
$(NPM_COMMANDS): setup
	npm run $@

.PHONY: setup
setup:
	npm install
