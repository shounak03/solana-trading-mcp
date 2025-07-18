import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  content: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message }: ChatRequest = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Call the MCP server
    const mcpResponse = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!mcpResponse.ok) {
      throw new Error(`MCP server responded with status: ${mcpResponse.status}`);
    }

    const result: ChatResponse = await mcpResponse.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        content: 'Sorry, I encountered an error processing your request. Make sure the MCP server is running.',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 