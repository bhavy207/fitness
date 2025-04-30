import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Authentication APIs
export const UserSignUp = async (data) => API.post("/user/signup", data);
export const UserSignIn = async (data) => API.post("/user/signin", data);
export const verifyOTP = async (data) => API.post("/user/verify-otp", data);
export const resendOTP = async (data) => API.post("/user/resend-otp", data);

// Dashboard APIs
// Dashboard APIs
export const getDashboardDetails = async (token) => {
  try {
    return await API.get("/user/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    toast.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// Workout APIs
export const getWorkouts = async (token, date) => {
  try {
    const url = date ? `/user/workout?date=${date}` : "/user/workout";
    return await API.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Get workouts API error:", error);
    toast.error("Error fetching workouts:", error);
    throw error;
  }
};

export const addWorkout = async (token, data) => {
  try {
    return await API.post(`/user/workout`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Add workout API error:", error);
    throw error;
  }
};

// Nutrition APIs
export const addNutritionItem = async (token, data) =>
  await API.post("/nutrition", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getNutritionItems = async (token, date) =>
  await API.get(`/nutrition/items${date ? `?date=${date}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getNutritionSummary = async (token) =>
  await API.get("/nutrition/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteNutritionItem = async (token, id) =>
  await API.delete(`/nutrition/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateNutritionItem = async (token, id, data) =>
  await API.put(`/nutrition/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateWorkout = async (token, workoutId, workoutData) => {
  try {
    return await API.put(`/user/workout/${workoutId}`, workoutData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Update workout API error:", error);
    throw error;
  }
};

export const deleteWorkout = async (token, workoutId) => {
  try {
    return await API.delete(`/user/workout/${workoutId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Delete workout API error:", error);
    throw error;
  }
};
