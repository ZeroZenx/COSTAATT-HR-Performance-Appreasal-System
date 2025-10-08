.PHONY: dev build test test:e2e lint format clean seed docker:up docker:down docker:logs

# Development
dev:
	docker-compose up -d
	@echo "🚀 Development environment started!"
	@echo "📊 API: http://localhost:3000"
	@echo "🌐 Web: http://localhost:5173"
	@echo "🗄️  MinIO Console: http://localhost:9002"
	@echo "📧 MailHog: http://localhost:8025"

# Build all services
build:
	docker-compose build

# Run tests
test:
	npm run test

# Run e2e tests
test:e2e:
	npm run test:e2e

# Lint code
lint:
	npm run lint

# Format code
format:
	npm run format

# Clean up
clean:
	docker-compose down -v
	docker system prune -f

# Seed database
seed:
	docker-compose exec api npm run db:seed

# Docker commands
docker:up:
	docker-compose up -d

docker:down:
	docker-compose down

docker:logs:
	docker-compose logs -f

# Database commands
db:migrate:
	docker-compose exec api npm run db:migrate

db:generate:
	docker-compose exec api npm run db:generate

# Full setup
setup: docker:up
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "🗄️  Running database migrations..."
	@make db:migrate
	@echo "🌱 Seeding database..."
	@make seed
	@echo "✅ Setup complete! Visit http://localhost:5173"

