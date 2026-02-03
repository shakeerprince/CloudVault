import { getAllStatesDal, addState } from '../dal/states_dal';
export const getStatesService = async () => {
    try {
        const res = await getAllStatesDal();
        return res;
    } catch (error) {
        console.error("Error fetching states:", error);
        throw error;
    }
}

export const addStateService = async (stateData) => {
    try {
        const res = await addState(stateData);
        return res;
    } catch (error) {
        console.error("Error adding state:", error);
        throw error;
    }
}