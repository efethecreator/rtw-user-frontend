import React, { useState } from "react";
import { motion } from "framer-motion";
import useUserStore from "../stores/userStore"; // useUserStore mağazasını içe aktarıyoruz

const UserInformation = ({ isOpen }) => {
  const [isKvkkAccepted, setIsKvkkAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  // Zustand mağazasından veriler ve işlevleri alıyoruz
  const personalInfo = useUserStore((state) => state.personalInfo);
  const setPersonalInfo = useUserStore((state) => state.setPersonalInfo);
  const createUser = useUserStore((state) => state.createUser);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const formattedPhone = formatPhone(value);
      setPersonalInfo({ [name]: formattedPhone });
    } else {
      setPersonalInfo({ [name]: value });
    }

    // Hata varsa, input değiştiğinde ilgili hatayı kaldır.
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const formatPhone = (value) => {
    let numbers = value.replace(/\D/g, '');
    if (numbers.length && numbers[0] !== '0') {
      numbers = '0' + numbers;
    }
    if (numbers.length > 11) {
      numbers = numbers.slice(0, 11); // En fazla 11 hane (0 dahil)
    }

    let formattedPhone = '';
    for (let i = 0; i < numbers.length; i++) {
      switch (i) {
        case 1:
          formattedPhone += ' ('; // 0 (
          break;
        case 4:
          formattedPhone += ') '; // 0 (XXX)
          break;
        case 7:
          formattedPhone += '-'; // 0 (XXX) XXX
          break;
        case 9:
          formattedPhone += '-'; // 0 (XXX) XXX-XX
          break;
        default:
          break;
      }
      formattedPhone += numbers[i];
    }
    return formattedPhone;
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!personalInfo.name.trim()) newErrors.name = "Name is required.";
    if (!personalInfo.surname.trim()) newErrors.surname = "Surname is required.";
    if (!emailRegex.test(personalInfo.email)) newErrors.email = "Email must be a valid email address.";
    if (!/^0 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(personalInfo.phone)) newErrors.phone = "Phone number must be in the format 0 (XXX) XXX-XX-XX.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const userId = await createUser();
    if (userId) {
      console.log("User created with ID:", userId);
    }
  };

  if (!isOpen) return null;

  const inputVariants = {
    hover: { scale: 1.05 },
    focus: { scale: 1.1, rotateY: 10, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white p-6 rounded shadow-lg w-96 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Personal Information</h2>
        {["name", "surname", "email", "phone"].map(field => (
          <div key={field}>
            <motion.input
              type={field === "email" ? "email" : (field === "phone" ? "tel" : "text")}
              name={field}
              placeholder={field === "phone" ? "0 (___) ___-__-__" : (field.charAt(0).toUpperCase() + field.slice(1))}
              value={personalInfo[field]}
              onChange={handleInputChange}
              className={`block w-full mt-2 p-2 border ${errors[field] ? "border-red-500" : "border-gray-300"} rounded-2xl focus:outline-none`}
              variants={inputVariants}
              whileHover="hover"
              whileFocus="focus"
            />
            {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
          </div>
        ))}

        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="kvkk"
            checked={isKvkkAccepted}
            onChange={(e) => setIsKvkkAccepted(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="kvkk" className="text-gray-700">
            KVKK’yi okudum ve kabul ediyorum.
          </label>
        </div>

        <div className="flex justify-center mt-4">
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!isKvkkAccepted || Object.keys(errors).some((key) => errors[key])}
            className={`py-2 px-4 rounded-2xl hover:shadow-lg transition-all duration-300 ${
              isKvkkAccepted && !Object.keys(errors).some((key) => errors[key]) ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Submit
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserInformation;
