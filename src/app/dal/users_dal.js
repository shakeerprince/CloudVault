import { prisma } from '@/lib/prisma';


export const addUser = async (userData) => {
    const newUser = await prisma.user.create({
        data: userData
    });
    return newUser;
};

export const getUserByUsername = async (username) => {
    const user = await prisma.user.findUnique({
        where: { username }
    });
    return user;
};