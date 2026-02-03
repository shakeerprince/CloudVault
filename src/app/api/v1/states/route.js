import { getStatesService, addStateService } from '@/app/services/states_service';
import { NextResponse } from 'next/server';
export async function GET(request) {
    try {
        const states = await getStatesService();
        return NextResponse.json(states, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch states' }, { status: 500 });
    }
}

export async function POST(request) {
    const stateData = await request.json();
    const newState = await addStateService(stateData);

    return NextResponse.json({ statusCode: "201", message: "State added successfully", data: newState }, { status: 201 });
}

export async function PUT(request) {
    return new Response("States API is under construction.", { status: 200 });
}

export async function DELETE(request) {
    return new Response("States API is under construction.", { status: 200 });
}