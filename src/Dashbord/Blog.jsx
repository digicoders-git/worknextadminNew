import React, { useState, useEffect, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";
import axios from "axios";
import {
  FaSyncAlt, FaTrash, FaPlus, FaTimes, FaEye, FaEdit,
  FaSearch, FaFilter, FaCalendarAlt, FaUser, FaTag,
  FaImage, FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const token = () => localStorage.getItem("token");

const emptyForm = { heading: "", description: "", category: "", author: "", tags: "", youtubeUrl: "", image: [], mediaType: "image" };


function Blog() {
  const api_url = import.meta.env.VITE_API_URL;

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

  // Delete Confirm Modal
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Update
  const [updateBlog, setUpdateBlog] = useState(null);
  const [updateForm, setUpdateForm] = useState(emptyForm);
  const [updatePreview, setUpdatePreview] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Jodit Editor refs & config
  const createEditorRef = useRef(null);
  const updateEditorRef = useRef(null);
  const joditConfig = useMemo(() => ({
    readonly: false,
    placeholder: "Write your blog content here...",
    height: 500,
    iframe: false,
    uploader: {
      insertImageAsBase64URI: true,
    },
    image: {
      openOnDblClick: true,
      editSrc: true,
      useImageEditor: false,
      dialogWidth: 600,
    },
    events: {
      afterInsertImage: function (image) {
        const p = this.createInside.element('p');
        p.appendChild(this.createInside.text('\u00a0'));
        image.parentNode.insertBefore(p, image.nextSibling);
        this.selection.setCursorIn(p);
      },
    },
  }), []);

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
    if (createForm.mediaType === "image" && createForm.image.length === 0) {
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
      youtubeUrl: blog.youtubeUrl || "",
      image: [],
      mediaType: blog.youtubeUrl ? "youtube" : "image",
    });
    setUpdatePreview([]);
    setShowCreate(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      fd.append("youtubeUrl", updateForm.youtubeUrl || "");
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
    try {
      setDeletingId(id);
      setConfirmDeleteId(null);
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
                  <span className="hidden md:block">Reset</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowCreate(!showCreate); setUpdateBlog(null); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  {showCreate ? <FaTimes size={16} /> : <FaPlus size={16} />}
                  <span>{showCreate ? "Close" : "Create Blog"}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── CREATE / UPDATE FORM with Animation ── */}
        <AnimatePresence>
          {(showCreate || updateBlog) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {updateBlog ? <FaEdit className="text-indigo-600" /> : <FaPlus className="text-indigo-600" />}
                    {updateBlog ? "Update Blog" : "Create New Blog"}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      if (updateBlog) { setUpdateBlog(null); }
                      else { setCreateForm(emptyForm); setCreatePreview([]); }
                    }}
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center gap-2"
                  >
                    <FaSyncAlt size={14} /> {updateBlog ? "Close" : "Reset"}
                  </motion.button>
                </div>
                <form onSubmit={updateBlog ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input name="heading" value={updateBlog ? updateForm.heading : createForm.heading} onChange={updateBlog ? handleUpdateChange : handleCreateChange} placeholder="Blog Heading *" required className={inp} />
                  <input name="author" value={updateBlog ? updateForm.author : createForm.author} onChange={updateBlog ? handleUpdateChange : handleCreateChange} placeholder="Author Name *" required className={inp} />
                  <input name="category" value={updateBlog ? updateForm.category : createForm.category} onChange={updateBlog ? handleUpdateChange : handleCreateChange} placeholder="Category *" required className={inp} />
                  <input name="tags" value={updateBlog ? updateForm.tags : createForm.tags} onChange={updateBlog ? handleUpdateChange : handleCreateChange} placeholder="Tags: web,react,AI" className={inp} />
                  <div className="md:col-span-2">
                    {/* TOGGLE */}
                    <div className="flex gap-3 mb-4">
                      <button type="button"
                        onClick={() => updateBlog
                          ? setUpdateForm({ ...updateForm, mediaType: "image", youtubeUrl: "" })
                          : setCreateForm({ ...createForm, mediaType: "image", youtubeUrl: "" })
                        }
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                          (updateBlog ? updateForm.mediaType : createForm.mediaType) === "image"
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <FaImage size={14} /> Image Upload
                      </button>
                      <button type="button"
                        onClick={() => updateBlog
                          ? setUpdateForm({ ...updateForm, mediaType: "youtube", image: [] })
                          : setCreateForm({ ...createForm, mediaType: "youtube", image: [], })
                        }
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                          (updateBlog ? updateForm.mediaType : createForm.mediaType) === "youtube"
                            ? "bg-red-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        🎬 YouTube Video
                      </button>
                    </div>

                    {/* IMAGE UPLOAD */}
                    {(updateBlog ? updateForm.mediaType : createForm.mediaType) === "image" && (
                      <>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all">
                          <div className="flex flex-col items-center gap-1 text-indigo-500">
                            <FaImage size={28} />
                            <span className="text-sm font-medium">Click karke images select karo</span>
                            <span className="text-xs text-gray-400">PNG, JPG, WEBP supported</span>
                          </div>
                          <input type="file" name="image" accept="image/*" multiple onChange={updateBlog ? handleUpdateChange : handleCreateChange} className="hidden" />
                        </label>
                        {(updateBlog ? updatePreview : createPreview).length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(updateBlog ? updatePreview : createPreview).map((url, idx) => (
                              <motion.img key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                src={url} className="h-24 w-24 rounded-xl object-cover border-2 border-indigo-200" />
                            ))}
                          </div>
                        ) : updateBlog?.image?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(Array.isArray(updateBlog.image) ? updateBlog.image : [updateBlog.image]).map((img, idx) => (
                              <img key={idx} src={img} className="h-24 w-24 rounded-xl object-cover border opacity-60" />
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* YOUTUBE URL */}
                    {(updateBlog ? updateForm.mediaType : createForm.mediaType) === "youtube" && (
                      <>
                        <input
                          name="youtubeUrl"
                          value={updateBlog ? updateForm.youtubeUrl : createForm.youtubeUrl}
                          onChange={updateBlog ? handleUpdateChange : handleCreateChange}
                          placeholder="https://www.youtube.com/watch?v=xxxxxxx"
                          className={inp}
                        />
                        {(updateBlog ? updateForm.youtubeUrl : createForm.youtubeUrl) && (() => {
                          try {
                            const url = updateBlog ? updateForm.youtubeUrl : createForm.youtubeUrl;
                            const videoId = url.includes("youtu.be/")
                              ? url.split("youtu.be/")[1]?.split("?")[0]
                              : new URLSearchParams(new URL(url).search).get("v");
                            return videoId ? (
                              <div className="mt-3 rounded-xl overflow-hidden border border-red-200">
                                <iframe src={`https://www.youtube.com/embed/${videoId}`}
                                  className="w-full h-56" allowFullScreen title="YouTube Preview" />
                              </div>
                            ) : null;
                          } catch { return null; }
                        })()}
                      </>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-1">Description *</label>
                    <JoditEditor
                      ref={updateBlog ? updateEditorRef : createEditorRef}
                      value={updateBlog ? updateForm.description : createForm.description}
                      config={joditConfig}
                      onBlur={(newContent) => updateBlog
                        ? setUpdateForm((prev) => ({ ...prev, description: newContent }))
                        : setCreateForm((prev) => ({ ...prev, description: newContent }))
                      }
                      onChange={() => { }}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={updateBlog ? updating : submitting}
                      className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-60 transition-all"
                    >
                      {updateBlog
                        ? (updating ? "Updating..." : "Update Blog")
                        : (submitting ? "Publishing..." : "Publish Blog")
                      }
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
                        {blog.youtubeUrl ? (
                          <img
                            src={`https://img.youtube.com/vi/${
                              blog.youtubeUrl.includes("youtu.be/")
                                ? blog.youtubeUrl.split("youtu.be/")[1]?.split("?")[0]
                                : new URLSearchParams(new URL(blog.youtubeUrl).search).get("v")
                            }/hqdefault.jpg`}
                            className="w-16 h-12 object-cover rounded-lg border-2 border-red-200"
                            alt="thumbnail"
                            onError={(e) => (e.target.src = "/logo.png")}
                          />
                        ) : (
                          <img
                            src={(Array.isArray(blog.image) ? blog.image[0] : blog.image) || "/logo.png"}
                            alt={blog.heading}
                            className="w-16 h-12 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-400 transition-all"
                            onError={(e) => (e.target.src = "/logo.png")}
                          />
                        )}
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
                            onClick={() => setConfirmDeleteId(blog._id)}
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

        {/* ── VIEW MODAL ── */}
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaEye /> Blog Preview
                  </h2>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setViewBlog(null)}
                    className="text-white hover:text-red-300 transition"
                  >
                    <FaTimes size={20} />
                  </motion.button>
                </div>

                {viewLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
                  </div>
                ) : (
                  <div>
                    {/* TOP MEDIA — YouTube ya Image */}
                    {viewBlog.youtubeUrl ? (
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${
                            viewBlog.youtubeUrl.includes("youtu.be/")
                              ? viewBlog.youtubeUrl.split("youtu.be/")[1]?.split("?")[0]
                              : new URLSearchParams(new URL(viewBlog.youtubeUrl).search).get("v")
                          }`}
                          className="absolute inset-0 w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          title="YouTube Video"
                        />
                      </div>
                    ) : viewBlog.image?.length > 0 && (
                      <div className="w-full h-72 overflow-hidden">
                        <img
                          src={Array.isArray(viewBlog.image) ? viewBlog.image[0] : viewBlog.image}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.src = "/logo.png")}
                          alt={viewBlog.heading}
                        />
                      </div>
                    )}

                    {/* CONTENT */}
                    <div className="p-6 space-y-5">
                      {/* Category */}
                      {viewBlog.category && (
                        <span className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                          {viewBlog.category}
                        </span>
                      )}

                      {/* Heading */}
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                        {viewBlog.heading}
                      </h1>

                      {/* Author + Date */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <FaUser className="text-indigo-500" /> {viewBlog.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaCalendarAlt className="text-indigo-500" />
                          {new Date(viewBlog.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      {/* Tags */}
                      {viewBlog.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(viewBlog.tags) ? viewBlog.tags : []).map((tag, i) => (
                            <span key={i} className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                              <FaTag size={9} /> {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Description */}
                      <div className="border-t pt-5">
                        <style>{`
                          .view-blog-content { font-size: 1rem; line-height: 1.8; color: #374151; }
                          .view-blog-content p { margin: 0.6em 0; min-height: 1.2em; }
                          .view-blog-content h1 { font-size: 2em; font-weight: 700; margin: 1em 0 0.5em; color: #111827; }
                          .view-blog-content h2 { font-size: 1.6em; font-weight: 700; margin: 1em 0 0.5em; color: #111827; }
                          .view-blog-content h3 { font-size: 1.3em; font-weight: 700; margin: 1em 0 0.5em; color: #111827; }
                          .view-blog-content ul { list-style-type: disc; padding-left: 2em; margin: 0.5em 0; }
                          .view-blog-content ol { list-style-type: decimal; padding-left: 2em; margin: 0.5em 0; }
                          .view-blog-content li { display: list-item; margin: 0.3em 0; }
                          .view-blog-content strong, .view-blog-content b { font-weight: 700; }
                          .view-blog-content em, .view-blog-content i { font-style: italic; }
                          .view-blog-content a { color: #6366f1; text-decoration: underline; }
                          .view-blog-content blockquote { border-left: 4px solid #6366f1; padding-left: 1em; margin: 1em 0; color: #555; font-style: italic; background: #f9fafb; border-radius: 0 8px 8px 0; }
                          .view-blog-content img { max-width: 100%; height: auto; display: block; margin: 12px auto; border-radius: 8px; }
                          .view-blog-content table { width: 100%; border-collapse: collapse; margin: 1em 0; }
                          .view-blog-content td, .view-blog-content th { border: 1px solid #ddd; padding: 8px; }
                          .view-blog-content th { background: #f3f4f6; font-weight: 700; }
                          .view-blog-content iframe { width: 100%; min-height: 315px; border: none; display: block; margin: 12px 0; }
                          .view-blog-content pre { background: #1f2937; color: #f9fafb; padding: 1em; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
                          .view-blog-content code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
                        `}</style>
                        <div className="view-blog-content" dangerouslySetInnerHTML={{ __html: viewBlog.description }} />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



      {/* ── DELETE CONFIRM MODAL ── */}
        <AnimatePresence>
          {confirmDeleteId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
              >
                <div className="text-5xl mb-4">🗑️</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Blog?</h2>
                <p className="text-gray-500 text-sm mb-6">Yeh blog permanently delete ho jayega. Wapas nahi aayega!</p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteBlog(confirmDeleteId)}
                    className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default Blog;