.PHONY: help build up start down destroy stop restart logs logs-server ps login-server login-mongodb gen-cert
help:
	@fgrep -h "## " ${MAKEFILE_LIST} | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/## //'
build: ## Builds a Docker image from a Docker-compose file. It is possible to specify the names of specific services in the options
	@docker compose -p nest_template -f docker-compose.dev.yml build ${c}
up: ## Builds, (re)creates, starts the containers in the background and leaves them running. It is possible to specify the names of specific services in the options
	@docker compose -p nest_template -f docker-compose.dev.yml up -d ${c}
start: ## Starts existing containers for a service. It is possible to specify the names of specific services in the options
	@docker compose -p nest_template -f docker-compose.dev.yml start ${c}
stop: ## Stops running containers without removing them. They can be started again with `make start`. It is possible to specify the names of specific services in the options
	@docker compose -p nest_template -f docker-compose.dev.yml stop ${c}
down: ## Stops containers and removes containers, networks, volumes, and images created by up. It is possible to specify the names of specific services in the options
	@docker compose -p nest_template -f docker-compose.dev.yml down ${c}
destroy: ## Stops containers and removes containers, networks, volumes, and images created by up and remove named volumes declared in the `volumes` section of the Compose file and anonymous volumes attached to containers. It is possible to specify the names of specific services in the options
	@docker compose -p nest_template -f docker-compose.dev.yml down -v ${c}
restart: ## Restarts all stopped and running services. It is possible to specify the names of specific services in the options
	@docker compose -p nest_template -f docker-compose.dev.yml stop ${c}
	@docker compose -p nest_template -f docker-compose.dev.yml up -d ${c}
rebuild: ## Restarts all stopped and running services. It is possible to specify the names of specific services in the options
	@docker compose -p nest_template -f docker-compose.dev.yml down -v ${c}
	@docker compose -p nest_template -f docker-compose.dev.yml up --build -d ${c}
logs: ## Displays log output from services. It is possible to specify the names of specific services in the options
	@docker compose -p nest_template -f docker-compose.dev.yml logs --tail=100 -f ${c}
n ?= Migration
migration-generate: ## Generate migration
	@docker compose -p nest_template -f docker-compose.dev.yml exec -u node -it server npm run typeorm migration:generate src/migrations/${n}
migration-up: ## Run migration:up
	@docker compose -p nest_template -f docker-compose.dev.yml exec -u node -it server npm run migration:up
migration-down: ## Run migration:down
	@docker compose -p nest_template -f docker-compose.dev.yml exec -u node -it server npm run migration:down
ps: ## Lists containers.
	@docker compose -p nest_template -f docker-compose.dev.yml ps
