import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const expressUrl = `${process.env.EXPRESS_API_URL || 'http://localhost:3333'}/${path}`;
  
  try {
    const response = await fetch(expressUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to Express:', error);
    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const expressUrl = `${process.env.EXPRESS_API_URL || 'http://localhost:3333'}/${path}`;
  
  try {
    const body = await request.json();
    const response = await fetch(expressUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to Express:', error);
    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
  }
}

