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

The PR will not be able to merged if linter rules are failing. For this reason run these commands before you create the PR.

- npm run lint -> check for linter errors
- npm run lint:fix -> will fix automatically linter errors
- npm run format -> check for format errors
- npm run format:fix -> will fix automatically format errors

### Build & Run

In project root execute the following.
In order to run the app without docker:

- npm install -> installs all dependencies from package.json for all the services (updates the package-lock.json and node_modules)
- npm run build -> compile all files from all services(creates .js files from .ts files at dist/ folders)
- node path_to_js/dist/name_of_file.js -> will run the executable

In order to run the app through docker

- docker-compose up --build -> will automatically start api-gateway service and everything else we already set up

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
