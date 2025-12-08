import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import axios from "axios";
import { FaFilePdf, FaFileExcel, FaSyncAlt } from "react-icons/fa";

function Demo() {
  const [contactData, setContactData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // for search reset
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const api_url = import.meta.env.VITE_API_URL;

  // FETCH DATA
  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api_url}/api/demo`);
      const dataArray = Array.isArray(res.data.data) ? res.data.data : [];

      setContactData(dataArray);
      setOriginalData(dataArray); // store backup for search
    } catch (err) {
      alert("Unable to fetch demo data! " + err);
    } finally {
      setLoading(false);
    }
  };

  // ======================= SEARCH =======================
  const handleSearch = (value) => {
    const search = value.toLowerCase();

    if (search.trim() === "") {
      setContactData(originalData);
      return;
    }

    const filtered = originalData.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.mobile.toLowerCase().includes(search) ||
        item.message.toLowerCase().includes(search)
    );

    setContactData(filtered);
  };

  // DELETE RECORD
  const deleteRow = async (id) => {
    try {
      setDeletingId(id);
      await axios.delete(`${api_url}/api/demo/${id}`);
      setContactData(contactData.filter((item) => item._id !== id));
      setOriginalData(originalData.filter((item) => item._id !== id));
    } catch (err) {
      alert("Unable to delete!" + err);
    } finally {
      setDeletingId(null);
    }
  };

  // ===================== EXCEL =====================
  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Demo Requests");

    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 35 },
      { header: "Mobile", key: "mobile", width: 18 },
      { header: "Message", key: "message", width: 60 },
    ];

    // HEADER
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, size: 14, color: { argb: "FF000000" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF00" }, // YELLOW
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // ROWS
    contactData.forEach((item) => {
      sheet.addRow({
        name: item.name,
        email: item.email,
        mobile: item.mobile,
        message: item.message,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "demo_messages.xlsx");
  };

  // ===================== PDF =====================
  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // HEADER BAR
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Demo Requests Report", 10, 12);

    let y = 30;
    doc.setTextColor(0, 0, 0);

    contactData.forEach((item, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Record #${index + 1}`, 10, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Name: ${item.name}`, 10, y + 10);
      doc.text(`Email: ${item.email}`, 10, y + 18);
      doc.text(`Mobile: ${item.mobile}`, 10, y + 26);

      const messageLines = doc.splitTextToSize(item.message, 180);
      const boxHeight = messageLines.length * 6 + 8;

      doc.rect(10, y + 40, 190, boxHeight);
      doc.text(messageLines, 12, y + 45);

      y += boxHeight + 55;
    });

    doc.save("demo_messages.pdf");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Loading Demo Requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold text-gray-800">Demo Requests</h1>

        {/* SEARCH + BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* SEARCH BAR */}
          <input
            type="text"
            placeholder="Search here…"
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 w-60 border rounded-lg shadow-sm outline-none"
          />

          {/* BUTTONS GROUP */}
          <div className="flex gap-3">
            {/* REFRESH */}
            <button
              onClick={fetchContactData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              <FaSyncAlt size={20} />
              <span className="hidden md:block">Refresh</span>
            </button>

            {/* PDF */}
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md"
            >
              <FaFilePdf size={22} />
              <span className="hidden sm:block">PDF</span>
            </button>

            {/* EXCEL */}
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
            >
              <FaFileExcel size={22} />
              <span className="hidden sm:block">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* NO DATA */}
      {contactData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-xl font-medium">No Data Found</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow-2xl rounded-2xl bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {contactData.map((item, index) => (
                  <tr
                    key={item._id}
                    className={`transition-all hover:bg-green-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {item.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-700">
                        {item.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-700">
                        {item.mobile}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs max-h-20 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-green-50 border border-green-200 rounded-lg text-sm font-semibold text-gray-700 shadow-inner">
                        {item.message}
                      </div>
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

export default Demo;
