NPM_COMMANDS = lint format

.PHONY: $(NPM_COMMANDS)
$(NPM_COMMANDS): setup
	npm run $@

.PHONY: setup
setup:
	npm install
