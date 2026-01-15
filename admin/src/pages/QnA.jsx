import { useState, useEffect } from 'react';
import { adminQnaAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import PageHeader from '../components/shared/PageHeader';
import QnaVisualCard from '../components/QnaVisualCard';
import VisualUploadPanel from '../components/VisualUploadPanel';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';

export default function QnaManagement() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => { fetchImages(); }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await adminQnaAPI.getQna();
            setImages(res.data.qna);
        } catch (error) { toast.error('Signal Loss: Intelligence visual pool inaccessible'); }
        finally { setLoading(false); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!imageFile) return;

        const data = new FormData();
        data.append('image', imageFile);

        setUploading(true);
        try {
            await adminQnaAPI.upload(data);
            toast.success('Visual Sync Complete');
            setImageFile(null);
            fetchImages();
        } catch (error) { toast.error('Transmission Failure'); }
        finally { setUploading(false); }
    };

    const confirmDelete = async () => {
        try {
            await adminQnaAPI.delete(deleteId);
            toast.success('Visual Decommissioned');
            fetchImages();
        } catch (error) { toast.error('Command Terminated'); }
        finally { setDeleteId(null); }
    };

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn space-y-8">
            <ConfirmModal
                isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete}
                title="Decommission Intelligence Visual"
                message="Are you certain you wish to purge this instructional artifact? This will immediately sever the visual relay for all agents."
                confirmText="Decommission Artifact" isDangerous={true}
            />

            <PageHeader
                title="Intelligence Visual Matrix"
                subtitle="Manage instructional graphics and help center visuals deployed across the personnel network."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Control Panel */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
                    <VisualUploadPanel
                        imageFile={imageFile}
                        onFileChange={setImageFile}
                        onUpload={handleUpload}
                        uploading={uploading}
                    />
                </div>

                {/* Artifact Pool */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-[0.2em] mb-1">Signal Registry</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{images.length} Verified instructional artifacts detected</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-8">
                        {images.map((img) => (
                            <QnaVisualCard
                                key={img.id || img._id}
                                img={img}
                                onDelete={setDeleteId}
                            />
                        ))}
                    </div>

                    {images.length === 0 && (
                        <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-gray-300">
                            <p className="font-black uppercase tracking-[0.4em] text-[10px]">No Instructional Signals Found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
