export default function Loading() {
    return (
        <div className="flex items-center justify-center p-20 w-full h-full">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Processing Intelligence...</p>
            </div>
        </div>
    );
}
