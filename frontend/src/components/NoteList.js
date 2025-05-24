import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import "../styles/styles.css";
import { BASE_URL } from "../utils";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NoteList = () => {
  const [suratMasuk, setSuratMasuk] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({});
  const [jawabanInput, setJawabanInput] = useState({});
  const [showJawabanForm, setShowJawabanForm] = useState({});
  const [loading, setLoading] = useState(false);

  const { logout, user, isAuthenticated, token, authAxios } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }
    getSuratMasuk();
    const interval = setInterval(getSuratMasuk, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token, navigate]);

  const getSuratMasuk = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await authAxios.get('/surat-masuk');
      setSuratMasuk(response.data);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
        navigate('/login');
      } else {
        setError("Failed to load surat masuk. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSurat = async (id) => {
    try {
      setError("");
      await authAxios.delete(`/surat-masuk/${id}`);
      setSuratMasuk(suratMasuk.filter((surat) => surat.id !== id));
    } catch (error) {
      setError("Failed to delete surat. Please try again.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setError("");
      await authAxios.patch(`/surat-masuk/${id}/status`, { status });
      getSuratMasuk();
      setStatusUpdate((prev) => ({ ...prev, [id]: "" }));
    } catch (error) {
      setError("Failed to update status. Please try again.");
    }
  };

  const handleStatusChange = (id, value) => {
    setStatusUpdate((prev) => ({ ...prev, [id]: value }));
  };

  const handleShowJawabanForm = (id) => {
    setShowJawabanForm((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleJawabanInput = (id, field, value) => {
    setJawabanInput((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const submitJawaban = async (id) => {
    try {
      setError("");
      const jawaban = jawabanInput[id];
      await authAxios.post('/jawaban-surat', {
        id_surat_masuk: id,
        tanggal_jawaban: jawaban.tanggal_jawaban,
        isi_jawaban: jawaban.isi_jawaban,
        file_path: jawaban.file_path
      });
      setShowJawabanForm((prev) => ({ ...prev, [id]: false }));
      setJawabanInput((prev) => ({ ...prev, [id]: {} }));
    } catch (error) {
      setError("Failed to submit jawaban. Please try again.");
    }
  };

  const getAvatar = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  // Filter surat masuk berdasarkan search
  const filteredSurat = suratMasuk.filter((surat) => {
    const query = searchQuery.toLowerCase();
    return (
      surat.no_surat.toLowerCase().includes(query) ||
      surat.pengirim.toLowerCase().includes(query) ||
      (surat.perihal || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="app-container">
      <header>
        <div className="header-content">
          <h1>Surat Masuk</h1>
          {user && (
            <div className="user-menu" ref={dropdownRef}>
              <div className="avatar-container" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="user-avatar">{getAvatar(user.username)}</div>
              </div>
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="dropdown-username">{user.username}</span>
                    <span className="dropdown-email">{user.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={() => { logout(); navigate('/login'); }}>
                    <span className="dropdown-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                        <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                      </svg>
                    </span>
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <input
          type="text"
          placeholder="Cari surat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {error && <div className="error-message">{error}</div>}
      </header>

      <div className="notes-container">
        <div className="list-container" style={{ width: "100%" }}>
          <div className="notes-list">
            <h2>Daftar Surat Masuk</h2>
            {loading ? (
              <div className="empty-notes">Loading...</div>
            ) : filteredSurat.length === 0 ? (
              <div className="empty-notes">
                {searchQuery ? "Tidak ada surat yang cocok" : "Belum ada surat masuk."}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
                <thead>
                  <tr>
                    <th>No Surat</th>
                    <th>Tanggal</th>
                    <th>Pengirim</th>
                    <th>Perihal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSurat.map((surat) => (
                    <tr key={surat.id}>
                      <td>{surat.no_surat}</td>
                      <td>{surat.tanggal}</td>
                      <td>{surat.pengirim}</td>
                      <td>{surat.perihal}</td>
                      <td>
                        {surat.status}
                        {(user.role === "petugas" || user.role === "admin") && (
                          <select
                            value={statusUpdate[surat.id] || surat.status}
                            onChange={(e) => handleStatusChange(surat.id, e.target.value)}
                            style={{ marginLeft: 8 }}
                          >
                            <option value="Menunggu Jawaban">Menunggu Jawaban</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Ditolak">Ditolak</option>
                          </select>
                        )}
                        {(user.role === "petugas" || user.role === "admin") && statusUpdate[surat.id] && statusUpdate[surat.id] !== surat.status && (
                          <button
                            className="button save-button"
                            style={{ marginLeft: 8 }}
                            onClick={() => updateStatus(surat.id, statusUpdate[surat.id])}
                          >
                            Simpan
                          </button>
                        )}
                      </td>
                      <td>
                        {(user.role === "petugas" || user.role === "admin") && (
                          <>
                            <button
                              className="button edit-button"
                              onClick={() => handleShowJawabanForm(surat.id)}
                              style={{ marginRight: 8 }}
                            >
                              Jawab
                            </button>
                            {showJawabanForm[surat.id] && (
                              <div style={{ marginTop: 8 }}>
                                <input
                                  type="date"
                                  value={jawabanInput[surat.id]?.tanggal_jawaban || ""}
                                  onChange={(e) => handleJawabanInput(surat.id, "tanggal_jawaban", e.target.value)}
                                  placeholder="Tanggal Jawaban"
                                  style={{ marginBottom: 4 }}
                                />
                                <input
                                  type="text"
                                  value={jawabanInput[surat.id]?.isi_jawaban || ""}
                                  onChange={(e) => handleJawabanInput(surat.id, "isi_jawaban", e.target.value)}
                                  placeholder="Isi Jawaban"
                                  style={{ marginBottom: 4 }}
                                />
                                <input
                                  type="text"
                                  value={jawabanInput[surat.id]?.file_path || ""}
                                  onChange={(e) => handleJawabanInput(surat.id, "file_path", e.target.value)}
                                  placeholder="File Path"
                                  style={{ marginBottom: 4 }}
                                />
                                <button
                                  className="button save-button"
                                  onClick={() => submitJawaban(surat.id)}
                                  style={{ marginLeft: 8 }}
                                >
                                  Kirim Jawaban
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        {user.role === "admin" && (
                          <button
                            className="button delete-button"
                            onClick={() => deleteSurat(surat.id)}
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteList;
