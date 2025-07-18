#!/bin/bash

# Solana MCP Chat - Development Startup Script

echo "🚀 Starting Solana MCP Chat Application..."
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first: https://bun.sh/"
    exit 1
fi

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$MCP_PID" ]; then
        kill $MCP_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Start MCP HTTP Server
echo "🔧 Starting MCP HTTP Server on port 3001..."
cd mcp-server
bun run dev &
MCP_PID=$!
cd ..

# Wait a moment for the MCP server to start
sleep 3

# Check if MCP server is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ MCP Server is running"
else
    echo "❌ MCP Server failed to start"
    exit 1
fi

# Start Frontend
echo "🎨 Starting Frontend on port 3000..."
cd frontend
bun run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Both servers are starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 MCP Server: http://localhost:3001"
echo "❤️  Health Check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait 