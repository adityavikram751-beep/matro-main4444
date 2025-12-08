import { NextResponse } from 'next/server';

export async function GET() {
  // Mock user data
  const user = {
    name: 'John Doe',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  };

  return NextResponse.json({ success: true, data: user });
}