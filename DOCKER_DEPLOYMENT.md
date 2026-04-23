# Docker Deployment Guide

This guide will help you deploy the Website Builder application using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- OpenAI API key for AI functionality
- Stripe API keys for payment processing (optional)

## Quick Start

1. **Clone the repository and navigate to the project directory**
   ```bash
   git clone <repository-url>
   cd website-builder
   ```

2. **Copy the environment file and configure it**
   ```bash
   cp .env.docker .env
   ```

3. **Edit the .env file with your configuration**
   ```bash
   nano .env
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   docker-compose --profile migrate up migrate
   ```

6. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000

## Environment Variables

### Required Variables
- `AI_API_KEY`: Your OpenAI API key for AI website generation
- `BETTER_AUTH_SECRET`: A secret key for authentication (generate a random string)

### Optional Variables
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `DB_PASSWORD`: PostgreSQL database password (default: postgres123)
- `REDIS_PASSWORD`: Redis password (default: redis123)

## Services

### Frontend (Nginx + React)
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Technology**: React, Vite, Tailwind CSS
- **Features**: SPA routing, API proxy, static asset serving

### Backend (Node.js + Express)
- **Port**: 3000
- **Technology**: TypeScript, Express, Prisma
- **Features**: REST API, authentication, AI integration

### Database (PostgreSQL)
- **Port**: 5432
- **Version**: 15
- **Features**: Persistent data storage, migrations

### Cache (Redis)
- **Port**: 6379
- **Version**: 7
- **Features**: Session storage, caching (optional)

## Development vs Production

### Development
```bash
# Use development environment
cp .env.docker .env.development
# Edit .env.development with development settings
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production
```bash
# Use production environment
cp .env.docker .env.production
# Edit .env.production with production settings
docker-compose up -d
```

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Update Services
```bash
docker-compose pull
docker-compose up -d --force-recreate
```

### Database Management
```bash
# Run migrations
docker-compose --profile migrate up migrate

# Access database
docker-compose exec postgres psql -U postgres -d website_builder

# Reset database
docker-compose down -v
docker-compose up -d
```

## Health Checks

All services include health checks:
- **Frontend**: HTTP GET to /
- **Backend**: HTTP GET to /
- **Database**: PostgreSQL connection test
- **Redis**: Redis ping test

Check service health:
```bash
docker-compose ps
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Change ports in docker-compose.yml
   - Stop other services using the same ports

2. **Permission errors**
   - Ensure Docker has proper permissions
   - Run with sudo if necessary (Linux)

3. **Database connection issues**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL service is healthy

4. **Build failures**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild: `docker-compose build --no-cache`

### Logs and Debugging

```bash
# View detailed logs
docker-compose logs -f --tail=100 backend

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Check resource usage
docker stats
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Scale frontend services
docker-compose up -d --scale frontend=2
```

### Load Balancing
For production deployments, consider:
- Nginx load balancer
- Kubernetes deployment
- Docker Swarm mode

## Security Considerations

1. **Change default passwords** in production
2. **Use HTTPS** with SSL certificates
3. **Restrict network access** with firewall rules
4. **Regular updates** of base images
5. **Secret management** with Docker secrets or external vault

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres website_builder > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres website_builder < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v website-builder_postgres_data:/data -v $(pwd):/backup ubuntu tar cvf /backup/postgres_backup.tar /data
```

## Monitoring

### Basic Monitoring
```bash
# Resource usage
docker stats

# Service status
docker-compose ps
```

### Advanced Monitoring
Consider integrating with:
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Docker health checks and alerts

## Production Deployment

For production deployment:

1. **Use environment-specific configurations**
2. **Implement proper SSL/TLS**
3. **Set up monitoring and alerting**
4. **Configure backup strategies**
5. **Use secrets management**
6. **Implement CI/CD pipeline**

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all services are healthy
4. Check resource availability
