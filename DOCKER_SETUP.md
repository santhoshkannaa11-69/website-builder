# Docker Installation and Setup Guide

This guide will help you install Docker and fix common connection issues.

## Windows Installation

### Option 1: Docker Desktop (Recommended)
1. **Download Docker Desktop**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download Docker Desktop for Windows

2. **Install Docker Desktop**
   - Run the installer as Administrator
   - Follow the installation wizard
   - Restart your computer when prompted

3. **Start Docker Desktop**
   - Launch Docker Desktop from Start Menu
   - Wait for the Docker engine to start (green status)
   - Ensure WSL 2 integration is enabled

4. **Verify Installation**
   ```bash
   docker --version
   docker-compose --version
   docker run hello-world
   ```

### Option 2: WSL 2 + Docker Engine
1. **Enable WSL 2**
   ```powershell
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   wsl --set-default-version 2
   ```

2. **Install Ubuntu from Microsoft Store**
   - Open Microsoft Store
   - Search for "Ubuntu"
   - Install and set up Ubuntu

3. **Install Docker in WSL**
   ```bash
   # In Ubuntu terminal
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   ```

## Troubleshooting Docker Connection Issues

### Issue: "failed to connect to the docker API"

#### Solution 1: Start Docker Desktop
1. **Check Docker Desktop Status**
   - Open Docker Desktop
   - Look at the status indicator (should be green)
   - If red, click "Start" or "Restart"

2. **Restart Docker Service**
   ```powershell
   # As Administrator
   net stop com.docker.service
   net start com.docker.service
   ```

#### Solution 2: Check WSL 2 Integration
1. **Enable WSL 2 Integration in Docker Desktop**
   - Open Docker Desktop
   - Go to Settings > Resources > WSL Integration
   - Enable "WSL 2 Engine"
   - Enable your Linux distribution

#### Solution 3: Reset Docker Desktop
1. **Reset to Factory Defaults**
   - Open Docker Desktop
   - Go to Settings > Troubleshoot
   - Click "Reset to factory defaults"
   - Restart Docker Desktop

#### Solution 4: Check Docker Daemon
```powershell
# Check if Docker daemon is running
docker info

# If not running, start Docker Desktop
# Or run as Administrator:
sc start docker
```

### Issue: "The system cannot find the file specified"

#### Solution 1: Reinstall Docker Desktop
1. **Uninstall Docker Desktop**
   - Use "Add or remove programs"
   - Restart your computer

2. **Clean Installation**
   - Download fresh Docker Desktop installer
   - Run as Administrator
   - Follow installation steps

#### Solution 2: Check Docker Socket
```bash
# Check Docker socket (Linux/WSL)
ls -la /var/run/docker.sock

# If missing, restart Docker daemon
sudo systemctl restart docker
```

## Common Docker Commands

### Basic Commands
```bash
# Check Docker status
docker --version
docker-compose --version
docker info

# Test Docker installation
docker run hello-world

# List running containers
docker ps

# List all containers
docker ps -a

# View logs
docker logs [container-name]
```

### Build and Run Commands
```bash
# Build Docker image
docker build -t website-builder-frontend ./client
docker build -t website-builder-backend ./server

# Run containers
docker run -p 80:80 website-builder-frontend
docker run -p 3000:3000 website-builder-backend

# Use docker-compose
docker-compose up
docker-compose up -d
docker-compose down
```

## Environment Setup

### 1. Set Up Environment Variables
```bash
# Copy environment template
cp .env.docker .env

# Edit environment file (Windows)
notepad .env

# Alternative editors for Windows:
# - VS Code: code .env
# - Notepad++: notepad++ .env
# - PowerShell ISE: ise .env
```

### 2. Required Environment Variables
```bash
# AI API Key (required for website generation)
AI_API_KEY=your-openai-api-key-here

# Authentication Secret (generate random string)
BETTER_AUTH_SECRET=your-secret-key-here

# Database Password
DB_PASSWORD=postgres123

# Frontend URL
VITE_BASEURL=http://localhost
```

### 3. Generate Authentication Secret
```bash
# Generate secure random string (PowerShell)
powershell -Command "Add-Type -AssemblyName System.Web; [System.Web.Security.Membership]::GeneratePassword(32,4)"

# Or use online generator
# https://www.random.org/strings/
```

## Testing the Setup

### 1. Test Docker Installation
```bash
docker run hello-world
```

### 2. Test Docker Compose
```bash
docker-compose config
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access Application
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Database: localhost:5432

## Performance Optimization

### 1. Docker Desktop Settings
- Open Docker Desktop Settings
- Go to Resources > Advanced
- Allocate at least 4GB RAM
- Allocate at least 2 CPU cores
- Enable "Use virtualization framework"

### 2. WSL 2 Configuration
```bash
# In WSL terminal
echo "[interop]" >> ~/.wslconfig
echo "enabled=true" >> ~/.wslconfig
echo "appendWindowsPath=false" >> ~/.wslconfig
```

## Security Considerations

### 1. Use Non-Root User
- Docker images are configured with non-root users
- Ensure proper file permissions

### 2. Environment Variables
- Never commit .env files to version control
- Use strong secrets for authentication
- Rotate API keys regularly

### 3. Network Security
- Use HTTPS in production
- Configure firewall rules
- Limit exposed ports

## Getting Help

### 1. Docker Documentation
- Official Docker docs: https://docs.docker.com/
- Docker Compose docs: https://docs.docker.com/compose/

### 2. Troubleshooting Commands
```bash
# Docker system info
docker system info
docker system df

# Clean up Docker
docker system prune -a

# Check Docker logs
docker logs docker-desktop
```

### 3. Common Issues and Solutions
- **Port conflicts**: Change ports in docker-compose.yml
- **Memory issues**: Increase Docker Desktop memory allocation
- **Permission errors**: Run Docker Desktop as Administrator
- **Network issues**: Reset Docker network settings

## Next Steps

Once Docker is properly installed and running:

1. **Configure environment variables**
2. **Run database migrations**
3. **Test the application**
4. **Deploy to production**

For detailed deployment instructions, see: `DOCKER_DEPLOYMENT.md`
