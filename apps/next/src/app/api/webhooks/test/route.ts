import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Repository from '@/models/Repository';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const repositories = await Repository.find({});
    
    return NextResponse.json({
      success: true,
      message: 'Webhook system is working',
      repositories: repositories.map(repo => ({
        id: repo._id,
        name: repo.name,
        fullName: repo.fullName,
        provider: repo.provider,
        webhookId: repo.webhookId,
        isActive: repo.isActive,
        createdAt: repo.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error testing webhook system:', error);
    return NextResponse.json(
      { error: 'Failed to test webhook system' },
      { status: 500 }
    );
  }
}
