import api from './api.service';

export const getMyAppointments = async () => {
    try {
        const response = await api.get('/appointments');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch appointments';
    }
};

export const createAppointment = async (apptData) => {
    try {
        const response = await api.post('/appointments', apptData);
        return response.data;
    } catch (error) {
        // Return the full error object if available (e.g. including reasons)
        throw error.response?.data || { error: 'Failed to book appointment' };
    }
};

export const updateAppointmentStatus = async (id, status, scheduledAt) => {
    try {
        const payload = { status };
        if (scheduledAt) payload.scheduledAt = scheduledAt;

        const response = await api.patch(`/appointments/${id}/status`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to update appointment';
    }
};

export const getBookingOptions = async () => {
    try {
        const response = await api.get('/appointments/booking-options');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch booking options';
    }
};

export const getOrgAppointments = async () => {
    try {
        const response = await api.get('/appointments/org-requests');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch requests';
    }
};

export default {
    getMyAppointments,
    createAppointment,
    updateAppointmentStatus,
    getBookingOptions,
    getOrgAppointments
};

