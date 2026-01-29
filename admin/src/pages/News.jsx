import { useState, useEffect } from 'react';
import { adminNewsAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiPlus, HiRefresh } from 'react-icons/hi';
import PageHeader from '../components/shared/PageHeader';
import NewsCard from '../components/NewsCard';
import NewsModal from '../components/NewsModal';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';

export default function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', showAsPopup: false, targetRanks: [] });
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchNews(); }, []);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const res = await adminNewsAPI.getAll();
            setNews(res.data.news);
        } catch (error) { toast.error('Signal Loss: Intelligence pool inaccessible'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Format data for submission - if targetRanks is empty, send null/empty to mean "All"
            // But backend handles empty array/null same way? 
            // Controller: if (!item.targetRanks || item.targetRanks.length === 0) return true;
            // So sending [] is fine.
            // Note: Since we use FormData in backend if file is present (wait, update uses JSON usually, create uses Multipart?),
            // let's check creating logic in News.jsx.
            // Wait, create uses 'adminNewsAPI.create(formData)'.
            // In api.js: create: (data) => axios.post(..., data, { headers: { 'Content-Type': 'multipart/form-data' } })
            // So we must convert formData object to FormData instance locally?
            // Wait, existing code: `await adminNewsAPI.create(formData);`
            // `formData` state is an object `{ title: '', ... }`.
            // If `adminNewsAPI.create` expects an object and converts it to FormData?
            // No, the user provided code in `api.js` line 87: `create: (data) => axios.post(API_ENDPOINTS.NEWS, data, ...)`
            // Axios doesn't auto-convert simple object -> FormData unless we do it manually or pass HTMLFormElement.
            // If `formData` is just a JS object, Axios sends JSON if not FormData.
            // BUT header is set to `multipart/form-data`. This is actually WRONG in the existing code unless `formData` IS a FormData object.
            // However, `formData` in `News.jsx` is initialized as `{...}` object.
            // This suggests the existing "Create" MIGHT be broken for file uploads OR it works because axios might ignore the content-type header if body is JSON?
            // Actually, if header is manually set to multipart/form-data and body is JSON, it usually FAILS.
            // But let's look at `NewsModal.jsx`. It doesn't seem to have file upload input in the form?
            // It has Title, Content, Popup. No file input visible in the viewed file `NewsModal.jsx`.
            // So maybe it sends JSON with the wrong header and the backend tolerates it?
            // In backend `createNews` uses `upload.single('image')`.
            // If no image is sent, Multer might pass through.
            // But if I want to send `targetRanks` (array) via Multipart, I need to STRINGIFY it.
            // `formData.targetRanks` is array.
            
            // Let's ensure we send what backend expects.
            // If I look at the existing `News.jsx`, it passes `formData` (JS Object) directly to `adminNewsAPI.create`.
            // If `adminNewsAPI.create` forces `multipart/form-data`, then passing a JS object is problematic.
            
            // Solution: I will construct a FormData object if submitting 'create', or just fix the API call to not force multipart if no image.
            // But I should stick to the current pattern. If the current `NewsModal` DOES NOT have image upload, maybe I don't need to worry about image yet.
            // The file `NewsModal.jsx` I viewed DOES NOT have an image input.
            // Backend `createNews` checks `req.file`.
            
            // I will Convert to FormData inside `handleSubmit` if needed, OR just update `targetRanks`.
            // Given the user said "send messages... to specific rank levels", let's assume the existing code works for title/content.
            // I will update the code to handle `targetRanks` properly.
            
            // Actually, if I just add `targetRanks` to the state, and pass it, it might work if it's just JSON.
            // But wait, the header is `multipart/form-data` in `api.js`.
            // If I send a plain object with the header set to multipart, Axios might try to serialize it? No.
            // This looks like a bug in existing code or my understanding.
            // However, I will simply update `targetRanks` in the state.
            // AND I will update `handleSubmit` to convert to FormData because arrays in Multipart need special handling (or stringifying).
            
            const submissionData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'targetRanks') {
                    submissionData.append(key, JSON.stringify(formData[key]));
                } else {
                    submissionData.append(key, formData[key]);
                }
            });
             
            if (editingId) {
                // Update often uses JSON in this project?
                // api.js update: uses default headers (JSON) usually unless specified.
                // adminNewsAPI.update line 90: `axios.put(..., data)` -> Default JSON.
                // So Update works with JSON.
                await adminNewsAPI.update(editingId, { ...formData, targetRanks: formData.targetRanks });
                toast.success('Briefing Synchronized');
            } else {
                // Create uses Multipart header potentially.
                // IF keeping existing behavior: usage of `adminNewsAPI.create(formData)` with object.
                // I will try to support both.
                
                // Let's just pass `formData` but with `targetRanks` included.
                // If it fails, I'll know.
                // But `createNews` backend logic: `const { ... } = req.body`.
                // If Multipart, `req.body` is populated by Multer. Multer handles text fields.
                // If I send JSON object with Multipart header, it's garbled.
                // EXCEPT if the existing code actually uses `FormData`.
                
                // Let's modify `handleSubmit` to use FormData for CREATE just to be safe, adhering to the `api.js` contract.
                
                // Wait, `NewsModal` calls `onSubmit` (which is `handleSubmit` in `News.jsx`).
                // I'll stick to updating `News.jsx` assuming `targetRanks` needs to be in `formData`.
            
                 if (editingId) {
                    await adminNewsAPI.update(editingId, formData);
                    toast.success('Briefing Synchronized');
                } else {
                    // Start FormData construction
                    const data = new FormData();
                    data.append('title', formData.title);
                    data.append('content', formData.content);
                    data.append('showAsPopup', formData.showAsPopup);
                    // Pass targetRanks as string
                    data.append('targetRanks', JSON.stringify(formData.targetRanks || []));
                    
                    await adminNewsAPI.create(data); 
                    toast.success('Global Broadcast Initiated');
                }
            }
            setShowModal(false);
            resetForm();
            fetchNews();
        } catch (error) { toast.error('Release Failure'); }
        finally { setSubmitting(false); }
    };

    const confirmDelete = async () => {
        try {
            await adminNewsAPI.delete(deleteId);
            toast.success('Briefing Terminated');
            fetchNews();
        } catch (error) { toast.error('Command Rejected'); }
        finally { setDeleteId(null); }
    };

    const handleEdit = (newsItem) => {
        setFormData({
            title: newsItem.title,
            content: newsItem.content,
            showAsPopup: newsItem.showAsPopup || false,
            targetRanks: newsItem.targetRanks || []
        });
        setEditingId(newsItem._id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ title: '', content: '', showAsPopup: false, targetRanks: [] });
        setEditingId(null);
    };
    // ...


    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn space-y-8">
            <ConfirmModal
                isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete}
                title="Terminate Global Briefing"
                message="Are you certain you wish to purge this intelligence packet? This will permanently sever the broadcast signal for all agents."
                confirmText="Terminate Signal" isDangerous={true}
            />

            <PageHeader
                title="Intelligence Center"
                subtitle="Create and broadcast critical news packets to all network personnel."
                extra={
                    <div className="flex gap-3">
                        <button onClick={fetchNews} className="admin-btn-secondary flex items-center gap-2">
                            <HiRefresh /> Refresh Signals
                        </button>
                        <button onClick={() => { resetForm(); setShowModal(true); }} className="admin-btn-primary flex items-center gap-2">
                            <HiPlus /> Initiate Release
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {news.map((item) => (
                    <NewsCard
                        key={item._id}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={setDeleteId}
                    />
                ))}
            </div>

            {news.length === 0 && (
                <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-gray-300">
                    <p className="font-black uppercase tracking-[0.4em] text-[10px] mb-6">Signals Clear: No Active Intelligence Pkts</p>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="text-indigo-600 font-black text-xs uppercase hover:underline">
                        Initiate First Broadcast
                    </button>
                </div>
            )}

            <NewsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                editingId={editingId}
                formData={formData}
                onChange={setFormData}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </div>
    );
}
