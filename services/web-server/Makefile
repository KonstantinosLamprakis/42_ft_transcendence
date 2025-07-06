
all: install build lint-fix start

re: clean all

install:
	npm install

build: install
	npm run build

lint:
	npm run lint;

lint-fix:
	npm run lint:fix; 
	
clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf *.js 
	rm -rf *.d.ts 
	rm -rf *.tsbuildinfo
	find ./public -name "*.js" -type f -delete
	rm -rf ./public/styles.css

start:
	npm run start

.PHONY: all re clean build lint lint-fix start