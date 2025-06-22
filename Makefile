REPO_ROOT := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
SERVICES := $(shell find services -maxdepth 1 -mindepth 1 -type d) # List all directories in services automatically

all: install build lint-fix

re: clean all

install:
	@for service in $(SERVICES); do \
		cd $$service && npm install; \
	done

build: install
	@for service in $(SERVICES); do \
		cd $$service && npm run build; \
	done
	cd $(REPO_ROOT)services/web-server && npm run build:frontend

lint:
	@for service in $(SERVICES); do \
		cd $$service && npm run lint; \
	done

lint-fix:
	@for service in $(SERVICES); do \
		cd $$service && npm run lint:fix; \
	done

clean:
	find $(REPO_ROOT) . -type d -name "node_modules" -exec rm -rf {} +
	find $(REPO_ROOT) . -type d -name "dist" -exec rm -rf {} +
	rm -rf $(REPO_ROOT)services/web-server/public/*.js

docker-up:
	cd $(REPO_ROOT) & docker-compose up --build

.PHONY: all re docker-up clean build lint lint-fix

start-%:
	cd $(REPO_ROOT)services/$* && npm run start