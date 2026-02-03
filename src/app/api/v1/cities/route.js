import { getCitiesService, addCityService, getCitiesByStateService } from "@/app/services/cities_service";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const stateId = searchParams.get('state_id');

        let cities;
        if (stateId) {
            cities = await getCitiesByStateService(stateId);
        } else {
            cities = await getCitiesService();
        }

        return NextResponse.json({ data: cities, statusCode: "200", message: "Cities fetched successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch cities' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cityData = await request.json();
        const newCity = await addCityService(cityData);
        return NextResponse.json({ data: newCity, statusCode: "201", message: "City added successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to add city' }, { status: 500 });
    }
}