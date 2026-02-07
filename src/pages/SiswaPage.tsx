import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Trash2,
    Edit2,
    X,
    Loader2,
    ListTodo,
    Users,
    LogOut,
    Menu,
    ChevronRight,
    Search,
    ChevronLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap
} from 'lucide-react';
import type { Siswa, CreateSiswaRequest } from '../services/api';
import { siswaApi } from '../services/api';
import './Dashboard.css';
import './Siswa.css';

export default function SiswaPage() {
    const { user, logout } = useAuth();
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    // Form Data
    const [formData, setFormData] = useState<CreateSiswaRequest>({
        nis: '',
        nama: '',
        jenis_kelamin: 'L',
        tempat_lahir: '',
        tanggal_lahir: '',
        alamat: '',
        no_telepon: '',
        email: '',
        kelas: '',
        tahun_masuk: new Date().getFullYear()
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchSiswa();
    }, [page, searchDebounce]);

    const fetchSiswa = async () => {
        setIsLoading(true);
        try {
            const response = await siswaApi.getAll(page, limit, searchDebounce);
            if (response.success && response.data) {
                setSiswaList(response.data.data);
                setTotal(response.data.total);
                setTotalPages(response.data.total_pages);
            }
        } catch (error) {
            console.error('Failed to fetch siswa:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingSiswa) {
                const response = await siswaApi.update(editingSiswa.id, formData);
                if (response.success) {
                    fetchSiswa();
                }
            } else {
                const response = await siswaApi.create(formData);
                if (response.success) {
                    fetchSiswa();
                }
            }
            closeModal();
        } catch (error) {
            console.error('Failed to save siswa:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return;

        try {
            const response = await siswaApi.delete(id);
            if (response.success) {
                fetchSiswa();
            }
        } catch (error) {
            console.error('Failed to delete siswa:', error);
        }
    };

    const openCreateModal = () => {
        setEditingSiswa(null);
        setFormData({
            nis: '',
            nama: '',
            jenis_kelamin: 'L',
            tempat_lahir: '',
            tanggal_lahir: '',
            alamat: '',
            no_telepon: '',
            email: '',
            kelas: '',
            tahun_masuk: new Date().getFullYear()
        });
        setShowModal(true);
    };

    const openEditModal = (siswa: Siswa) => {
        setEditingSiswa(siswa);
        setFormData({
            nis: siswa.nis,
            nama: siswa.nama,
            jenis_kelamin: siswa.jenis_kelamin,
            tempat_lahir: siswa.tempat_lahir || '',
            tanggal_lahir: siswa.tanggal_lahir ? siswa.tanggal_lahir.split('T')[0] : '',
            alamat: siswa.alamat || '',
            no_telepon: siswa.no_telepon || '',
            email: siswa.email || '',
            kelas: siswa.kelas || '',
            tahun_masuk: siswa.tahun_masuk || new Date().getFullYear()
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSiswa(null);
    };

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon">✓</span>
                        <span className="logo-text">Taskly</span>
                    </div>
                    <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-item">
                        <ListTodo size={20} />
                        <span>My Tasks</span>
                        <ChevronRight size={16} className="nav-arrow" />
                    </Link>
                    <Link to="/siswa" className="nav-item active">
                        <Users size={20} />
                        <span>Data Siswa</span>
                        <ChevronRight size={16} className="nav-arrow" />
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-email">{user?.email}</span>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={logout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="main-header">
                    <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div>
                        <h1>Data Siswa</h1>
                        <p className="header-subtitle">Kelola data siswa dengan mudah</p>
                    </div>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={20} />
                        <span>Tambah Siswa</span>
                    </button>
                </header>

                {/* Search & Stats */}
                <div className="siswa-header">
                    <div className="search-box">
                        <Search className="search-box-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama atau NIS..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="siswa-stats">
                        <span>Total: <strong>{total}</strong> siswa</span>
                    </div>
                </div>

                {/* Table */}
                <section className="siswa-section">
                    {isLoading ? (
                        <div className="loading-state">
                            <Loader2 className="spinner-lg spinning" />
                            <p>Memuat data siswa...</p>
                        </div>
                    ) : siswaList.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">👨‍🎓</div>
                            <h4 className="empty-state-title">Belum ada data siswa</h4>
                            <p>Mulai tambahkan data siswa pertama Anda</p>
                            <button className="btn btn-primary mt-3" onClick={openCreateModal}>
                                <Plus size={20} />
                                Tambah Siswa
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>NIS</th>
                                            <th>Nama</th>
                                            <th>L/P</th>
                                            <th>Kelas</th>
                                            <th>No. Telepon</th>
                                            <th>Tahun Masuk</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {siswaList.map((siswa) => (
                                            <tr key={siswa.id}>
                                                <td><strong>{siswa.nis}</strong></td>
                                                <td>{siswa.nama}</td>
                                                <td>
                                                    <span className={`badge ${siswa.jenis_kelamin === 'L' ? 'badge-info' : 'badge-warning'}`}>
                                                        {siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                    </span>
                                                </td>
                                                <td>{siswa.kelas || '-'}</td>
                                                <td>{siswa.no_telepon || '-'}</td>
                                                <td>{siswa.tahun_masuk || '-'}</td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="btn btn-icon btn-secondary"
                                                            onClick={() => openEditModal(siswa)}
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-icon btn-danger"
                                                            onClick={() => handleDelete(siswa.id)}
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            className={`pagination-btn ${page === p ? 'active' : ''}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="nis">
                                        <User size={14} style={{ marginRight: '0.5rem', verticalAlign: '-2px' }} />
                                        NIS
                                    </label>
                                    <input
                                        id="nis"
                                        type="text"
                                        placeholder="Nomor Induk Siswa"
                                        value={formData.nis}
                                        onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="nama">
                                        <GraduationCap size={14} style={{ marginRight: '0.5rem', verticalAlign: '-2px' }} />
                                        Nama Lengkap
                                    </label>
                                    <input
                                        id="nama"
                                        type="text"
                                        placeholder="Nama lengkap siswa"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="jenis_kelamin">Jenis Kelamin</label>
                                    <select
                                        id="jenis_kelamin"
                                        value={formData.jenis_kelamin}
                                        onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                                        required
                                    >
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="kelas">Kelas</label>
                                    <input
                                        id="kelas"
                                        type="text"
                                        placeholder="Contoh: XII IPA 1"
                                        value={formData.kelas}
                                        onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="tempat_lahir">
                                        <MapPin size={14} style={{ marginRight: '0.5rem', verticalAlign: '-2px' }} />
                                        Tempat Lahir
                                    </label>
                                    <input
                                        id="tempat_lahir"
                                        type="text"
                                        placeholder="Kota tempat lahir"
                                        value={formData.tempat_lahir}
                                        onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tanggal_lahir">
                                        <Calendar size={14} style={{ marginRight: '0.5rem', verticalAlign: '-2px' }} />
                                        Tanggal Lahir
                                    </label>
                                    <input
                                        id="tanggal_lahir"
                                        type="date"
                                        value={formData.tanggal_lahir}
                                        onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="alamat">
                                    <MapPin size={14} style={{ marginRight: '0.5rem', verticalAlign: '-2px' }} />
                                    Alamat
                                </label>
                                <textarea
                                    id="alamat"
                                    placeholder="Alamat lengkap siswa"
                                    value={formData.alamat}
                                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="no_telepon">
                                        <Phone size={14} style={{ marginRight: '0.5rem', verticalAlign: '-2px' }} />
                                        No. Telepon
                                    </label>
                                    <input
                                        id="no_telepon"
                                        type="tel"
                                        placeholder="08xxxxxxxxxx"
                                        value={formData.no_telepon}
                                        onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <Mail size={14} style={{ marginRight: '0.5rem', verticalAlign: '-2px' }} />
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="tahun_masuk">Tahun Masuk</label>
                                <input
                                    id="tahun_masuk"
                                    type="number"
                                    placeholder="2024"
                                    value={formData.tahun_masuk}
                                    onChange={(e) => setFormData({ ...formData, tahun_masuk: parseInt(e.target.value) })}
                                    min="2000"
                                    max="2100"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="spinning" size={18} />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        editingSiswa ? 'Update Data' : 'Tambah Siswa'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
}
