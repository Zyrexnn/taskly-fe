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
    ChevronLeft
} from 'lucide-react';
import type { Siswa, CreateSiswaRequest } from '../services/api';
import { siswaApi } from '../services/api';
import { Button } from '../components/ui/button';
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
                        <h1 className="text-3xl font-bold text-foreground">Data Siswa</h1>
                        <p className="text-muted-foreground">Kelola data siswa dengan mudah</p>
                    </div>
                    <Button onClick={openCreateModal} className="gap-2">
                        <Plus size={20} />
                        <span>Tambah Siswa</span>
                    </Button>
                </header>

                {/* Search & Stats */}
                <div className="siswa-header mb-6 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama atau NIS..."
                            className="w-full pl-10 pr-4 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Total: <span className="font-bold text-primary">{total}</span> siswa
                    </div>
                </div>

                {/* Table Section */}
                <section className="bg-card border rounded-lg overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                            <Loader2 className="animate-spin h-10 w-10 text-primary" />
                            <p>Memuat data siswa...</p>
                        </div>
                    ) : siswaList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                            <Users size={64} className="opacity-20 mb-4" />
                            <h4 className="text-lg font-semibold text-foreground">Belum ada data siswa</h4>
                            <p className="mb-6">Mulai tambahkan data siswa pertama Anda</p>
                            <Button onClick={openCreateModal} className="gap-2">
                                <Plus size={20} />
                                Tambah Siswa
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">NIS</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>L/P</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead className="hidden md:table-cell">No. Telepon</TableHead>
                                        <TableHead className="hidden md:table-cell">Tahun Masuk</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {siswaList.map((siswa) => (
                                        <TableRow key={siswa.id} className="group">
                                            <TableCell className="font-bold">{siswa.nis}</TableCell>
                                            <TableCell>{siswa.nama}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${siswa.jenis_kelamin === 'L'
                                                        ? 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                                                        : 'bg-zinc-800 text-zinc-100'
                                                    }`}>
                                                    {siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{siswa.kelas || '-'}</TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">{siswa.no_telepon || '-'}</TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">{siswa.tahun_masuk || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditModal(siswa)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    >
                                                        <Edit2 size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(siswa.id)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
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
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={18} />
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Button
                                    key={p}
                                    variant={page === p ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setPage(p)}
                                    className="w-10 h-10"
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                )}
            </main>

            <SiswaDialog
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSiswaSubmit}
                editingSiswa={editingSiswa}
            />

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[99] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
