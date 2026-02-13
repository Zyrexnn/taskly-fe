import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle2,
    Circle,
    Plus,
    Trash2,
    Edit2,
    X,
    Loader2,
    ListTodo,
    Users,
    LogOut,
    Menu,
    ChevronRight
} from 'lucide-react';
import type { Task } from '../services/api';
import { taskApi } from '../services/api';
import './Dashboard.css';

export default function DashboardPage() {
    const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                    <Link to="/dashboard" className="nav-item active">
                        <ListTodo size={20} />
                        <span>My Tasks</span>
                        <ChevronRight size={16} className="nav-arrow" />
                    </Link>
                    <Link to="/siswa" className="nav-item">
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
                        <h1>My Tasks</h1>
                        <p className="header-subtitle">Manage your tasks efficiently</p>
                    </div>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={20} />
                        <span>Add Task</span>
                    </button>
                </header>


                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-total">
                            <ListTodo size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{tasks.length}</span>
                            <span className="stat-label">Total Tasks</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-completed">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{completedCount}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-pending">
                            <Circle size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{pendingCount}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <section className="tasks-section">
                    <h3 className="section-title">Task List</h3>

                    {isLoading ? (
                        <div className="loading-state">
                            <Loader2 className="spinner-lg spinning" />
                            <p>Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📝</div>
                            <h4 className="empty-state-title">No tasks yet</h4>
                            <p>Create your first task to get started</p>
                            <button className="btn btn-primary mt-3" onClick={openCreateModal}>
                                <Plus size={20} />
                                Create Task
                            </button>
                        </div>
                    ) : (
                        <div className="task-list">
                            {tasks.map((task, index) => (
                                <div
                                    key={task.id}
                                    className={`task-card ${task.completed ? 'completed' : ''}`}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <button
                                        className="task-check"
                                        onClick={() => handleToggleComplete(task)}
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="check-icon checked" size={24} />
                                        ) : (
                                            <Circle className="check-icon" size={24} />
                                        )}
                                    </button>
                                    <div className="task-content">
                                        <h4 className="task-title">{task.title}</h4>
                                        {task.description && (
                                            <p className="task-description">{task.description}</p>
                                        )}
                                    </div>
                                    <div className="task-actions">
                                        <button
                                            className="btn btn-icon btn-secondary"
                                            onClick={() => openEditModal(task)}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="btn btn-icon btn-danger"
                                            onClick={() => handleDeleteClick(task.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    id="title"
                                    type="text"
                                    placeholder="Enter task title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    placeholder="Enter task description (optional)"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="spinning" size={18} />
                                            Saving...
                                        </>
                                    ) : (
                                        editingTask ? 'Update Task' : 'Create Task'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteDialogOpen && (
                <div className="modal-overlay" onClick={() => setIsDeleteDialogOpen(false)}>
                    <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Delete Task</h3>
                            <button className="modal-close" onClick={() => setIsDeleteDialogOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body p-4 text-center">
                            <div className="mb-4 text-danger">
                                <Trash2 size={48} className="mx-auto" />
                            </div>
                            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmDeleteTask}>
                                Delete Task
                            </button>
                        </div>
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
