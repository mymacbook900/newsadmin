import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api"
});

// attach token
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Users API
export const getUsersAPI = () => API.get("/users");
export const getUserByIdAPI = (id) => API.get(`/users/${id}`);
export const addUserAPI = (data) => API.post("/users/register", data);
export const updateUserStatusAPI = (id, status) => API.put(`/users/status/${id}`, { status });
export const deleteUserAPI = (id) => API.delete(`/users/${id}`);
export const forgotPasswordAPI = (email) => API.post("/users/forgot-password", { email });
export const verifyOTPAPI = (email, otp) => API.post("/users/verify-otp", { email, otp });
export const resetPasswordAPI = (email, otp, password) => API.post("/users/reset-password", { email, otp, password });
export const loginUserAPI = (data) => API.post("/users/login", data);
export const getReportersAPI = () => API.get('/users/role/reporters');
export const verifyReporterAPI = (id, data) => API.put(`/users/verify-reporter/${id}`, data);

// News API
export const getNewsAPI = () => API.get('/news');
export const createNewsAPI = (data) => API.post('/news', data);
export const updateNewsStatusAPI = (id, status) => API.patch(`/news/${id}/status`, { status });
export const deleteNewsAPI = (id) => API.delete(`/news/${id}`);

// Case Study API
export const getCaseStudiesAPI = () => API.get('/casestudies');
export const createCaseStudyAPI = (data) => API.post('/casestudies', data);
export const deleteCaseStudyAPI = (id) => API.delete(`/casestudies/${id}`); // Assuming delete is needed
export const getCaseStudyByIdAPI = (id) => API.get(`/casestudies/${id}`);

// Settings API
export const getSettingsAPI = () => API.get('/settings');
export const updateSettingsAPI = (data) => API.put('/settings', data);

// Community API
export const getCommunitiesAPI = () => API.get('/communities');
export const createCommunityAPI = (data) => API.post('/communities', data);
export const deleteCommunityAPI = (id) => API.delete(`/communities/${id}`);
export const getPostsAPI = () => API.get('/communities/posts');
export const createPostAPI = (data) => API.post('/communities/posts', data);

// Events API
export const getEventsAPI = (type) => API.get(`/events${type ? `?type=${type}` : ''}`);
export const createEventAPI = (data) => API.post('/events', data);

// Moderation API
export const getReportsAPI = () => API.get('/moderation');
export const updateReportStatusAPI = (id, status) => API.patch(`/moderation/${id}/status`, { status });
export const createReportAPI = (data) => API.post('/moderation', data);

// Activity & Dashboard
export const getLogsAPI = () => API.get('/activity/logs');
export const getDashboardStatsAPI = () => API.get('/activity/dashboard');

// Analytics
export const getDashboardAnalyticsAPI = () => API.get('/analytics/dashboard');
export const getReportsAnalyticsAPI = () => API.get('/analytics/reports');

export default API;
