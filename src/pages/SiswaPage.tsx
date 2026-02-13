import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Plus,
    Trash2,
    Edit2,
    Loader2,
    ListTodo,
    Users,
    LogOut,
    Menu,
    Search,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon,
    ClipboardList
} from 'lucide-react';
import type { Siswa, CreateSiswaRequest } from '../services/api';
import { siswaApi } from '../services/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import SiswaDialog from '../components/SiswaDialog';
import './Dashboard.css';
import './Siswa.css';

export default function SiswaPage() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

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

    const handleSiswaSubmit = async (formData: CreateSiswaRequest) => {
        if (editingSiswa) {
            await siswaApi.update(editingSiswa.id, formData);
        } else {
            await siswaApi.create(formData);
        }
        fetchSiswa();
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
        setShowModal(true);
    };

    const openEditModal = (siswa: Siswa) => {
        setEditingSiswa(siswa);
        setShowModal(true);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar consistent with Dashboard */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'is-visible' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <ClipboardList className="brand-icon" size={28} />
                        <span className="brand-name">Taskly</span>
                    </div>
                </div>

                <nav className="nav-menu">
                    <Link to="/dashboard" className="nav-link">
                        <div className="nav-inner">
                            <ListTodo size={22} />
                            <span>Dashboard</span>
                        </div>
                    </Link>
                    <Link to="/siswa" className="nav-link active">
                        <div className="nav-inner">
                            <Users size={22} />
                            <span>Students</span>
                        </div>
                        <div className="active-dot" />
                    </Link>
                </nav>

                <div className="sidebar-profile">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                            <p className="profile-name">{user?.name}</p>
                            <button className="btn-signout" onClick={logout}>
                                <LogOut size={14} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Surface */}
            <main className="dashboard-main">
                <header className="content-header">
                    <div className="header-left">
                        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div className="welcome-text">
                            <h2>Student Registry</h2>
                            <p>Managing {total} students in your database.</p>
                        </div>
                    </div>

                    <div className="header-right">
                        <button className="theme-switcher" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <button className="btn-add-primary" onClick={openCreateModal}>
                            <Plus size={20} />
                            <span>Add Student</span>
                        </button>
                    </div>
                </header>

                <div className="dashboard-content">
                    {/* Controls Bar */}
                    <div className="task-controls">
                        <div className="search-wrap">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or NIS..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table Section */}
                    <section className="siswa-section">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="spinning" size={40} />
                                <p className="text-muted font-medium">Loading database...</p>
                            </div>
                        ) : siswaList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                                <Users size={60} className="opacity-10" />
                                <h4 className="font-bold">No students found</h4>
                                <button className="btn-add-primary" onClick={openCreateModal}>
                                    <Plus size={20} />
                                    Initialize First Student
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table className="registry-table">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>NIS</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Gender</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead className="hidden md:table-cell">Phone</TableHead>
                                            <TableHead className="hidden md:table-cell">Year</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {siswaList.map((siswa) => (
                                            <TableRow key={siswa.id}>
                                                <TableCell className="font-bold">{siswa.nis}</TableCell>
                                                <TableCell className="font-medium">{siswa.nama}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${siswa.jenis_kelamin === 'L'
                                                            ? 'bg-text-primary text-bg-primary'
                                                            : 'border border-text-primary text-text-primary'
                                                        }`}>
                                                        {siswa.jenis_kelamin === 'L' ? 'Male' : 'Female'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{siswa.kelas || '-'}</TableCell>
                                                <TableCell className="hidden md:table-cell">{siswa.no_telepon || '-'}</TableCell>
                                                <TableCell className="hidden md:table-cell">{siswa.tahun_masuk || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="table-actions">
                                                        <button
                                                            onClick={() => openEditModal(siswa)}
                                                            className="action-btn"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(siswa.id)}
                                                            className="action-btn delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </section>

                    {/* Pagination */}
                    {totalPages > 1 && !isLoading && (
                        <div className="flex items-center justify-center gap-3 mt-10">
                            <button
                                className="action-btn"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${page === p ? "bg-text-primary text-bg-primary" : "bg-bg-card hover:bg-bg-secondary text-text-muted"}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="action-btn"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <SiswaDialog
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSiswaSubmit}
                editingSiswa={editingSiswa}
            />

            {sidebarOpen && (
                <div
                    className="modern-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
