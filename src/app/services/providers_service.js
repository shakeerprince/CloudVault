import * as providersDal from '@/app/dal/providers_dal';
import bcrypt from 'bcryptjs';
import { generateOTP } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/email';

export const addProviderService = async (providerData) => {
    const existingProvider = await providersDal.getProviderByEmail(providerData.email);
    if (existingProvider) {
        return { message: "Provider with this email already exists", statusCode: "202" };
    }

    // Generate OTP
    const otp = generateOTP();

    // Hash password
    const hashedPassword = await bcrypt.hash(providerData.password, 10);

    const userData = {
        name: providerData.name,
        username: providerData.email,
        password: hashedPassword,
    };

    const newProviderData = {
        ...providerData,
        otp,
    };

    // Create provider with user
    const provider = await providersDal.addProviderWithUser(newProviderData, userData);

    // Send OTP email
    const emailResult = await sendOTPEmail({
        email: provider.email,
        name: provider.name,
        otp,
    });

    if (!emailResult.success) {
        return { message: "Failed to send OTP email", statusCode: "500" };
        console.error('Failed to send OTP email:', emailResult.error);
        // You might want to delete the provider here or handle this differently
    }

    // Remove sensitive data from response
    const { user, ...providerWithoutUser } = provider;
    return {
        ...providerWithoutUser,
        message: "Provider registered successfully. Please check your email for OTP verification.",
        statusCode: "201",
        data: {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            is_active: user.is_active,
            emailSent: emailResult.success,
        },

    };
};

export const getProvidersService = async () => {
    return await providersDal.getAllProviders();
};

export const getProviderService = async (id) => {
    return await providersDal.getProviderById(id);
};

export const verifyOTPService = async (email, otp) => {
    return await providersDal.verifyProviderOTP(email, otp);
};