import { addUser, getUserByUsername } from "../dal/users_dal";
import { NextResponse } from "next/server";

export const addUserService = async (userData) => {
    try {
        const user = await getUserByUsername(userData.username);
        if (user) {
            return NextResponse.json({ message: "Username already exists" }, { status: 400 });
        }
        if (userData.role_id !== 'ADMIN') {
            return NextResponse.json({ message: "Only ADMIN role can be assigned" }, { status: 400 });
        }


        const newUser = await addUser(userData);
        return newUser;
    } catch (error) {
        throw new Error("Error adding user: " + error.message);
    }
};