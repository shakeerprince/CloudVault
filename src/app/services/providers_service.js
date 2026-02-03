import { addProviderWithUser, getAllProviders, getProviderByEmail } from '../dal/providers_dal';
import { getUserByUsername } from '../dal/users_dal';
import bcrypt from 'bcryptjs';

export const addProviderService = async (providerData) => {
    try {
        // Check if provider already exists
        const existingProvider = await getProviderByEmail(providerData.email);
        if (existingProvider) {
            throw new Error('Provider with this email already exists');
        }

        // Check if username already exists
        const existingUser = await getUserByUsername(providerData.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(providerData.password, 10);

        // Create both user and provider records
        const res = await addProviderWithUser({
            ...providerData,
            hashedPassword
        });

        return res;
    } catch (error) {
        console.error("Error adding provider:", error);
        throw error;
    }
};

export const getProvidersService = async () => {
    try {
        const providers = await getAllProviders();
        return providers;
    } catch (error) {
        console.error("Error fetching providers:", error);
        throw error;
    }
};
