import { useState, useEffect } from 'react';
import {
    X,
    Loader2,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap
} from 'lucide-react';
import { Button } from './ui/button';
import type { Siswa, CreateSiswaRequest } from '../services/api';

interface SiswaDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateSiswaRequest) => Promise<void>;
    editingSiswa: Siswa | null;
}

export default function SiswaDialog({ isOpen, onClose, onSubmit, editingSiswa }: SiswaDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    useEffect(() => {
        if (editingSiswa) {
            setFormData({
                nis: editingSiswa.nis,
                nama: editingSiswa.nama,
                jenis_kelamin: editingSiswa.jenis_kelamin,
                tempat_lahir: editingSiswa.tempat_lahir || '',
                tanggal_lahir: editingSiswa.tanggal_lahir ? editingSiswa.tanggal_lahir.split('T')[0] : '',
                alamat: editingSiswa.alamat || '',
                no_telepon: editingSiswa.no_telepon || '',
                email: editingSiswa.email || '',
                kelas: editingSiswa.kelas || '',
                tahun_masuk: editingSiswa.tahun_masuk || new Date().getFullYear()
            });
        } else {
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
        }
    }, [editingSiswa, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Failed to submit:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        {editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nis">
                                <User size={14} className="mr-2 inline" />
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
                                <GraduationCap size={14} className="mr-2 inline" />
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
                                <MapPin size={14} className="mr-2 inline" />
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
                                <Calendar size={14} className="mr-2 inline" />
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
                            <MapPin size={14} className="mr-2 inline" />
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
                                <Phone size={14} className="mr-2 inline" />
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
                                <Mail size={14} className="mr-2 inline" />
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
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="spinning" size={18} />
                                    Menyimpan...
                                </>
                            ) : (
                                editingSiswa ? 'Update Data' : 'Tambah Siswa'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
