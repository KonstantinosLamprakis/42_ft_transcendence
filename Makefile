REPO_ROOT := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
SERVICES := $(shell find services -maxdepth 1 -mindepth 1 -type d) # List all directories in services automatically

all: install build lint-fix certs

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

docker-up: certs
	cd $(REPO_ROOT) & docker-compose up --build

certs:
	mkdir -p shared-certs
	@if [ ! -f shared-certs/key.pem ]; then \
		openssl req -x509 -newkey rsa:4096 -keyout shared-certs/key.pem -out shared-certs/cert.pem -days 365 -nodes -subj "/CN=localhost"; \
		rm -rf $(REPO_ROOT)services/api-rest-gateway/certs; \
		rm -rf $(REPO_ROOT)services/web-server/certs; \
	fi
	mkdir -p services/api-rest-gateway/certs
	mkdir -p services/web-server/certs
	cp shared-certs/key.pem services/api-rest-gateway/certs/key.pem
	cp shared-certs/cert.pem services/api-rest-gateway/certs/cert.pem
	cp shared-certs/key.pem services/web-server/certs/key.pem
	cp shared-certs/cert.pem services/web-server/certs/cert.pem
	
start-%:
	cd $(REPO_ROOT)services/$* && npm run start

.PHONY: all re docker-up clean build lint lint-fix certs
