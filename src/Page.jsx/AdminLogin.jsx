import axios from "axios";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";

export default function AdminLoginResponsive() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const api_url = import.meta.env.VITE_API_URL;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${api_url}/api/singUp/login`, form);

      if (res.data === "Email not found") {
        toast.error("Email not found");
      } else if (res.data === "Password not match") {
        toast.error("Password not match");
      } else if (res.data.message === "Login successful") {
        toast.success("Login successful");
        localStorage.setItem("token", res.data.token);
        navigate("/Dashboard");
      }
    } catch (error) {
      console.log(error);
      toast.error("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-900 to-green-900 p-3 sm:p-4 md:p-6 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-gradient-to-br from-emerald-500 to-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-gradient-to-br from-green-500 to-lime-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-gradient-to-br from-emerald-400 to-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-12 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-gradient-to-br from-gray-800/50 to-slate-900/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-emerald-400/30 relative z-10 transform transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/25 animate-fadeIn">
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out;
          }
        `}</style>

        {/* Header */}
        <div
          className="text-center mb-6 sm:mb-8 animate-fadeIn"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="inline-block p-2.5 sm:p-3.5  rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-emerald-500/40 transform transition-transform duration-300 hover:scale-110 hover:rotate-6">
            <img src="/logo.png" alt="" className="w-20 " />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-300 via-green-300 to-lime-300 bg-clip-text text-transparent mb-1 sm:mb-2">
            Admin Portal
          </h1>
          <p className="text-emerald-200 text-xs sm:text-sm font-medium">
            Secure Access Dashboard
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 sm:space-y-5">
          {/* Email */}
          <div className="animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <label className="text-emerald-100 text-xs sm:text-sm font-semibold block mb-2 transition-colors duration-300">
              Email Address
            </label>
            <div className="relative group">
              <FaEnvelope
                className={`absolute left-3 sm:left-4 top-3 sm:top-4 text-sm sm:text-base transition-all duration-300 ${
                  focusedField === "email"
                    ? "text-emerald-400 scale-110"
                    : "text-green-400"
                }`}
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="admin@example.com"
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 text-white placeholder-emerald-300/50 text-sm sm:text-base
                border border-emerald-400/30 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                transition-all duration-300 backdrop-blur-sm hover:bg-white/10 group-hover:border-emerald-400/50"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <label className="text-emerald-100 text-xs sm:text-sm font-semibold block mb-2">
              Password
            </label>
            <div className="relative group">
              <FaLock
                className={`absolute left-3 sm:left-4 top-3 sm:top-4 text-sm sm:text-base transition-all duration-300 ${
                  focusedField === "password"
                    ? "text-emerald-400 scale-110"
                    : "text-green-400"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 text-white placeholder-emerald-300/50 text-sm sm:text-base
                border border-emerald-400/30 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                transition-all duration-300 backdrop-blur-sm hover:bg-white/10 group-hover:border-emerald-400/50"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 sm:right-4 top-1 sm:top-2 text-emerald-300 hover:text-emerald-400 transition-all duration-300 text-sm sm:text-base transform hover:scale-125"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 mt-1 sm:mt-2 bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 text-white rounded-lg sm:rounded-xl 
            font-bold text-sm sm:text-lg hover:from-emerald-600 hover:via-green-600 hover:to-lime-600 transition-all duration-300 
            transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30
            hover:shadow-emerald-500/50 active:scale-95 relative overflow-hidden group animate-fadeIn"
            style={{ animationDelay: "0.5s" }}
          >
            <span className="relative z-10">
              {loading ? "Logging in..." : "Login"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </form>

        {/* Footer */}
        <div
          className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-emerald-400/20 text-center animate-fadeIn"
          style={{ animationDelay: "0.8s" }}
        >
          <p className="text-emerald-300 text-xs font-medium">
            🔒 Enterprise Security
          </p>
        </div>
      </div>
    </div>
  );
}
