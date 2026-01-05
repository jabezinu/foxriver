import { useState, useEffect } from 'react';
import { adminQnaAPI } from '../services/api';
import { HiPhotograph, HiPlus, HiTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

import ConfirmModal from '../components/ConfirmModal';

export default function QnaManagement() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await adminQnaAPI.getQna();
            setImages(res.data.qna);
        } catch (error) {
            toast.error('Failed to load help visuals');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!imageFile) return;

        const data = new FormData();
        data.append('image', imageFile);

        setUploading(true);
        try {
            await adminQnaAPI.upload(data);
            toast.success('Help image uploaded!');
            setImageFile(null);
            fetchImages();
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        try {
            await adminQnaAPI.delete(deleteId);
            toast.success('Help image removed');
            fetchImages();
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Remove Visual"
                message="Are you sure you want to remove this help image?"
                confirmText="Remove"
                isDangerous={true}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Q & A Visuals</h1>
                    <p className="text-sm text-gray-500">Manage instructional artwork and help center graphics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Upload */}
                <div className="lg:col-span-1">
                    <div className="admin-card flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-100 hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden">
                        <input
                            type="file" id="qna-img" className="hidden"
                            onChange={e => setImageFile(e.target.files[0])}
                        />
                        <label htmlFor="qna-img" className="text-center cursor-pointer z-10">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                <HiPlus className="text-3xl" />
                            </div>
                            <p className="text-xs font-bold text-gray-700 uppercase mb-1">
                                {imageFile ? imageFile.name : 'Add Visual'}
                            </p>
                            <p className="text-[8px] text-gray-400 uppercase font-bold tracking-tighter">Instructional PNG/JPG</p>
                        </label>
                        {imageFile && (
                            <button
                                onClick={handleUpload} disabled={uploading}
                                className="absolute inset-0 bg-indigo-600/95 flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest z-20"
                            >
                                {uploading ? 'Processing...' : 'Click to Upload'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Gallery */}
                <div className="lg:col-span-3">
                    <div className="admin-card">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Help Center Graphics ({images.length})</h3>
                        {loading ? (
                            <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Loading Visuals...</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {images.map((img) => (
                                    <div key={img._id} className="relative group rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                                        <img
                                            src={img.imageUrl.startsWith('http') ? img.imageUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${img.imageUrl}`}
                                            className="w-full aspect-[4/3] object-contain bg-gray-50"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <button
                                                onClick={() => handleDelete(img._id)}
                                                className="w-12 h-12 bg-white rounded-2xl text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                            >
                                                <HiTrash className="text-2xl" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {images.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-gray-300 font-bold uppercase tracking-widest">No instructional graphics found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
