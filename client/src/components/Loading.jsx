import logo from '../assets/logo.png';

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
            <div className="relative">
                <img 
                    src={logo} 
                    alt="Loading" 
                    className="w-72 h-72 object-contain animate-pulse"
                />
            </div>
        </div>
    );
}
