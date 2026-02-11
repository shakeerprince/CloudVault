import { NextResponse } from "next/server";
import { getProviderByEmailService } from "@/app/services/providers_service";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('email');
    if (!providerId) {
        return NextResponse.json({ statusCode: "400", message: "Provider email is required" }, { status: 400 });
    }
    const provider = await getProviderByEmailService(providerId);
    if (!provider) {
        return NextResponse.json({ statusCode: "404", message: "Provider not found" }, { status: 404 });
    }
    return NextResponse.json({ statusCode: "200", message: "Provider details fetched successfully", data: provider }, { status: 200 });
}