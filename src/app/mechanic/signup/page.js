'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import Link from 'next/link';

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px'
};

const defaultCenter = {
    lat: 17.392615694580563,
    lng: 78.39538151750536
};

export default function MechanicSignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        state_id: '',
        city_id: '',
        service_distance: 10,
        latitude: 17.392615694580563,
        longitude: 78.39538151750536
    });
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showMapDialog, setShowMapDialog] = useState(false);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState(defaultCenter);

    const toast = useRef(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    useEffect(() => {
        // Fetch states on component mount
        fetchStates();
    }, []);

    useEffect(() => {
        // Fetch cities when state changes
        if (formData.state_id) {
            fetchCities(formData.state_id);
        } else {
            setCities([]);
            setFormData(prev => ({ ...prev, city_id: '' }));
        }
    }, [formData.state_id]);

    const fetchStates = async () => {
        try {
            const response = await fetch('/api/v1/states');
            if (response.ok) {
                const data = await response.json();
                setStates(data.map(state => ({ label: state.name, value: state.id })));
            } else {
                console.error('Failed to fetch states');
            }
        } catch (err) {
            console.error('Error fetching states:', err);
        }
    };

    const fetchCities = async (stateId) => {
        try {
            const response = await fetch(`/api/v1/cities?state_id=${stateId}`);
            if (response.ok) {
                const result = await response.json();
                setCities(result.data.map(city => ({ label: city.name, value: city.id })));
            } else {
                console.error('Failed to fetch cities');
                setCities([]);
            }
        } catch (err) {
            console.error('Error fetching cities:', err);
            setCities([]);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMapClick = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });
    }, []);

    const handleOpenMap = () => {
        setMapCenter({
            lat: formData.latitude,
            lng: formData.longitude
        });
        setMarkerPosition({
            lat: formData.latitude,
            lng: formData.longitude
        });
        setShowMapDialog(true);
    };

    const handleConfirmLocation = () => {
        setFormData(prev => ({
            ...prev,
            latitude: markerPosition.lat,
            longitude: markerPosition.lng
        }));
        setShowMapDialog(false);
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMapCenter({ lat, lng });
                    setMarkerPosition({ lat, lng });
                    alert('Current location selected on the map: ' + lat + ', ' + lng);
                    console.log('Current location:', lat, lng);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setError('Unable to get your current location');
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Passwords do not match' });
            return;
        }

        if (formData.password.length < 8) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Password must be at least 8 characters long' });
            return;
        }

        if (!formData.address || formData.address.trim() === '') {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Address is required' });
            return;
        }

        if (!formData.state_id) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please select a state' });
            return;
        }

        if (!formData.city_id) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please select a city' });
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please select your location on the map' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/v1/providers/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    address: formData.address,
                    state_id: formData.state_id,
                    city_id: formData.city_id,
                    service_distance: Number(formData.service_distance),
                    latitude: Number(formData.latitude),
                    longitude: Number(formData.longitude)
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Registration successful! Redirecting to login...' });
                setTimeout(() => {
                    router.push('/mechanic/verify-otp?email=' + encodeURIComponent(formData.email) + '&name=' + encodeURIComponent(formData.name));
                }, 2000);
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: result.message || 'Registration failed. Please try again.' });
            }
        } catch (err) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    }


    const passwordHeader = <div className="font-bold mb-3">Pick a password</div>;
    const passwordFooter = (
        <>
            <Divider />
            <p className="mt-2 text-sm">Suggestions</p>
            <ul className="pl-2 ml-2 mt-0 text-sm" style={{ lineHeight: '1.5' }}>
                <li>At least one lowercase</li>
                <li>At least one uppercase</li>
                <li>At least one numeric</li>
                <li>Minimum 8 characters</li>
            </ul>
        </>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <Toast ref={toast} />
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                        <i className="pi pi-user-plus text-4xl text-white"></i>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Mechanic Registration
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Join our network of professional mechanics
                    </p>
                </div>

                {/* Signup Card */}
                <Card className="shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* {error && <Message severity="error" text={error} className="w-full" />}
                        {success && <Message severity="success" text={success} className="w-full" />} */}

                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="name" className="font-semibold text-gray-700 dark:text-gray-300">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <InputText
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="John Doe"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-300">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <InputText
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="phone" className="font-semibold text-gray-700 dark:text-gray-300">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <InputText
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+1 234 567 8900"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="service_distance" className="font-semibold text-gray-700 dark:text-gray-300">
                                        Service Distance (km) <span className="text-red-500">*</span>
                                    </label>
                                    <InputNumber
                                        id="service_distance"
                                        value={formData.service_distance}
                                        onValueChange={(e) => handleChange('service_distance', e.value)}
                                        mode="decimal"
                                        min={1}
                                        max={100}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                                Location Information
                            </h3>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="address" className="font-semibold text-gray-700 dark:text-gray-300">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <InputText
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="Enter your complete address"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex flex-col gap-2">

                                <label className="font-semibold text-gray-700 dark:text-gray-300">
                                    Location Coordinates <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <InputNumber
                                        id="latitude"
                                        value={formData.latitude}
                                        onValueChange={(e) => handleChange('latitude', e.value)}
                                        mode="decimal"
                                        minFractionDigits={4}
                                        maxFractionDigits={6}
                                        disabled={loading}
                                        placeholder="Latitude"
                                        className="flex-1"
                                    />
                                    <InputNumber
                                        id="longitude"
                                        value={formData.longitude}
                                        onValueChange={(e) => handleChange('longitude', e.value)}
                                        mode="decimal"
                                        minFractionDigits={4}
                                        maxFractionDigits={6}
                                        disabled={loading}
                                        placeholder="Longitude"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        icon="pi pi-map-marker"
                                        label="Select on Map"
                                        onClick={handleOpenMap}
                                        className="p-button-outlined"
                                        disabled={loading}
                                    />
                                </div>
                                <small className="text-gray-500 dark:text-gray-400">
                                    Click "Select on Map" to choose your exact location
                                </small>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="state" className="font-semibold text-gray-700 dark:text-gray-300">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <Dropdown
                                    id="state"
                                    value={formData.state_id}
                                    onChange={(e) => handleChange('state_id', e.value)}
                                    options={states}
                                    placeholder="Select a State"
                                    required
                                    disabled={loading}
                                    filter
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="city" className="font-semibold text-gray-700 dark:text-gray-300">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <Dropdown
                                    id="city"
                                    value={formData.city_id}
                                    onChange={(e) => handleChange('city_id', e.value)}
                                    options={cities}
                                    placeholder="Select a City"
                                    required
                                    disabled={loading || !formData.state_id}
                                    filter
                                />
                            </div>


                        </div>


                        {/* Security Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                                Security
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-300">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <Password
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="Enter password"
                                        toggleMask
                                        header={passwordHeader}
                                        footer={passwordFooter}
                                        className="w-full"
                                        inputClassName="w-full"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="confirmPassword" className="font-semibold text-gray-700 dark:text-gray-300">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <Password
                                        id="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        placeholder="Confirm password"
                                        toggleMask
                                        feedback={false}
                                        className="w-full"
                                        inputClassName="w-full"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            label={loading ? 'Registering...' : 'Create Account'}
                            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-user-plus'}
                            className="w-full p-button-lg"
                            loading={loading}
                            disabled={loading}
                        />

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    href="/mechanic/login"
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </Card>

                {/* Google Map Dialog */}
                <Dialog
                    header="Select Your Location"
                    visible={showMapDialog}
                    style={{ width: '90vw', maxWidth: '800px' }}
                    onHide={() => setShowMapDialog(false)}
                    footer={
                        <div className="flex justify-between items-center w-full">
                            <Button
                                label="Use Current Location"
                                icon="pi pi-compass"
                                onClick={handleGetCurrentLocation}
                                className="p-button-outlined p-button-secondary"
                            />
                            <div className="flex gap-2">
                                <Button
                                    label="Cancel"
                                    icon="pi pi-times"
                                    onClick={() => setShowMapDialog(false)}
                                    className="p-button-text"
                                />
                                <Button
                                    label="Confirm Location"
                                    icon="pi pi-check"
                                    onClick={handleConfirmLocation}
                                />
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <i className="pi pi-info-circle mr-2"></i>
                                Click on the map to place a marker at your service location. You can also use the "Use Current Location" button.
                            </p>
                        </div>

                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="font-semibold">Latitude:</span> {markerPosition?.lat?.toFixed(6) || '0.000000'}
                                </div>
                                <div>
                                    <span className="font-semibold">Longitude:</span> {markerPosition?.lng?.toFixed(6) || '0.000000'}
                                </div>
                            </div>
                        </div>

                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={mapCenter}
                                zoom={13}
                                onClick={handleMapClick}
                                options={{
                                    streetViewControl: false,
                                    mapTypeControl: true,
                                    fullscreenControl: true
                                }}
                            >
                                <Marker
                                    position={markerPosition}
                                    draggable={true}
                                    onDragEnd={handleMapClick}
                                />
                            </GoogleMap>
                        ) : (
                            <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <div className="text-center">
                                    <i className="pi pi-spin pi-spinner text-4xl text-blue-600 mb-3"></i>
                                    <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Dialog>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                    © 2026 YMechanics. All rights reserved.
                </p>
            </div>
        </div>
    );
}
