// src/api/dataApi.js
import axiosInstance from './axiosInstance';

// --- Appointment API Functions ---
export const getAvailableSlots = async (params) => {
  try {
    const response = await axiosInstance.get('/appointments/availability', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMyAppointments = async () => {
  try {
    const response = await axiosInstance.get('/appointments/my');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Ця функція використовується і для адміна, і для спеціаліста (бекенд розрізняє)
export const getAllAppointments = async (params) => {
  try {
    const response = await axiosInstance.get('/appointments', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await axiosInstance.get(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateAppointment = async (appointmentId, updateData) => {
  try {
    const response = await axiosInstance.put(`/appointments/${appointmentId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Service API Functions ---
// --- Service Categories ---
export const getAllServiceCategories = async () => { // Використовуємо це ім'я
  try {
    const response = await axiosInstance.get('/services/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createServiceCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post('/services/categories', categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateServiceCategory = async (categoryId, categoryData) => {
  try {
    const response = await axiosInstance.put(`/services/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteServiceCategory = async (categoryId) => {
  try {
    const response = await axiosInstance.delete(`/services/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Services ---
export const getServices = async (params) => { // Основна функція для отримання послуг
  try {
    const response = await axiosInstance.get('/services', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// getActiveServices може бути тим самим, що й getServices, якщо фільтрація is_active на бекенді
// Або якщо getServices завжди повертає активні, а для адміна потрібен інший параметр
export const getActiveServices = async (params) => {
  try {
    // Якщо потрібно завжди отримувати активні, можна додати is_active: true до params
    // const queryParams = { ...params, is_active: true };
    const response = await axiosInstance.get('/services', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getServiceBySlug = async (slug) => {
  try {
    const response = await axiosInstance.get(`/services/${slug}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createService = async (serviceData) => {
  try {
    const response = await axiosInstance.post('/services', serviceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateService = async (serviceId, serviceData) => {
  try {
    const response = await axiosInstance.put(`/services/${serviceId}`, serviceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteService = async (serviceId) => {
  try {
    const response = await axiosInstance.delete(`/services/${serviceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Reviews for Services ---
export const addReviewToService = async (serviceId, reviewData) => { // Використовуємо це ім'я
  try {
    const response = await axiosInstance.post(`/services/${serviceId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getServiceReviews = async (serviceId, params) => {
  try {
    const response = await axiosInstance.get(`/services/${serviceId}/reviews`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Specialist API Functions ---
export const getAllSpecialists = async (params) => { // Основна функція для отримання спеціалістів
  try {
    const response = await axiosInstance.get('/specialists', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// getSpecialists може бути тим самим, що й getAllSpecialists
export const getSpecialists = async (params) => { // Використовується в AppointmentForm
  try {
    const response = await axiosInstance.get('/specialists', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const getSpecialistById = async (specialistId) => {
  try {
    const response = await axiosInstance.get(`/specialists/${specialistId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateSpecialistProfile = async (specialistId, profileData) => {
  try {
    const response = await axiosInstance.put(`/specialists/${specialistId}`, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSpecialistServices = async (specialistId) => {
  try {
    const response = await axiosInstance.get(`/specialists/${specialistId}/services`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const assignServicesToSpecialist = async (specialistId, serviceIdsData) => {
  try {
    const response = await axiosInstance.post(`/specialists/${specialistId}/services`, serviceIdsData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Post API Functions ---
// --- Post Categories ---
export const getAllPostCategories = async () => { // Використовуємо це ім'я
  try {
    const response = await axiosInstance.get('/posts/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createPostCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post('/posts/categories', categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePostCategory = async (categoryId, categoryData) => {
  try {
    const response = await axiosInstance.put(`/posts/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePostCategory = async (categoryId) => {
  try {
    const response = await axiosInstance.delete(`/posts/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Posts ---
export const getPublishedPosts = async (params) => {
  try {
    const response = await axiosInstance.get('/posts', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPostBySlug = async (slug) => {
  try {
    const response = await axiosInstance.get(`/posts/${slug}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createPost = async (postData) => {
  try {
    const response = await axiosInstance.post('/posts', postData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePost = async (postId, postData) => {
  try {
    const response = await axiosInstance.put(`/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await axiosInstance.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Comments for Posts ---
export const addCommentToPost = async (postId, commentData) => {
  try {
    const response = await axiosInstance.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePostComment = async (postId, commentId) => {
  try {
    const response = await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Review API Functions (Admin for all reviews) ---
export const getAllReviewsAdmin = async (params) => {
  try {
    const response = await axiosInstance.get('/reviews', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateReviewApproval = async (reviewId, approvalData) => {
  try {
    const response = await axiosInstance.put(`/reviews/${reviewId}/approval`, approvalData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// --- Contact Message API Functions ---
export const createContactMessage = async (messageData) => {
  try {
    const response = await axiosInstance.post('/contact-messages', messageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllContactMessages = async (params) => {
  try {
    const response = await axiosInstance.get('/contact-messages', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getContactMessageById = async (messageId) => {
  try {
    const response = await axiosInstance.get(`/contact-messages/${messageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateContactMessageStatus = async (messageId, statusData) => {
  try {
    const response = await axiosInstance.put(`/contact-messages/${messageId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteContactMessage = async (messageId) => {
  try {
    const response = await axiosInstance.delete(`/contact-messages/${messageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getServiceById = async (serviceId) => {
  try {

    const response = await axiosInstance.get(`/services/${serviceId}`); // Використовуємо /services/:id
    return response.data;
  } catch (error) {
    console.error(`Error fetching service by ID ${serviceId}:`, error);
    throw error.response?.data || error.message;
  }
};
// --- User API Functions (Needs backend implementation) ---
// src/api/dataApi.js
// ...
export const getUsers = async (params) => {
  try {
    // Цей запит GET /api/users?role=client (або просто /api/users)
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error.response?.data || error.message || 'Failed to fetch users';
  }
};