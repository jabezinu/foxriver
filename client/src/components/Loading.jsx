export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="spinner border-green-500 border-t-transparent w-12 h-12 mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );
}
