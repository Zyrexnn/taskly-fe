import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    CheckCircle2,
    Plus,
    Trash2,
    Edit2,
    X,
    Loader2,
    ListTodo,
    Users,
    LogOut,
    Menu,
    Search,
    Sun,
    Moon,
    ClipboardList
} from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../components/ui/pagination";

import type { Task } from '../services/api';

import { taskApi } from '../services/api';
import './Dashboard.css';

export default function DashboardPage() {
    const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);


    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const response = await taskApi.getAll();
            if (response.success && response.data) {
                setTasks(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tasks, searchQuery]);

    const paginatedTasks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTasks, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingTask) {
                const response = await taskApi.update(editingTask.id, formData);
                if (response.success && response.data) {
                    setTasks(tasks.map(t => t.id === editingTask.id ? response.data! : t));
                }
            } else {
                const response = await taskApi.create(formData);
                if (response.success && response.data) {
                    setTasks([...tasks, response.data]);
                }
            }
            closeModal();
        } catch (error) {
            console.error('Failed to save task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setCurrentTaskId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteTask = async () => {
        if (currentTaskId === null) return;

        try {
            const response = await taskApi.delete(currentTaskId);
            if (response.success) {
                setTasks(tasks.filter(t => t.id !== currentTaskId));
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
        } finally {
            setIsDeleteDialogOpen(false);
            setCurrentTaskId(null);
        }
    };

    const handleToggleComplete = async (task: Task) => {
        try {
            const response = await taskApi.update(task.id, { completed: !task.completed });
            if (response.success && response.data) {
                setTasks(tasks.map(t => t.id === task.id ? response.data! : t));
            }
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const openCreateModal = () => {
        setEditingTask(null);
        setFormData({ title: '', description: '' });
        setShowModal(true);
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setFormData({ title: task.title, description: task.description });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTask(null);
        setFormData({ title: '', description: '' });
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.filter(t => !t.completed).length;

    return (
        <div className="dashboard-container">
            {/* Sidebar with unique design */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'is-visible' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <ClipboardList className="brand-icon" size={28} />
                        <span className="brand-name">Taskly</span>
                    </div>
                </div>

                <nav className="nav-menu">
                    <Link to="/dashboard" className="nav-link active">
                        <div className="nav-inner">
                            <ListTodo size={22} />
                            <span>Dashboard</span>
                        </div>
                        <div className="active-dot" />
                    </Link>
                    <Link to="/siswa" className="nav-link">
                        <div className="nav-inner">
                            <Users size={22} />
                            <span>Students</span>
                        </div>
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
                            <h2>Hello, {user?.name?.split(' ')[0]}!</h2>
                            <p>Here's what's happening with your projects today.</p>
                        </div>
                    </div>

                    <div className="header-right">
                        <button className="theme-switcher" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <button className="btn-add-primary" onClick={openCreateModal}>
                            <Plus size={20} />
                            <span>Create Task</span>
                        </button>
                    </div>
                </header>

                <div className="dashboard-content">
                    {/* Zen Stats Overlay */}
                    <div className="bento-stats">
                        <div className="bento-item">
                            <p className="bento-label">Overall Tasks</p>
                            <h3 className="bento-value">{tasks.length}</h3>
                        </div>
                        <div className="bento-item">
                            <p className="bento-label">Completed</p>
                            <h3 className="bento-value">{completedCount}</h3>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }} 
                                />
                            </div>
                        </div>
                        <div className="bento-item">
                            <p className="bento-label">In Progress</p>
                            <h3 className="bento-value">{pendingCount}</h3>
                        </div>
                    </div>

                    {/* Simple Control Bar */}
                    <div className="task-controls">
                        <div className="search-wrap">
                            <Search className="search-icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search tasks..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Task List */}
                    <section className="task-board">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="spinning" size={40} />
                                <p className="text-muted font-medium">Loading workspace...</p>
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                                <ListTodo size={60} className="opacity-10" />
                                <h4 className="font-bold">No tasks found</h4>
                                <button className="btn-add-primary" onClick={openCreateModal}>
                                    <Plus size={20} />
                                    Initialize First Task
                                </button>
                            </div>
                        ) : (
                            <div className="task-grid">
                                {paginatedTasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        className={`task-element ${task.completed ? 'is-done' : ''}`}
                                        style={{ '--index': index } as React.CSSProperties}
                                    >
                                        <div className="task-header">
                                            <button
                                                className={`task-toggle ${task.completed ? 'checked' : ''}`}
                                                onClick={() => handleToggleComplete(task)}
                                            >
                                                {task.completed && <CheckCircle2 size={16} />}
                                            </button>
                                            <div className="task-content">
                                                <h4 className="task-name">{task.title}</h4>
                                                {task.description && (
                                                    <p className="task-info">{task.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="task-actions">
                                            <button
                                                className="action-btn"
                                                onClick={() => openEditModal(task)}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeleteClick(task.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Shadcn Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            href="#" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                                            }}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink 
                                                href="#" 
                                                isActive={currentPage === page}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(page);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext 
                                            href="#" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                            }}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}

                </div>
            </main>

            {/* Modern Modal System */}
            {showModal && (
                <div className="modern-modal-overlay" onClick={closeModal}>
                    <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modern-modal-header">
                            <h3>{editingTask ? 'Refine Task' : 'New Objective'}</h3>
                            <button className="close-btn" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modern-form">
                            <div className="input-group">
                                <label>Task Title</label>
                                <input
                                    type="text"
                                    placeholder="What needs to be done?"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Context (Optional)</label>
                                <textarea
                                    placeholder="Add some details..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="modern-modal-footer">
                                <button type="button" className="btn-plain" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-accent" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="spinning" size={18} /> : (editingTask ? 'Save Changes' : 'Initialize Task')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteDialogOpen && (
                <div className="modern-modal-overlay" onClick={() => setIsDeleteDialogOpen(false)}>
                    <div className="modern-modal modal-danger" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-inner">
                            <div className="danger-icon">
                                <Trash2 size={32} />
                            </div>
                            <h3>Remove Task?</h3>
                            <p>This will permanently erase the task from your board. This cannot be reversed.</p>
                            <div className="modern-modal-footer">
                                <button className="btn-plain" onClick={() => setIsDeleteDialogOpen(false)}>
                                    Go Back
                                </button>
                                <button className="btn-danger-action" onClick={confirmDeleteTask}>
                                    Erase Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {sidebarOpen && (
                <div className="modern-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    );
}
