import axios from "axios";



const BASE_URL = import.meta.env.DEV
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_URL_PROD;

const API = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
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
export const getUserLogsAPI = (id) => API.get(`/activity/user/${id}`);
export const addUserAPI = (data) => API.post("/users/register", data);
export const updateUserAPI = (id, data) => API.put(`/users/${id}`, data);
export const updateUserStatusAPI = (id, status, phone) => API.put(`/users/status/${id}`, { status, phone });
export const deleteUserAPI = (id) => API.delete(`/users/${id}`);
export const forgotPasswordAPI = (email) => API.post("/users/forgot-password", { email });
export const verifyOTPAPI = (email, otp) => API.post("/users/verify-otp", { email, otp });
export const resetPasswordAPI = (email, otp, password) => API.post("/users/reset-password", { email, otp, password });
export const loginUserAPI = (data) => API.post("/users/login", data);
export const getReportersAPI = () => API.get('/users/role/reporters');
export const verifyReporterAPI = (id, data) => API.put(`/users/verify-reporter/${id}`, data);

// News API
export const getNewsAPI = () => API.get('/news');
export const getNewsByIdAPI = (id) => API.get(`/news/${id}`);
export const createNewsAPI = (data) => API.post('/news', data);
export const updateNewsStatusAPI = (id, status) => API.patch(`/news/${id}/status`, { status });
export const deleteNewsAPI = (id) => API.delete(`/news/${id}`);
export const likeNewsAPI = (id) => API.patch(`/news/${id}/like`);
export const shareNewsAPI = (id) => API.patch(`/news/${id}/share`);

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
export const getAllPostsAPI = () => API.get('/communities/posts'); // Global Feed
export const getCommunityPostsAPI = (communityId) => API.get(`/communities/${communityId}/posts`); // Specific Community
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
export const getMyActivityAPI = () => API.get('/activity/me');

// Saved Content
export const getSavedContentAPI = () => API.get('/users/me/saved');
export const saveContentAPI = (data) => API.post('/users/me/saved', data);

// Analytics
export const getDashboardAnalyticsAPI = () => API.get('/analytics/dashboard');
export const getReportsAnalyticsAPI = () => API.get('/analytics/reports');
export const getUserAnalyticsAPI = (id) => API.get(`/analytics/user/${id}`);
export const getNewsAnalyticsAPI = (id) => API.get(`/analytics/news/${id}`);

// Community Management
export const sendEmailVerificationAPI = (data) => API.post('/communities/verify-email/send', data);
export const verifyDomainEmailAPI = (data) => API.post('/communities/verify-email/confirm', data);
export const inviteAuthorizedPersonAPI = (id, data) => API.post(`/communities/${id}/invite-authorized`, data);
export const approveAuthorizedInviteAPI = (data) => API.post('/communities/authorized/approve', data);
export const followCommunityAPI = (id) => API.post(`/communities/${id}/follow`);
export const unfollowCommunityAPI = (id) => API.delete(`/communities/${id}/follow`);
export const joinCommunityAPI = (id) => API.post(`/communities/${id}/join`);
export const approveJoinRequestAPI = (data) => API.post('/communities/request/approve', data);
export const rejectJoinRequestAPI = (data) => API.post('/communities/request/reject', data);

export const updateCommunityAPI = (id, data) => API.put(`/communities/${id}`, data);
export const removeMemberAPI = (communityId, userId) => API.delete(`/communities/${communityId}/members/${userId}`);
export const deletePostAPI = (postId) => API.delete(`/communities/posts/${postId}`);
export const deleteCommentAPI = (postId, commentId) => API.delete(`/communities/posts/${postId}/comments/${commentId}`);
export const likePostAPI = (id) => API.patch(`/communities/posts/${id}/like`);
export const commentOnPostAPI = (id, data) => API.post(`/communities/posts/${id}/comment`, data);
export const sharePostAPI = (id) => API.patch(`/communities/posts/${id}/share`);

// Reporter Hub API
export const getMyNewsAPI = () => API.get('/reporter/my-news');
export const getReporterStatsAPI = () => API.get('/reporter/stats');

// response interceptor for 401
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("isAdminAuthenticated");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default API;
