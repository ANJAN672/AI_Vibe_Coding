# AI Vibe Coding Platform Startup Script
Write-Host "🚀 Starting AI Vibe Coding Platform..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check environment file
if (!(Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local file not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "📝 Please edit .env.local with your API keys" -ForegroundColor Yellow
}

# Start the development server
Write-Host "🌟 Starting development server..." -ForegroundColor Green
Write-Host "📱 Platform will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow

npm run dev