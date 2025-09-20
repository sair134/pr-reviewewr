import dbConnect from '@/lib/mongodb';
import License from '@/models/License';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const planName = searchParams.get('planName');
        
        if (!userId || !planName) {
            return new Response(JSON.stringify({ error: 'userId and planName are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        
        // Check if user has an active license for this plan
        const existingLicense = await License.findOne({
            UserId: userId,
            planName: planName,
            expiresAt: { $gt: new Date() } // Only active licenses
        });
        
        return new Response(JSON.stringify({ 
            hasLicense: !!existingLicense,
            license: existingLicense 
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error checking license:', error);
        return new Response(JSON.stringify({ error: 'Failed to check license' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function POST(req: Request) {
try {
    await dbConnect();
    const {UserId, PlanName} = await req.json();
    if (!UserId || !PlanName) {
        return new Response(JSON.stringify({ error: 'UserId and PlanName are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const createdAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const license = await License.create({UserId, planName: PlanName, createdAt, expiresAt});
    return new Response(JSON.stringify(license), { status: 200, headers: { 'Content-Type': 'application/json' } });
} catch (error) {
    console.error('Error creating license:', error);
    return new Response(JSON.stringify({ error: 'Failed to create license' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
}
}