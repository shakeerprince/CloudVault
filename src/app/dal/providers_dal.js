import prisma from '../../lib/prisma';

export const addProviderWithUser = async (providerData) => {
    const { hashedPassword, password, ...providerInfo } = providerData;

    // Use transaction to create both user and provider
    const result = await prisma.$transaction(async (tx) => {
        // Create user record
        const user = await tx.users.create({
            data: {
                name: providerInfo.name,
                username: providerInfo.email,
                password: hashedPassword,
                role: 'MECHANIC',
                is_active: true
            }
        });

        // Create provider record
        const provider = await tx.providers.create({
            data: {
                user_id: user.id,
                name: providerInfo.name,
                email: providerInfo.email,
                phone: providerInfo.phone,
                address: providerInfo.address,
                state_id: providerInfo.state_id,
                city_id: providerInfo.city_id,
                service_distance: providerInfo.service_distance,
                latitude: providerInfo.latitude,
                longitude: providerInfo.longitude
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        role: true,
                        is_active: true
                    }
                },
                state: true,
                city: true
            }
        });

        return provider;
    });

    return result;
};

export const getAllProviders = async (skip, take) => {
    const providers = await prisma.providers.findMany({
        skip,
        take,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                    is_active: true
                }
            },
            state: true,
            city: true
        }
    });
    return providers;
};

export const getProviderByEmail = async (email) => {
    const provider = await prisma.providers.findUnique({
        where: { email },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                    is_active: true
                }
            },
            state: true,
            city: true
        }
    });
    return provider;
};

export const getProviderById = async (id) => {
    const provider = await prisma.providers.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                    is_active: true
                }
            },
            state: true,
            city: true
        }
    });
    return provider;
};

export const updateProviderDal = async (providerId, providerData) => {
    const updatedProvider = await prisma.providers.update({
        where: { id: providerId },
        data: providerData
    });
    return updatedProvider;
};

export const deleteProviderDal = async (providerId) => {
    const deletedProvider = await prisma.providers.delete({
        where: { id: providerId }
    });
    return deletedProvider;
};
