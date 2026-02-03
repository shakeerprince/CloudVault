import prisma from '../../lib/prisma';

export const getCities = async () => {
    const cities = await prisma.cities.findMany();
    return cities;
};

export const getCitiesByState = async (stateId) => {
    const cities = await prisma.cities.findMany({
        where: {
            state_id: stateId
        }
    });
    return cities;
};

export const getCityById = async (id) => {
    const city = await prisma.cities.findUnique({
        where: { id }
    });
    return city;
};

export const addCity = async (cityData) => {
    const newCity = await prisma.cities.create({
        data: cityData
    });
    return newCity;
};

export const updateCityDal = async (cityId, cityData) => {
    const updatedCity = await prisma.cities.update({
        where: { id: cityId },
        data: {
            name: cityData.name,
            state_id: cityData.state_id
        }
    });
    return updatedCity;
}

export const deleteCityDal = async (cityId) => {
    const deletedCity = await prisma.cities.delete({
        where: { id: cityId }
    });
    return deletedCity;
}
