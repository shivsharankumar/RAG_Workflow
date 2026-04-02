# run:
# 	docker-compose up --build

# run-detached:
# 	docker-compose up --build -d

# stop:
# 	docker-compose down

# logs:
# 	docker-compose logs -f

# logs-api:
# 	docker-compose logs -f api

# logs-frontend:
# 	docker-compose logs -f frontend

# clean:
# 	docker-compose down -v --rmi local

# restart:
# 	docker-compose down
# 	docker-compose up --build -d
run-docker-compose:
	uv sync
	docker-compose up --build