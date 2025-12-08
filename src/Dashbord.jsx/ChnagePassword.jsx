import { useState } from "react";
import { motion } from "framer-motion";

import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import axios from "axios";
 const api_url = import.meta.env.VITE_API_URL;

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Invalid email format";

    if (!form.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!form.newPassword) newErrors.newPassword = "New password is required";
    else if (form.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm password";
    else if (form.newPassword !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (form.currentPassword === form.newPassword)
      newErrors.newPassword =
        "New password must be different from current password";

    return newErrors;
  };

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${api_url}/api/singUp/Change`,
        {
          email: form.email,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }
      );
      showToast(response.data.message || "Password updated successfully!", "success");
      setForm({
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update password",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex mt-[50px] justify-center bg-gray-100 p-4">
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 z-50 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <FaCheckCircle />
          ) : (
            <FaExclamationCircle />
          )}
          {toast.message}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2 flex items-center justify-center gap-2">
          <FaLock className="text-indigo-600" /> Change Password
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Update your account password securely
        </p>

        <form onSubmit={submitHandler} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={changeHandler}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                  errors.email
                    ? "border-red-400 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
                }`}
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationCircle size={14} /> {errors.email}
              </p>
            )}
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Current Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={form.currentPassword}
                onChange={changeHandler}
                className={`w-full pl-10 pr-10 py-3 rounded-lg border-2 transition focus:outline-none ${
                  errors.currentPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
                }`}
                placeholder="Enter current password"
              />
              <span
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-3.5 cursor-pointer text-gray-500 hover:text-gray-700"
              >
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationCircle size={14} /> {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={changeHandler}
                className={`w-full pl-10 pr-10 py-3 rounded-lg border-2 transition focus:outline-none ${
                  errors.newPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
                }`}
                placeholder="Enter new password"
              />
              <span
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-3.5 cursor-pointer text-gray-500 hover:text-gray-700"
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationCircle size={14} /> {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={changeHandler}
                className={`w-full pl-10 pr-10 py-3 rounded-lg border-2 transition focus:outline-none ${
                  errors.confirmPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
                }`}
                placeholder="Re-enter new password"
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-3.5 cursor-pointer text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationCircle size={14} /> {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "Updating..." : "Update Password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
