import prisma from '../../lib/prisma';

export const getAllStatesDal = async () => {
    const states = await prisma.states.findMany();
    return states;
};

export const getStateById = async (id) => {
    const state = await prisma.states.findUnique({
        where: { id }
    });
    return state;
};

export const addState = async (stateData) => {
    const newState = await prisma.states.create({
        data: stateData
    });
    return newState;
};

export const updateStateDal = async (stateId, stateData) => {
    const updatedState = await prisma.states.update({
        where: { id: stateId },
        data: {
            name: stateData.name,
            code: stateData.code
        }
    });
    return updatedState;
}

export const deleteStateDal = async (stateId) => {
    const deletedState = await prisma.states.delete({
        where: { id: stateId }
    });
    return deletedState;
}