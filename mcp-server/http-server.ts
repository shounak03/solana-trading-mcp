import { getSimpleChatService } from './simple-chat-service.js';

const chatService = getSimpleChatService();

const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    // Handle CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers });
    }

    // Handle chat endpoint
    if (req.method === 'POST' && new URL(req.url).pathname === '/chat') {
      try {
        const body = await req.json();
        const { message } = body;

        if (!message) {
          return new Response(
            JSON.stringify({ error: 'Message is required' }),
            { status: 400, headers }
          );
        }

        const response = await chatService.processMessage(message);
        
        return new Response(
          JSON.stringify(response),
          { status: 200, headers }
        );
      } catch (error) {
        console.error('Server error:', error);
        return new Response(
          JSON.stringify({
            content: 'Internal server error',
            error: error instanceof Error ? error.message : String(error)
          }),
          { status: 500, headers }
        );
      }
    }

    // Handle health check
    if (req.method === 'GET' && new URL(req.url).pathname === '/health') {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'MCP Chat Server is running' }),
        { status: 200, headers }
      );
    }

    // 404 for other routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers }
    );
  },
});

console.log(`🚀 MCP Chat Server is running on http://localhost:${server.port}`);
console.log(`Health check: http://localhost:${server.port}/health`);
console.log(`Chat endpoint: http://localhost:${server.port}/chat`); 