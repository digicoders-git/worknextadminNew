import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import axios from "axios";
import { FaFilePdf, FaFileExcel, FaSyncAlt, FaEye, FaDownload } from "react-icons/fa";

function ApplyData() {
  const [applyData, setApplyData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const api_url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchApplyData();
  }, []);

  const fetchApplyData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api_url}/api/applications`);
      const arr = Array.isArray(res.data.data) ? res.data.data : [];
      setApplyData(arr);
      setOriginalData(arr);
    } catch (error) {
      alert("Unable to fetch! " + error);
    } finally {
      setLoading(false);
    }
  };

  // SEARCH
  const handleSearch = (value) => {
    const search = value.toLowerCase();
    if (search.trim() === "") {
      setApplyData(originalData);
      return;
    }
    const filtered = originalData.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.mobile.toLowerCase().includes(search) ||
        item.qualification.toLowerCase().includes(search) ||
        item.message.toLowerCase().includes(search)
    );
    setApplyData(filtered);
  };

  // DELETE
  const deleteRow = async (id) => {
    try {
      setDeletingId(id);
      await axios.delete(`${api_url}/api/delete/${id}`);
      setApplyData(applyData.filter((item) => item._id !== id));
      setOriginalData(originalData.filter((item) => item._id !== id));
    } catch (error) {
      alert("Unable to delete! " + error);
    } finally {
      setDeletingId(null);
    }
  };

  // EXCEL
  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Apply Form");

    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 35 },
      { header: "Mobile", key: "mobile", width: 18 },
      { header: "Qualification", key: "qualification", width: 18 },
      { header: "Message", key: "message", width: 50 },
      { header: "CV", key: "cv", width: 30 },
    ];

    applyData.forEach((item) => sheet.addRow(item));

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "apply_form.xlsx");
  };

  // PDF
  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Apply Form Report", 10, 12);

    let y = 30;

    applyData.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.text(`Record #${index + 1}`, 10, y);
      doc.setFontSize(12);
      doc.text(`Name: ${item.name}`, 10, y + 10);
      doc.text(`Email: ${item.email}`, 10, y + 18);
      doc.text(`Mobile: ${item.mobile}`, 10, y + 26);
      doc.text(`Qualification: ${item.qualification}`, 10, y + 34);

      const msgLines = doc.splitTextToSize(item.message, 180);
      const height = msgLines.length * 6 + 8;
      doc.rect(10, y + 45, 190, height);
      doc.text(msgLines, 12, y + 50);

      y += height + 60;
    });

    doc.save("apply_form.pdf");
  };

  // VIEW CV
  const viewCV = (cvFile) => {
    if (!cvFile) return alert("No CV available!");
    window.open(`${api_url}/uploads/${cvFile}`, "_blank");
  };

  // DOWNLOAD CV
  const downloadCV = async (cvFile) => {
    if (!cvFile) return alert("No CV available!");
    try {
      const response = await axios.get(`${api_url}/uploads/${cvFile}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", cvFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
      alert("Unable to download CV!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Loading Apply Forms...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Apply Form Applications
        </h1>

        {/* SEARCH + BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Search…"
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 w-64 border rounded-lg shadow-sm"
          />
          <div className="flex gap-3">
            <button
              onClick={fetchApplyData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md"
            >
              <FaSyncAlt size={20} />
              <span className="hidden md:block">Refresh</span>
            </button>

            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md"
            >
              <FaFilePdf size={22} />
              <span className="hidden md:block">PDF</span>
            </button>

            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md"
            >
              <FaFileExcel size={22} />
              <span className="hidden md:block">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      {applyData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-500 text-xl font-medium">
            No Applications Found
          </p>
        </div>
      ) : (
        <div className="overflow-hidden shadow-2xl rounded-2xl bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Qualification</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">CV</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {applyData.map((item, index) => (
                  <tr
                    key={item._id}
                    className={`transition-all hover:bg-green-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.email}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                        {item.qualification}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs max-h-20 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-green-50 border border-green-200 rounded-lg text-sm font-semibold text-gray-700 shadow-inner">
                        {item.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center flex flex-col gap-2 items-center justify-center">
                      {item.cv ? (
                        <>
                          <button
                            onClick={() => viewCV(item.cv)}
                            className="flex items-center gap-2 px-4 py-1 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-bold"
                          >
                            <FaEye /> View
                          </button>
                          <button
                            onClick={() => downloadCV(item.cv)}
                            className="flex items-center gap-2 px-4 py-1 bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-bold"
                          >
                            <FaDownload /> Download
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 font-semibold">No CV</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => deleteRow(item._id)}
                        disabled={deletingId === item._id}
                        className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                      >
                        {deletingId === item._id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span className="text-base font-bold">...</span>
                          </>
                        ) : (
                          <span className="text-base font-bold">Delete</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplyData;
