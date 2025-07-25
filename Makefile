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
	find $(REPO_ROOT)services/web-server/public -type f -name "*.js" -exec rm -f {} +

docker-prune:
	docker system prune -f
	docker volume prune -f
	docker network prune -f
	docker image prune -f

docker-delete: docker-prune
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true

docker-up: docker-prune certs setup
	cd $(REPO_ROOT) && docker-compose up --build

generate-jwt:
	@openssl rand -base64 48

setup:
	@if [ ! -f services/auth/.env ]; then \
		echo "JWT_SECRET=$$(openssl rand -base64 48)" > services/auth/.env; \
		echo "Created services/auth/.env with a random JWT_SECRET"; \
	else \
		echo "services/auth/.env already exists, skipping."; \
	fi

certs:
	mkdir -p services/web-server/certs
	@if [ ! -f services/web-server/certs/key.pem ]; then \
		openssl req -x509 -newkey rsa:4096 -keyout services/web-server/certs/key.pem -out services/web-server/certs/cert.pem -days 365 -nodes -subj "/CN=127.0.0.1"; \
        echo "Created new certs in services/web-server/certs"; \
    else \
        echo "Certs already exist in services/web-server/certs, skipping."; \
	fi
	
.PHONY: all re docker-up docker-prune clean build lint lint-fix certs docker-delete generate-jwt setup