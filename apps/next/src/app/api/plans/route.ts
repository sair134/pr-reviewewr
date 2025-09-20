import dbConnect from '@/lib/mongodb';
import Plans from '@/models/Plans';

export async function GET() {
    try {
        await dbConnect();
        const plans = await Plans.find().lean();
        console.log('Fetched plans:', JSON.stringify(plans, null, 2));
        return new Response(JSON.stringify(plans), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error fetching plans:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch plans' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
