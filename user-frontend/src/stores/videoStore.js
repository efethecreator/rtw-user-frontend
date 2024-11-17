import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = "http://localhost:8000/api";  // Define a constant for base URL

const useVideoStore = create((set) => ({
  videos: [],
  videoUrl: null,

  // Fetch all videos
  fetchVideos: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/videos`, {
        withCredentials: true  // Ensure cookies are included
      });
      set({ videos: response.data });
    } catch (error) {
      console.error("Failed to fetch videos:", error.message);
    }
  },

  // Create a user
  createUser: async (personalInfo) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users`,
        personalInfo,
        { withCredentials: true }
      );
      set({ userId: response.data.id });  // Store returned userId
      return response.data.id;
    } catch (error) {
      console.error("User creation failed:", error.message);
      return null;
    }
  },

  // Check if the interview has expired
  checkInterviewStatus: async (interviewId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/interview/${interviewId}`,
        { withCredentials: true }
      );
      const { expireDate } = response.data;
      const isExpired = new Date(expireDate) < new Date();
      return !isExpired;  // Return true if not expired
    } catch (error) {
      console.error("Failed to check interview status:", error.message);
      return false;  // Assume expired on error
    }
  },

  // Upload a video
  uploadVideo: async (file, interviewId, userId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("interviewId", interviewId);
    formData.append("userId", userId);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/videos`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        }
      );
      set((state) => ({ videos: [...state.videos, response.data] }));
      console.log("Video uploaded successfully:", response.data);
    } catch (error) {
      console.error("Error during video upload:", error.message);
    }
  },

  // Delete a video
  deleteVideo: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/videos/${id}`, {
        withCredentials: true
      });
      set((state) => ({
        videos: state.videos.filter((video) => video._id !== id),
      }));
      console.log("Video deleted successfully");
    } catch (error) {
      console.error("Failed to delete video:", error.message);
    }
  },
}));

export default useVideoStore;
