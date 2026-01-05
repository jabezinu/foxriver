import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { HiRefresh } from 'react-icons/hi';

const CanvasCaptcha = forwardRef(({ onCaptchaChange }, ref) => {
    const canvasRef = useRef(null);
    const [randomString, setRandomString] = useState("");

    // Generate random color
    const randomColor = (min, max) => {
        const r = Math.floor(Math.random() * (max - min) + min);
        const g = Math.floor(Math.random() * (max - min) + min);
        const b = Math.floor(Math.random() * (max - min) + min);
        return `rgb(${r},${g},${b})`;
    };

    const drawCaptcha = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background color
        ctx.fillStyle = randomColor(200, 255); // Light pastel background
        ctx.fillRect(0, 0, width, height);

        // Generate Text
        const chars = '0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setRandomString(code);
        onCaptchaChange(code);

        // Draw Text
        for (let i = 0; i < 4; i++) {
            const char = code[i];
            const fontSize = Math.floor(Math.random() * 10) + 24; // 24-34px (slightly larger)
            ctx.font = `bold ${fontSize}px monospace`;
            ctx.fillStyle = randomColor(50, 150); // Darker text color

            ctx.save();
            // Position
            const x = 35 + i * 25; // Adjusted spacing for 4 digits
            const y = 35;

            // Rotation
            const angle = (Math.random() - 0.5) * 0.4; // Slightly reduced rotation

            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }

        // Add Noise (Lines)
        for (let i = 0; i < 7; i++) {
            ctx.strokeStyle = randomColor(100, 200);
            ctx.lineWidth = Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        // Add Noise (Dots)
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = randomColor(100, 200);
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, 2 * Math.PI);
            ctx.fill();
        }

    }, [onCaptchaChange]); // onCaptchaChange should be stable

    useImperativeHandle(ref, () => ({
        refreshCaptcha: () => {
            drawCaptcha();
        }
    }));

    useEffect(() => {
        drawCaptcha();
    }, [drawCaptcha]);

    return (
        <div className="flex items-center gap-3">
            <div
                className="relative overflow-hidden rounded-xl border border-white/20 shadow-inner group/captcha cursor-pointer"
                onClick={drawCaptcha}
                title="Click to refresh image"
            >
                <canvas
                    ref={canvasRef}
                    width={160}
                    height={50}
                    className="block"
                />
            </div>
            <button
                type="button"
                onClick={drawCaptcha}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-green-400/70 hover:text-green-400 transition-all active:scale-95"
                title="Refresh Captcha"
            >
                <HiRefresh className="text-xl" />
            </button>
        </div>
    );
});

export default CanvasCaptcha;
