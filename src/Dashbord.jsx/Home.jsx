import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Users, Presentation, FileText } from "lucide-react"; // Added FileText icon for Apply Form

function Home() {
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalDemo, setTotalDemo] = useState(0);
  const [applyForm, setApplyForm] = useState(0);
  const [loading, setLoading] = useState(true);
  const api_url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    getCounts();
  }, []);

  const getCounts = async () => {
    try {
      setLoading(true);

      const resContacts = await axios.get(`${api_url}/api/contact/contact`);
      const resDemo = await axios.get(`${api_url}/api/demo`);
      const resApply = await axios.get(`${api_url}/api/applications`);

      setTotalContacts(resContacts.data.data.length);
      setTotalDemo(resDemo.data.data.length);
      setApplyForm(resApply.data.data.length);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const DashboardCard = ({ title, count, link, icon, color }) => (
    <div className="bg-white p-7 rounded-2xl shadow-lg border hover:shadow-2xl transition-all flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className={`p-3 bg-${color}-100 text-${color}-600 rounded-xl`}>
          {icon}
        </div>
      </div>

      {/* Card Count */}
      <div className="mb-4">
        {loading ? (
          <div className="h-12 w-32 bg-gray-300 rounded relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
          </div>
        ) : (
          <h1 className={`text-5xl font-extrabold text-${color}-600`}>
            {count}
          </h1>
        )}
      </div>

      {/* Card Description */}
      <p className="text-gray-600 mb-4">
        {title === "Contact Requests"
          ? "Total user contact submissions."
          : title === "Demo Requests"
          ? "Total demo submission requests."
          : "Total job apply form submissions."}
      </p>

      <Link to={link}>
        <button
          className={`bg-${color}-600 text-white w-full py-3 rounded-xl text-lg font-medium hover:bg-${color}-700 transition`}
        >
          View {title}
        </button>
      </Link>
    </div>
  );

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        <DashboardCard
          title="Contact Requests"
          count={totalContacts}
          link="/Dashboard/Contact"
          icon={<Users size={30} />}
          color="blue"
        />

        <DashboardCard
          title="Demo Requests"
          count={totalDemo}
          link="/Dashboard/demo"
          icon={<Presentation size={30} />}
          color="green"
        />

        <DashboardCard
          title="Apply Form"
          count={applyForm}
          link="/Dashboard/ApplyForm"
          icon={<FileText size={30} />} // Different icon for clarity
          color="purple"
        />
      </div>

      {/* Shimmer Animation CSS */}
      <style>
        {`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        `}
      </style>
    </div>
  );
}

export default Home;
