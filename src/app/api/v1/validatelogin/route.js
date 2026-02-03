import { NextResponse } from "next/server";
import { validateLogin } from "@/app/services/users_service";

// export async function GET(request) {
//     return NextResponse.json({ statusCode: "200", message: "Login validation endpoint is active" }, { status: 200 });
// }

export async function POST(request) {
    try {
        const loginData = await request.json();
        const { email, password } = loginData;

        // Simple validation
        if (!email || !password) {
            return NextResponse.json({ statusCode: "400", message: "Email and password are required" }, { status: 400 });
        }

        const validationResponse = await validateLogin(email, password);
        if (validationResponse.statusCode === "200") {
            return NextResponse.json(validationResponse, { status: 200 });
        } else {
            return NextResponse.json(validationResponse, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ statusCode: "500", message: "Internal server error" }, { status: 500 });
    }
}