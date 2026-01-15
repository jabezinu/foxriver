import React from 'react';
import { HiPlus, HiCloudUpload, HiPhotograph, HiChip } from 'react-icons/hi';

export default function VisualUploadPanel({ imageFile, onFileChange, onUpload, uploading }) {
    return (
        <div className="space-y-6">
            <div className="relative group">
                <input
                    type="file" id="qna-img-upload" className="hidden"
                    onChange={e => onFileChange(e.target.files[0])}
                    disabled={uploading}
                />
                <label
                    htmlFor="qna-img-upload"
                    className={`flex flex-col items-center justify-center p-12 border-4 border-dashed rounded-[3rem] transition-all cursor-pointer relative overflow-hidden min-h-[320px] ${imageFile ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-200'
                        }`}
                >
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl mb-6 transition-all scale-110 ${imageFile ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-indigo-400 shadow-gray-100'
                            }`}>
                            {imageFile ? <HiPhotograph className="text-4xl" /> : <HiPlus className="text-4xl" />}
                        </div>

                        <div className="text-center space-y-2">
                            <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                                {imageFile ? 'Signal Captured' : 'Initialize Intake'}
                            </h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-relaxed max-w-[160px] mx-auto">
                                {imageFile ? `Artifact: ${imageFile.name}` : 'Drop instructional artwork or click to browse local matrix'}
                            </p>
                        </div>
                    </div>

                    {/* Industrial background element */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                        <HiChip className="text-[15rem] text-indigo-900" />
                    </div>
                </label>
            </div>

            {imageFile && (
                <button
                    onClick={onUpload}
                    disabled={uploading}
                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl ${uploading
                            ? 'bg-gray-100 text-gray-400 cursor-wait'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 active:scale-95'
                        }`}
                >
                    {uploading ? (
                        <div className="w-5 h-5 border-2 border-indigo-400 border-t-indigo-600 rounded-full animate-spin"></div>
                    ) : (
                        <HiCloudUpload className="text-xl" />
                    )}
                    {uploading ? 'Synchronizing Artifact...' : 'Transmit Visual to Core'}
                </button>
            )}

            <div className="p-6 bg-gray-800 rounded-3xl text-white shadow-2xl shadow-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex items-center gap-3 mb-4">
                    <HiChip className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">File Matrix Compliance</span>
                </div>
                <div className="space-y-2">
                    <Rule text="Maximum scale: 5120 KB" />
                    <Rule text="Allowed extensions: PNG, JPG, WEBP" />
                    <Rule text="Optimized for 4:3 aspect ratio" />
                </div>
            </div>
        </div>
    );
}

function Rule({ text }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{text}</p>
        </div>
    );
}
