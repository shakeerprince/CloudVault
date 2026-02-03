import { getCities, addCity, getCitiesByState } from '../dal/cities_dal';

export const addCityService = async (cityData) => {
    try {
        const res = await addCity(cityData);
        return res;
    } catch (error) {
        console.error("Error adding city:", error);
        throw error;
    }
}

export const getCitiesService = async () => {
    try {
        const res = await getCities();
        return res;
    } catch (error) {
        console.error("Error fetching cities:", error);
        throw error;
    }
}

export const getCitiesByStateService = async (stateId) => {
    try {
        const res = await getCitiesByState(stateId);
        return res;
    } catch (error) {
        console.error("Error fetching cities by state:", error);
        throw error;
    }
}