import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import "../styles/styles.css";
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
  const [jawabanSurat, setJawabanSurat] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [petugasList, setPetugasList] = useState([]);
  const [formInput, setFormInput] = useState({
    no_surat: "",
    tanggal: "",
    pengirim: "",
    perihal: "",
    file_path: "",
    user_id_tujuan: ""
  });
  const [allUsers, setAllUsers] = useState([]);
  // Tambahkan state untuk edit role user
  const [editRole, setEditRole] = useState({}); // { [userId]: role }

  const { logout, user, isAuthenticated, token, authAxios } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Gunakan useCallback agar getSuratMasuk bisa masuk dependency useEffect tanpa warning
  const getSuratMasuk = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const response = await authAxios.get('/surat-masuk');
      setSuratMasuk(response.data);
    } catch (error) {
      console.error("Fetch surat masuk error:", error, error.response);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
        navigate('/login');
      } else {
        setError(
          error.response?.data?.message ||
          "Failed to load surat masuk. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [authAxios, logout, navigate]);

  // Ambil jawaban surat dari backend
  const getJawabanSurat = useCallback(async () => {
    try {
      const response = await authAxios.get('/jawaban-surat');
      setJawabanSurat(response.data);
    } catch (error) {
      // Optional: tampilkan error jika perlu
    }
  }, [authAxios]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }
    getSuratMasuk();
    getJawabanSurat();
    // Untuk admin, refresh juga data jawaban surat
    const interval = setInterval(() => {
      getSuratMasuk();
      getJawabanSurat();
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token, navigate, getSuratMasuk, getJawabanSurat]);

  // Ambil daftar petugas saat form create dibuka
  useEffect(() => {
    if (showCreateForm && user && user.role === "user") {
      authAxios.get("/users?role=petugas")
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setPetugasList(res.data);
          } else {
            setPetugasList([]);
          }
        })
        .catch(() => setPetugasList([]));
    }
  }, [showCreateForm, user, authAxios]);

  // Ambil semua user untuk admin
  useEffect(() => {
    if (user && user.role === "admin") {
      authAxios.get("/users")
        .then(res => setAllUsers(res.data))
        .catch(() => setAllUsers([]));
    }
  }, [user, authAxios]);

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
      // Setelah kirim jawaban, update status surat menjadi "Selesai"
      await authAxios.patch(`/surat-masuk/${id}/status`, { status: "Selesai" });
      setShowJawabanForm((prev) => ({ ...prev, [id]: false }));
      setJawabanInput((prev) => ({ ...prev, [id]: {} }));
      // Hot reload data
      getSuratMasuk();
      getJawabanSurat();
    } catch (error) {
      setError("Failed to submit jawaban. Please try again.");
    }
  };

  // Handler untuk submit surat masuk
  const handleCreateSurat = async (e) => {
    e.preventDefault();
    try {
      await authAxios.post("/surat-masuk", formInput);
      setShowCreateForm(false);
      getSuratMasuk();
    } catch (err) {
      setError("Gagal mengirim surat.");
    }
  };

  const getAvatar = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  // Filter surat masuk berdasarkan search dan role
  const filteredSurat = suratMasuk.filter((surat) => {
    const query = searchQuery.toLowerCase();
    if (!user) return false;
    // Semua role: tampilkan semua surat masuk
    return (
      surat.no_surat?.toLowerCase().includes(query) ||
      surat.pengirim?.toLowerCase().includes(query) ||
      (surat.perihal || "").toLowerCase().includes(query)
    );
  });

  // Fungsi update role user (admin only)
  const handleRoleChange = (userId, newRole) => {
    setEditRole(prev => ({ ...prev, [userId]: newRole }));
  };

  const saveRoleChange = async (userId) => {
    try {
      const newRole = editRole[userId];
      if (!newRole) return;
      await authAxios.patch(`/users/${userId}/role`, { role: newRole });
      // Refresh daftar user
      const res = await authAxios.get("/users");
      setAllUsers(res.data);
      setEditRole(prev => ({ ...prev, [userId]: undefined }));
    } catch (err) {
      alert("Gagal mengubah role user.");
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="header-content">
          <h1>Surat Masuk</h1>
          {/* Tombol untuk menulis surat, khusus user */}
          {user && user.role === "user" && (
            <button
              className="button edit-button"
              style={{
                marginLeft: 24,
                padding: "8px 20px",
                fontSize: 15,
                borderRadius: 10,
                background: "linear-gradient(135deg,#6a82fb,#fc5c7d)",
                color: "#fff",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)"
              }}
              onClick={() => {
                setShowCreateForm(true);
                setFormInput({
                  no_surat: "",
                  tanggal: "",
                  pengirim: user?.username || "",
                  perihal: "",
                  file_path: "",
                  user_id_tujuan: ""
                });
              }}
            >
              + Tulis Surat
            </button>
          )}
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

      <div className="notes-container" style={{ display: "flex", justifyContent: "center" }}>
        <div className="gmail-list-container" style={{
          width: "100%",
          maxWidth: 1500, // diperlebar dari 900 ke 1200
          margin: "32px auto",
          borderRadius: 18,
          background: "rgba(40,40,50,0.45)",
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.18)",
          padding: 0,
        }}>
          <div className="notes-list">
            <h2 style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 24,
              padding: "24px 32px 8px 32px",
              margin: 0,
              letterSpacing: 1
            }}>Daftar Surat Masuk</h2>
            {loading ? (
              <div className="empty-notes">Loading...</div>
            ) : filteredSurat.length === 0 ? (
              <div className="empty-notes" style={{ color: "#fff", padding: 32 }}>
                {searchQuery ? "Tidak ada surat yang cocok" : "Belum ada surat masuk."}
              </div>
            ) : (
              <div>
                {/* Gmail-style list */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  margin: "0 0 16px 0"
                }}>
                  {/* Header row */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 32px",
                    fontWeight: 700,
                    color: "#6a82fb",
                    borderBottom: "2px solid #6a82fb33",
                    background: "transparent"
                  }}>
                    <div style={{ width: 44, marginRight: 24 }}></div>
                    <div style={{ flex: 2, minWidth: 0 }}>No Surat / Perihal</div>
                    {(user.role === "admin" || user.role === "petugas") && (
                      <div style={{ flex: 1, minWidth: 120, textAlign: "center" }}>Pengirim</div>
                    )}
                    {user.role === "admin" && (
                      <div style={{ flex: 1, minWidth: 120, textAlign: "center" }}>Tujuan</div>
                    )}
                    <div style={{ flex: 1, minWidth: 120, textAlign: "center" }}>Status</div>
                    {(user.role === "petugas" || user.role === "admin") && (
                      <div style={{ flex: 1, minWidth: 180, textAlign: "right" }}>Aksi</div>
                    )}
                  </div>
                  {/* Data rows */}
                  {filteredSurat.map((surat) => (
                    <div
                      key={surat.id}
                      className="gmail-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "18px 32px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: 0,
                        transition: "background 0.2s, box-shadow 0.2s",
                        cursor: "pointer",
                        position: "relative",
                        backdropFilter: "blur(2px)",
                        WebkitBackdropFilter: "blur(2px)",
                        ...(surat.status === "Ditolak" && { opacity: 0.6 }),
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
                      onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: "linear-gradient(135deg,#6a82fb,#fc5c7d)",
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 20, marginRight: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                      }}>
                        {surat.pengirim?.charAt(0).toUpperCase() || "?"}
                      </div>
                      {/* Main info */}
                      <div style={{ flex: 2, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {surat.no_surat} &nbsp; <span style={{ color: "#bdbdbd", fontWeight: 400 }}>{surat.perihal}</span>
                        </div>
                        <div style={{
                          color: "#bdbdbd",
                          fontSize: 14,
                          marginTop: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {user.role === "user"
                            ? `Tanggal: ${surat.tanggal}`
                            : `Dari: ${surat.pengirim} | ${surat.tanggal}`}
                        </div>
                        {/* Selalu tampilkan file_path jika ada, untuk semua role */}
                        {surat.file_path && (
                          <div style={{
                            marginTop: 8,
                            color: "#fff",
                            background: "rgba(33,150,243,0.10)",
                            borderRadius: 8,
                            padding: "8px 12px",
                            fontSize: 15,
                            maxHeight: 120,
                            overflowY: "auto",
                            wordBreak: "break-word"
                          }}>
                            <b>Isi Surat:</b>
                            <div style={{ marginTop: 4 }}>{surat.file_path}</div>
                          </div>
                        )}
                      </div>
                      {/* Pengirim (admin/petugas only) */}
                      {(user.role === "admin" || user.role === "petugas") && (
                        <div style={{ flex: 1, minWidth: 120, textAlign: "center" }}>
                          {surat.pengirim}
                        </div>
                      )}
                      {/* Tujuan (admin only) */}
                      {user.role === "admin" && (
                        <div style={{ flex: 1, minWidth: 120, textAlign: "center" }}>
                          {surat.user_id_tujuan}
                        </div>
                      )}
                      {/* Status & Dropdown */}
                      <div style={{
                        flex: 1,
                        minWidth: 180,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 8
                      }}>
                        <span
                          className={
                            "status-badge " +
                            (surat.status === "Selesai"
                              ? "status-selesai"
                              : surat.status === "Ditolak"
                              ? "status-ditolak"
                              : "status-menunggu")
                          }
                        >
                          {surat.status}
                        </span>
                        {(user.role === "petugas" || user.role === "admin") && (
                          <select
                            value={statusUpdate[surat.id] || surat.status}
                            onChange={(e) => handleStatusChange(surat.id, e.target.value)}
                            style={{
                              borderRadius: 8,
                              padding: "2px 8px",
                              background: "#232526",
                              color: "#fff",
                              border: "1px solid #444",
                              fontSize: 13,
                              minWidth: 120
                            }}
                          >
                            <option value="Menunggu Jawaban">Menunggu Jawaban</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Ditolak">Ditolak</option>
                          </select>
                        )}
                        {(user.role === "petugas" || user.role === "admin") && statusUpdate[surat.id] && statusUpdate[surat.id] !== surat.status && (
                          <button
                            className="button save-button"
                            style={{ padding: "2px 10px", fontSize: 13 }}
                            onClick={() => updateStatus(surat.id, statusUpdate[surat.id])}
                          >
                            Simpan
                          </button>
                        )}
                      </div>
                      {/* Actions: tampilkan hanya untuk petugas & admin */}
                      {(user.role === "petugas" || user.role === "admin") && (
                        <div style={{
                          flex: 1,
                          minWidth: 180,
                          textAlign: "right",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: 8,
                          flexDirection: "row"
                        }}>
                          {user.role === "petugas" && (
                            <>
                              <button
                                className="button edit-button"
                                onClick={e => { e.stopPropagation(); handleShowJawabanForm(surat.id); }}
                                style={{
                                  padding: "4px 14px",
                                  borderRadius: 8,
                                  background: "rgba(33,150,243,0.15)",
                                  color: "#2196f3",
                                  fontWeight: 600,
                                  border: "none"
                                }}
                              >
                                Jawab
                              </button>
                              {showJawabanForm[surat.id] && (
                                <div style={{
                                  marginTop: 8, background: "rgba(30,30,40,0.95)", borderRadius: 12,
                                  padding: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", position: "absolute", right: 24, zIndex: 10, minWidth: 320
                                }}>
                                  <form onSubmit={e => { e.preventDefault(); submitJawaban(surat.id); }}>
                                    <div className="form-group">
                                      <label>Tanggal Jawaban</label>
                                      <input
                                        type="date"
                                        value={jawabanInput[surat.id]?.tanggal_jawaban || ""}
                                        onChange={e => handleJawabanInput(surat.id, "tanggal_jawaban", e.target.value)}
                                        required
                                        style={{
                                          marginBottom: 8, width: "100%", borderRadius: 6, border: "1px solid #444",
                                          padding: 6, background: "#232526", color: "#fff"
                                        }}
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Isi Jawaban</label>
                                      <textarea
                                        value={jawabanInput[surat.id]?.isi_jawaban || ""}
                                        onChange={e => handleJawabanInput(surat.id, "isi_jawaban", e.target.value)}
                                        placeholder="Tulis isi jawaban di sini..."
                                        style={{
                                          marginBottom: 8, width: "100%", borderRadius: 6, border: "1px solid #444",
                                          padding: 6, background: "#232526", color: "#fff", minHeight: 80, resize: "vertical"
                                        }}
                                        required
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>Catatan/Referensi (Opsional)</label>
                                      <textarea
                                        value={jawabanInput[surat.id]?.file_path || ""}
                                        onChange={e => handleJawabanInput(surat.id, "file_path", e.target.value)}
                                        placeholder="Catatan atau referensi tambahan (opsional)"
                                        style={{
                                          marginBottom: 8, width: "100%", borderRadius: 6, border: "1px solid #444",
                                          padding: 6, background: "#232526", color: "#fff", minHeight: 60, resize: "vertical"
                                        }}
                                      />
                                    </div>
                                    <button
                                      className="button save-button"
                                      type="submit"
                                      style={{ marginLeft: 0, marginTop: 4, width: "100%", borderRadius: 8, padding: "6px 0", fontWeight: 600 }}
                                    >
                                      Kirim Jawaban
                                    </button>
                                  </form>
                                </div>
                              )}
                            </>
                          )}
                          {user.role === "admin" && (
                            <button
                              className="button delete-button"
                              onClick={e => { e.stopPropagation(); deleteSurat(surat.id); }}
                              style={{
                                padding: "4px 14px", borderRadius: 8,
                                background: "rgba(244,67,54,0.15)", color: "#f44336", fontWeight: 600, border: "none"
                              }}
                            >
                              Hapus
                            </button>
                          )}
                          {/* Untuk admin: hanya hapus, tidak bisa membalas */}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Tampilkan balasan surat dari petugas ke user */}
            <div style={{ margin: "32px 0 0 0" }}>
              <h2 style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 20,
                padding: "16px 32px 8px 32px",
                margin: 0,
                letterSpacing: 1
              }}>Daftar Surat Balasan dari Petugas</h2>
              {jawabanSurat.length === 0 ? (
                <div className="empty-notes" style={{ color: "#fff", padding: 24 }}>
                  Belum ada surat balasan.
                </div>
              ) : (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  margin: "0 0 16px 0"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 32px",
                    fontWeight: 700,
                    color: "#6a82fb",
                    borderBottom: "2px solid #6a82fb33",
                    background: "transparent"
                  }}>
                    <div style={{ flex: 1 }}>No Surat</div>
                    <div style={{ flex: 2 }}>Isi Balasan</div>
                    <div style={{ flex: 1 }}>Tanggal Balasan</div>
                    <div style={{ flex: 1 }}>Petugas</div>
                    <div style={{ flex: 1 }}>User</div>
                    <div style={{ flex: 2 }}>Tentang</div>
                  </div>
                  {jawabanSurat
                    .filter(j =>
                      user && user.role === "admin"
                        ? true // admin lihat semua balasan
                        : user && user.role === "user"
                        ? j.surat_masuk && String(j.surat_masuk.user_id_pengirim) === String(user.id)
                        : user && user.role === "petugas"
                        ? j.surat_masuk && String(j.surat_masuk.user_id_tujuan) === String(user.id)
                        : false
                    )
                    .map(j => (
                      <div key={j.id} style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 32px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        color: "#fff",
                        background: "rgba(255,255,255,0.04)"
                      }}>
                        <div style={{ flex: 1 }}>{j.surat_masuk?.no_surat || "-"}</div>
                        <div style={{
                          flex: 2,
                          background: "rgba(33,150,243,0.10)",
                          borderRadius: 8,
                          padding: "8px 12px",
                          color: "#fff",
                          fontSize: 15,
                          maxHeight: 120,
                          overflowY: "auto",
                          wordBreak: "break-word"
                        }}>
                          {j.isi_jawaban}
                        </div>
                        <div style={{ flex: 1 }}>{j.tanggal_jawaban}</div>
                        <div style={{ flex: 1 }}>{j.surat_masuk?.user_id_tujuan || "-"}</div>
                        <div style={{ flex: 1 }}>{j.surat_masuk?.pengirim || "-"}</div>
                        <div style={{
                          flex: 2,
                          background: "rgba(255,255,255,0.07)",
                          borderRadius: 8,
                          padding: "8px 12px",
                          color: "#fff",
                          fontSize: 15,
                          maxHeight: 120,
                          overflowY: "auto",
                          wordBreak: "break-word"
                        }}>
                          {/* Kolom tentang: file_path dari jawaban_surat */}
                          {j.file_path || "-"}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Tampilkan daftar user untuk admin */}
      {user && user.role === "admin" && (
        <div style={{
          margin: "32px auto 0 auto",
          maxWidth: 700,
          background: "rgba(40,40,50,0.45)",
          borderRadius: 16,
          boxShadow: "0 4px 16px rgba(31,38,135,0.13)",
          padding: 0
        }}>
          <h2 style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            padding: "16px 32px 8px 32px",
            margin: 0,
            letterSpacing: 1
          }}>Daftar User</h2>
          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 32px",
            fontWeight: 700,
            color: "#6a82fb",
            borderBottom: "2px solid #6a82fb33",
            background: "transparent"
          }}>
            <div style={{ flex: 2 }}>Username</div>
            <div style={{ flex: 3 }}>Email</div>
            <div style={{ flex: 1, textAlign: "center" }}>Role</div>
            <div style={{ flex: 1, textAlign: "center" }}>Aksi</div>
          </div>
          {allUsers.length === 0 ? (
            <div style={{ color: "#fff", padding: 24 }}>Tidak ada user.</div>
          ) : (
            allUsers.map(u => (
              <div key={u.id} style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 32px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                background: "rgba(255,255,255,0.04)"
              }}>
                <div style={{ flex: 2 }}>{u.username}</div>
                <div style={{ flex: 3 }}>{u.email}</div>
                <div style={{
                  flex: 1,
                  textAlign: "center",
                  fontWeight: 600,
                  color: u.role === "admin" ? "#ffb300" : u.role === "petugas" ? "#29b6f6" : "#fff"
                }}>
                  {editRole[u.id] !== undefined ? (
                    <select
                      value={editRole[u.id]}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      style={{
                        background: "#232526",
                        color: "#fff",
                        borderRadius: 6,
                        border: "1px solid #444",
                        padding: "2px 8px",
                        fontWeight: 600
                      }}
                    >
                      <option value="user">User</option>
                      <option value="petugas">Petugas</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    typeof u.role === "string" && u.role.length > 0
                      ? (u.role.charAt(0).toUpperCase() + u.role.slice(1))
                      : (u.role || "-")
                  )}
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  {editRole[u.id] !== undefined ? (
                    <>
                      <button
                        className="button save-button"
                        style={{ marginRight: 8, padding: "2px 12px", fontSize: 13 }}
                        onClick={() => saveRoleChange(u.id)}
                      >
                        Simpan
                      </button>
                      <button
                        className="button cancel-button"
                        style={{ padding: "2px 12px", fontSize: 13 }}
                        onClick={() => setEditRole(prev => ({ ...prev, [u.id]: undefined }))}
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <button
                      className="button edit-button"
                      style={{ padding: "2px 12px", fontSize: 13 }}
                      onClick={() => setEditRole(prev => ({ ...prev, [u.id]: u.role }))}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Form Create Surat Masuk (User & Petugas) */}
      {showCreateForm && user && (user.role === "user" || user.role === "petugas") && (
        <div style={{
          background: "rgba(30,30,40,0.98)",
          borderRadius: 16,
          padding: 32,
          maxWidth: 480,
          margin: "32px auto",
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18)",
          position: "relative"
        }}>
          <h3 style={{ color: "#fff", marginBottom: 18 }}>
            {user.role === "user" ? "Kirim Surat ke Petugas" : "Kirim Surat ke User"}
          </h3>
          <form onSubmit={handleCreateSurat}>
            <div className="form-group">
              <label>No Surat</label>
              <input
                type="text"
                value={formInput.no_surat}
                onChange={e => setFormInput({ ...formInput, no_surat: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Tanggal</label>
              <input
                type="date"
                value={formInput.tanggal}
                onChange={e => setFormInput({ ...formInput, tanggal: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Perihal</label>
              <input
                type="text"
                value={formInput.perihal}
                onChange={e => setFormInput({ ...formInput, perihal: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Isi Surat</label>
              <textarea
                value={formInput.file_path}
                onChange={e => setFormInput({ ...formInput, file_path: e.target.value })}
                placeholder="Tulis isi surat di sini..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  borderRadius: 8,
                  border: "1px solid #444",
                  padding: 8,
                  background: "#232526",
                  color: "#fff",
                  fontSize: 15,
                  resize: "vertical"
                }}
                required
              />
            </div>
            <div className="form-group">
              <label>
                {user.role === "user" ? "Tujuan Petugas" : "Tujuan User"}
              </label>
              <div style={{
                background: "rgba(40,40,50,0.95)",
                borderRadius: 8,
                border: "1px solid #444",
                padding: "2px 8px",
                marginTop: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.13)"
              }}>
                <select
                  value={formInput.user_id_tujuan}
                  onChange={e => setFormInput({ ...formInput, user_id_tujuan: e.target.value })}
                  required
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "none",
                    outline: "none",
                    fontSize: 15,
                    width: "100%",
                    padding: "8px 0",
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  <option value="" style={{ color: "#bdbdbd" }}>
                    {user.role === "user" ? "Pilih Petugas" : "Pilih User"}
                  </option>
                  {petugasList && petugasList.length > 0 ? (
                    petugasList.map(petugas => (
                      <option
                        key={petugas.id}
                        value={petugas.id}
                        style={{
                          background: "#232526",
                          color: "#fff",
                          fontWeight: 500,
                          padding: "8px"
                        }}
                      >
                        {petugas.username} ({petugas.email})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled style={{ color: "#bdbdbd" }}>
                      {user.role === "user"
                        ? "Tidak ada petugas tersedia"
                        : "Tidak ada user tersedia"}
                    </option>
                  )}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              <button type="submit" className="button save-button">Kirim</button>
              <button type="button" className="button cancel-button" onClick={() => setShowCreateForm(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NoteList;
