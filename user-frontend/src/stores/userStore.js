import { create } from 'zustand';
import axios from 'axios';

const useUserStore = create((set, get) => ({
  userId: null,
  personalInfo: {
    name: "",
    surname: "",
    email: "",
    phone: "",
  },

  setPersonalInfo: (info) =>
    set((state) => ({
      personalInfo: { ...state.personalInfo, ...info },
    })),

  createUser: async () => {
    try {
      const { personalInfo } = get();
      const response = await axios.post('http://localhost:8000/api/users/create', personalInfo);
      set({
        userId: response.data.user._id,
      });
      return response.data.user._id;
    } catch (error) {
      console.error("User creation failed:", error.message);
      return null;
    }
  },
}));

export default useUserStore;
