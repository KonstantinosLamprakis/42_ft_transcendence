# Team Guidelines

## Git Guidelines

### 1. Writing Good Commit Messages

- **Use the imperative mood**: E.g., "Add login endpoint" instead of "Added" or "Adding".
- **Be consistent**: start with one initial capital letter and all others lowercase. Add the path as prefix of the place you worked.

**Example:**
"src/ai_opponent/cnf: Add config file for ai opponent"

### 2. Branching and Merging Policy

- **Do NOT commit directly to the `main` branch.** GitHub now allows direct commits anyway.
- All changes must go through a **Pull Request (PR)**.
- Every PR must be **reviewed and approved by another team member** before merging.
- main branch should be **always** in good and clean state, ready to run with no problems. Don't merge half-implemented code which isn't working or with bugs.

### 3. Keeping a Clean Git History

- **Always use `git rebase` instead of `git merge`** when updating your feature branch with the latest changes from `main`. This keeps the commit history linear and clean.
- Before opening a PR, rebase your branch onto the latest `main`:

### 4. Branch Naming Convention

- **One branch per feature**
- Name your branch as: `<initials>/<feature_name>`
- Example: `KL/ai_opponent` (for Konstantinos Lamprakis working on AI opponent)

---

## Project Info

- we don't push any code we don't understand how it works. That also includes file and packages we use.
- consider using tests / pipelines / stages(dev/prod) / swagger(or other documentation tools / linter)
- use doxygen to create documentation for your functions

---

## Code Conventions

- Node.js Naming Conventions
  - files: use kebab-case e.g. user-controller.js
  - test files(if exist): _.test.js or _.spec.js
  - functions/variables/modules: use camelCase e.g. function getUserById(id) {}
  - classes(if exist): use PascalCase e.g. class UserService {}
  - env variables / const / enums: use upper snake case e.g. const MAX_ID = 10;
- try to use constants / enums and avoid hardcoding many times same values
- try to avoid comments if possible and instead use descriptive variables names etc. as replacement to comments
- Add TODOs to not forget to implement things. As suffix add your initials so it will be clear for each TODO who is the owner of it.
  e.g. TODO(KL) Handle the edge case division by zero

---

## Useful Commands

### Lint Rules

- npm run lint -> check for linter errors
- npm run lint:fix -> will fix automatically linter errors
- npm run format -> check for format errors
- npm run format:fix -> will fix automatically format errors

### Docker

- docker ps : list containers so you can get e.g. their id
- docker ps -a : list all containers (including stopped)
- docker start/stop/restart/rm <container_name_or_id>
- docker exec -it <container_name_or_id> sh/bash : open shell / bash on a container
- docker logs <container_name_or_id> : display all logs so far
- docker logs -f <container_name_or_id> : display live logs
- docker images
- docker rmi <image_name_or_id>
- docker container prune
- docker system prune: remove all unused images, containers, networks, volumes
- docker-compose up
- docker-compose down

### Howtos

- how to read from .env: see api-rest-gateway, we do the same here.
- how to user **dirname from ESM(**dirname only works at commonJs): see api-rest-gateway
- how to solve error: package x doesn't have exported members(pkg is on commonJs while you are using ESM): instead of `import a from b` you should write `import * as a from b`
- how to use an endpoint to frontend: First you need to expose is at api-rest-gateway, similar to others.Then to add it on frontend is a bit complex as we have SPA so better ask your team.
- how to access your service both locally and from docker: make sure you have `astify.listen({ port: 5000, host:"0.0.0.0" }` instad of only `astify.listen({ port: 5000 }`, this way will listen to all hosts instead of only localhost.
- how to connect to sqlite-db in docker container and run queries:
  - docker ps 
  - docker exec -it docker_id_here sh
  - apk add --no-cache sqlite 
  - sqlite3 /data/database.db
- how to call API calls from terminal using `curl` to quickly test endpoints: (these are just examples)
    `curl -X POST https://localhost:3000/add-user \
    -H "Content-Type: application/json" \
    -d '{"name": "Alice"}' -k`: create a new user

    `curl https://localhost:3000/list-users -k `: no URL parameters

    `curl https://localhost:3000/get-user/1 -k` : `1` is a URL parameter

    `curl -X POST http://localhost:3000/update-score \
    -H "Content-Type: application/json" \
    -d '{"userId": 1, "score": 42}' -k`: modify an existed user

    `curl -X DELETE https://localhost:3000/delete-user/1 -k` : delete user `1`

### Build & Run

#### Localy

- you need to use **node 20** (check with `node -v` and install it with `nvm install v20` and `nvm use v20`). I would suggest to uninstall old versions as many times they are the default and cause problems.
- go to **your service's folder** folder and run `make re`. This will automatically delete old files(dist, node_modules), and automatically runs npm install, npm run build and npm run
- **for the frontend:** in another terminal go to **services/web-server** and run: `sudo make re`. You need sudo because it runs at ports 80(http) and 443(https) and linux needs admin rights for that. Then create certs for encryption(just run `make certs` in projects root). This will create certs folder both for api-rest-gateway and web-server services.
- If your service depends on **api-rest-gateway** you need also to go at services/api-rest-gateway, **create an .env file**(use the .env_example). Then run `make re`.
- run any other service that your service depends on, by going at service's folder and run make re. Be careful some services require a .env file. This services should have a .env_example so can just use take this as a point of reference.
- when you finish please run `sudo make clean` at root folder to automatically clean all services (you need sudo to clean web-server as it creates some files as admin).

#### In Docker

- at project's root optionally run `sudo make clean` to clean all services in case you run it localy before (you need sudo to clean web-server as it creates some files as admin).
- run `make docker-up`
  - FYI: there is `make docker-prune` command to clean docker old prune data which can cause various problems but you don't need to run it manually as it runs automatically with `make docker-up`
  - FYI: this command will automatically create certificates for https/wss and also the necessary .env files for the docker to work
- if you want to delete to volume and basically start with fresh db you need to run the command make `docker-delete` and the `make docker-up`
