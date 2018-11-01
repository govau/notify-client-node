.DEFAULT_GOAL := help
NPM           ?= npm
SHELL         := /bin/bash

help:
	@cat $(MAKEFILE_LIST) | grep -E '^[a-zA-Z_-]+:.*?## .*$$' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

ci:
	$(NPM) ci --production

ci-dev:
	$(NPM) ci

install:
	$(NPM) install --production

install-dev:
	$(NPM) install

build:
	$(NPM) run build ## Build project

test: ## Run tests
	$(NPM) test

integration-test: ## Run integration tests
	$(NPM) test --integration

publish:
	$(NPM) publish --access public

clean:
	$(NPM) run clean

.PHONY:
	install install-dev build \
	test integration-test publish-to-npmjs \
	ci ci-dev clean
