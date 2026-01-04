import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaHome, FaPhone, FaVideo, FaSignOutAlt, FaKey } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";

function MainDashBord() {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1068) {
        setOpen(false);
        setIsMobile(true);
      } else {
        setOpen(true);
        setIsMobile(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-screen flex bg-gray-100 overflow-hidden">
      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white p-4 flex flex-col z-50 transition-all duration-300 ${
          open ? "w-64" : "w-20"
        }`}
      >
        {open && (
          <div className="text-xl font-bold mb-6 border-b border-gray-700 pb-2 text-center">
            Admin Panel
          </div>
        )}

        <div className="flex-1 flex flex-col gap-4 mt-4">
          <NavLink
            to="/Dashboard"
            className="flex items-center gap-4 text-[18px] px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <FaHome size={open ? 22 : 30} />
            {open && <span>Home</span>}
          </NavLink>

          <NavLink
            to="Contact"
            className="flex items-center gap-4 text-[18px] px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <FaPhone size={open ? 22 : 30} />
            {open && <span>Contact</span>}
          </NavLink>

          <NavLink
            to="Demo"
            className="flex items-center gap-4 text-[18px] px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <FaVideo size={open ? 22 : 30} />
            {open && <span>Demo Call</span>}
          </NavLink>

          <NavLink
            to="ApplyForm"
            className="flex items-center gap-4 text-[18px] px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <FaVideo size={open ? 22 : 30} />
            {open && <span>Apply Form</span>}
          </NavLink>

          <NavLink
            to="ChangePasswordForm"
            className="flex items-center gap-4 text-[18px] px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <FaKey size={open ? 22 : 30} />
            {open && <span>Change Password</span>}
          </NavLink>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <NavLink
            to="/"
            onClick={() => {
              localStorage.removeItem("token");
            }}
            className="flex items-center gap-4 text-[18px] px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
          >
            <FaSignOutAlt size={open ? 22 : 30} />
            {open && <span>Logout</span>}
          </NavLink>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className={`fixed top-0 right-0 bottom-0 transition-all duration-300 overflow-auto ${
          open ? "left-64" : "left-20"
        }`}
      >
        {/* TOP BAR */}
        <div
          className={`fixed top-0 right-0 h-20 bg-white shadow-md flex items-center justify-between px-4 sm:px-6 transition-all duration-300 z-40 ${
            open ? "left-64" : "left-20"
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
            >
              <GiHamburgerMenu size={30} />
            </button>

            {/* 👇 800px ke niche text hide */}
            <h1 className="hidden min-[800px]:block text-xl lg:text-2xl font-bold text-gray-700">
              Welcome to Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-lg font-semibold text-gray-700">
              Worknext
            </span>
            <img
              src="/Manager.png"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border"
              alt="Admin"
            />
          </div>
        </div>

        <div className="mt-20 p-2 sm:p-2 lg:p-4 xl:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainDashBord;
