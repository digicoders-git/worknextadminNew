import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import JoditEditor from "jodit-react";
import {
  FaSyncAlt, FaTrash, FaPlus, FaTimes, FaEye, FaEdit,
  FaSearch, FaFilter, FaCalendarAlt, FaUser, FaTag,
  FaImage, FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const token = () => localStorage.getItem("token");

const emptyForm = { heading: "", description: "", category: "", author: "", tags: "", image: [] };


function Blog() {
  const api_url = import.meta.env.VITE_API_URL;

  const joditConfig = useMemo(() => ({
    readonly: false,
    placeholder: "Start typing your amazing blog content...",
    height: 400,
    toolbarButtonSize: "middle",
    theme: "default",
    saveModeInCookie: false,
    spellcheck: true,
    language: "en",
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    buttons: [
      "source", "|",
      "bold", "italic", "underline", "strikethrough", "|",
      "ul", "ol", "|",
      "outdent", "indent", "|",
      "font", "fontsize", "brush", "paragraph", "|",
      "image", "video", "table", "link", "|",
      "align", "undo", "redo", "|",
      "hr", "eraser", "copyformat", "|",
      "fullsize", "selectall", "print", "about"
    ],
    uploader: {
      insertImageAsBase64URI: true
    }
  }), []);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createPreview, setCreatePreview] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // View
  const [viewBlog, setViewBlog] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Update
  const [updateBlog, setUpdateBlog] = useState(null);
  const [updateForm, setUpdateForm] = useState(emptyForm);
  const [updatePreview, setUpdatePreview] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => { fetchBlogs(); }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api_url}/api/blog`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setBlogs(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Blog fetch error:", err?.response?.status, err?.response?.data, err?.message);
      showToast(err?.response?.data?.message || "Failed to fetch blogs!", "error");
    }
    finally { setLoading(false); }
  };

  // Get unique categories for filter
  const categories = [...new Set(blogs.map(blog => blog.category).filter(Boolean))];

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ─── CREATE ───────────────────────────────────────────
  const handleCreateChange = (e) => {
    if (e.target.name === "image") {
      const files = Array.from(e.target.files);
      setCreateForm({ ...createForm, image: files });
      setCreatePreview(files.map(file => URL.createObjectURL(file)));
    } else {
      setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (createForm.image.length === 0) {
      showToast("At least one image is required!", "error");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(createForm).forEach(([k, v]) => {
        if (k === "image") {
          v.forEach(file => fd.append("image", file));
        } else {
          fd.append(k, v);
        }
      });
      await axios.post(`${api_url}/api/blog`, fd, {
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "multipart/form-data" },
      });
      setCreateForm(emptyForm);
      setCreatePreview([]);
      setShowCreate(false);
      fetchBlogs();
      showToast("Blog created successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create!", "error");
    }
    finally { setSubmitting(false); }
  };

  // ─── VIEW ─────────────────────────────────────────────
  const openView = async (id) => {
    setViewLoading(true);
    setViewBlog({});
    try {
      const res = await axios.get(`${api_url}/api/blog/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setViewBlog(res.data.data);
    } catch {
      showToast("Failed to fetch blog!", "error");
      setViewBlog(null);
    }
    finally { setViewLoading(false); }
  };

  // ─── UPDATE ───────────────────────────────────────────
  const openUpdate = (blog) => {
    setUpdateBlog(blog);
    setUpdateForm({
      heading: blog.heading,
      description: blog.description,
      category: blog.category,
      author: blog.author,
      tags: Array.isArray(blog.tags) ? blog.tags.join(",") : blog.tags,
      image: [],
    });
    setUpdatePreview([]);
  };

  const handleUpdateChange = (e) => {
    if (e.target.name === "image") {
      const files = Array.from(e.target.files);
      setUpdateForm({ ...updateForm, image: files });
      setUpdatePreview(files.map(file => URL.createObjectURL(file)));
    } else {
      setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append("heading", updateForm.heading);
      fd.append("description", updateForm.description);
      fd.append("category", updateForm.category);
      fd.append("author", updateForm.author);
      fd.append("tags", updateForm.tags);
      if (updateForm.image.length > 0) {
        updateForm.image.forEach(file => fd.append("image", file));
      }

      await axios.put(`${api_url}/api/blog/${updateBlog._id}`, fd, {
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "multipart/form-data" },
      });
      setUpdateBlog(null);
      fetchBlogs();
      // hello bhai kya hai 
      showToast("Blog updated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update!", "error");
    }
    finally { setUpdating(false); }
  };

  // ─── DELETE ───────────────────────────────────────────
  const deleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`${api_url}/api/blog/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setBlogs(blogs.filter((b) => b._id !== id));
      showToast("Blog deleted successfully!", "success");
    } catch {
      showToast("Failed to delete!", "error");
    }
    finally { setDeletingId(null); }
  };
  // rbgjrfn5fr

  // ─── SHARED INPUT STYLE ───────────────────────────────
  const inp = "border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 w-full bg-gray-50";

  return (
    <div className="min-h-screen ">

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
              } text-white`}
          >
            {toast.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Blog Management</h1>
                <p className="text-indigo-100">Manage, create, and organize your blog content</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchBlogs}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 transition-all shadow-lg"
                >
                  <FaSyncAlt size={16} className={loading ? "animate-spin" : ""} />
                  <span className="hidden md:block">Refresh</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreate(!showCreate)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  {showCreate ? <FaTimes size={16} /> : <FaPlus size={16} />}
                  <span>{showCreate ? "Close" : "Create Blog"}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── CREATE FORM with Animation ── */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaPlus className="text-indigo-600" /> Create New Blog
                </h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input name="heading" value={createForm.heading} onChange={handleCreateChange} placeholder="Blog Heading *" required className={inp} />
                  <input name="author" value={createForm.author} onChange={handleCreateChange} placeholder="Author Name *" required className={inp} />
                  <input name="category" value={createForm.category} onChange={handleCreateChange} placeholder="Category *" required className={inp} />
                  <input name="tags" value={createForm.tags} onChange={handleCreateChange} placeholder="Tags: web,react,AI" className={inp} />
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-1">Description *</label>
                    <JoditEditor
                      value={createForm.description}
                      config={joditConfig}
                      onBlur={(newContent) => setCreateForm({ ...createForm, description: newContent })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                      <FaImage className="text-indigo-500" /> Image <span className="text-red-500 text-sm">*</span>
                    </label>
                    <input type="file" name="image" accept="image/*" multiple onChange={handleCreateChange} className="border border-gray-300 rounded-xl px-4 py-2 w-full bg-gray-50" />
                    {createPreview.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {createPreview.map((url, idx) => (
                          <motion.img
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={url}
                            className="h-24 w-24 rounded-xl object-cover border-2 border-indigo-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-60 transition-all"
                    >
                      {submitting ? "Publishing..." : "Publish Blog"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search and Filter Bar ── */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by heading, author, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            />
          </div>
          {categories.length > 0 && (
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-11 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── TABLE with Modern Design ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-gray-500 text-lg">Loading blogs...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200"
          >
            <div className="text-8xl mb-4">📝</div>
            <p className="text-gray-500 text-xl font-medium">No Blogs Found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or create a new blog</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden shadow-2xl rounded-2xl bg-white border border-gray-200"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    {["Image", "Heading", "Category", "Author", "Tags", "Date", "Actions"].map((h, idx) => (
                      <th key={idx} className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBlogs.map((blog, index) => (
                    <motion.tr
                      key={blog._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-indigo-50 transition-all duration-200 group"
                    >
                      <td className="px-4 py-3">
                        <img
                          src={(Array.isArray(blog.image) ? blog.image[0] : blog.image) || "/logo.png"}
                          alt={blog.heading}
                          className="w-16 h-12 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-400 transition-all"
                          onError={(e) => (e.target.src = "/logo.png")}
                        />
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{blog.heading}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200">
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-700 font-medium">{blog.author}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(blog.tags) ? blog.tags : []).slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">#{tag}</span>
                          ))}
                          {(Array.isArray(blog.tags) ? blog.tags : []).length > 2 && (
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                              +{(Array.isArray(blog.tags) ? blog.tags : []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <FaCalendarAlt size={12} />
                          <span>{new Date(blog.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-row gap-2 items-center justify-center">
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openView(blog._id)}
                            title="View"
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                          >
                            <FaEye size={15} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openUpdate(blog)}
                            title="Update"
                            className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all"
                          >
                            <FaEdit size={15} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteBlog(blog._id)}
                            disabled={deletingId === blog._id}
                            title="Delete"
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
                          >
                            {deletingId === blog._id
                              ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              : <FaTrash size={15} />}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── VIEW MODAL with Glassmorphism ── */}
        <AnimatePresence>
          {viewBlog !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaEye className="text-indigo-600" /> Blog Details
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewBlog(null)}
                    className="text-gray-500 hover:text-red-500 transition"
                  >
                    <FaTimes size={20} />
                  </motion.button>
                </div>
                {viewLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="p-5 space-y-4">
                    {viewBlog.image && (
                      <div className="grid grid-cols-2 gap-2">
                        {(Array.isArray(viewBlog.image) ? viewBlog.image : [viewBlog.image]).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            className="w-full h-32 object-cover rounded-xl border-2 border-indigo-100"
                            onError={(e) => (e.target.src = "/logo.png")}
                          />
                        ))}
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Heading</p>
                      <p className="text-xl font-bold text-gray-800 mt-1">{viewBlog.heading}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase flex items-center gap-1"><FaUser size={10} /> Author</p>
                        <p className="text-sm font-medium text-gray-700 mt-1">{viewBlog.author}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase flex items-center gap-1"><FaTag size={10} /> Category</p>
                        <span className="inline-block mt-1 px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800">{viewBlog.category}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Description</p>
                      <div className="text-sm text-gray-700 leading-relaxed mt-1 prose max-w-none" dangerouslySetInnerHTML={{ __html: viewBlog.description }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(viewBlog.tags) ? viewBlog.tags : []).map((tag, i) => (
                          <span key={i} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 border-t pt-3 mt-2">
                      Created: {new Date(viewBlog.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── UPDATE MODAL ── */}
        <AnimatePresence>
          {updateBlog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaEdit className="text-amber-600" /> Update Blog
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setUpdateBlog(null)}
                    className="text-gray-500 hover:text-red-500 transition"
                  >
                    <FaTimes size={20} />
                  </motion.button>
                </div>
                <form onSubmit={handleUpdate} className="p-5 space-y-4">
                  <input name="heading" value={updateForm.heading} onChange={handleUpdateChange} placeholder="Heading *" required className={inp} />
                  <input name="author" value={updateForm.author} onChange={handleUpdateChange} placeholder="Author *" required className={inp} />
                  <input name="category" value={updateForm.category} onChange={handleUpdateChange} placeholder="Category *" required className={inp} />
                  <input name="tags" value={updateForm.tags} onChange={handleUpdateChange} placeholder="Tags: web,react,AI" className={inp} />
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Description *</label>
                    <JoditEditor
                      value={updateForm.description}
                      config={joditConfig}
                      onBlur={(newContent) => setUpdateForm({ ...updateForm, description: newContent })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                      <FaImage className="text-amber-500" /> New Image <span className="text-gray-400 text-sm">(optional)</span>
                    </label>
                    <input type="file" name="image" accept="image/*" multiple onChange={handleUpdateChange} className="border border-gray-300 rounded-xl px-4 py-2 w-full bg-gray-50" />
                    {updatePreview.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {updatePreview.map((url, idx) => (
                          <img key={idx} src={url} className="h-20 w-20 rounded-xl object-cover border-2 border-amber-200" />
                        ))}
                      </div>
                    ) : updateBlog.image && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(Array.isArray(updateBlog.image) ? updateBlog.image : [updateBlog.image]).map((img, idx) => (
                          <img key={idx} src={img} className="h-20 w-20 rounded-xl object-cover border opacity-60" />
                        ))}
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={updating}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-60 transition-all"
                  >
                    {updating ? "Updating..." : "Update Blog"}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default Blog;