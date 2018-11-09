.DEFAULT_GOAL := help
NPM           ?= npm
SHELL         := /bin/bash

help:
	@cat $(MAKEFILE_LIST) | grep -E '^[a-zA-Z_-]+:.*?## .*$$' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install-ci:
	$(NPM) ci

fmt:
	$(NPM) run fmt

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
	test integration-test publish \
	install-ci clean
