import { MoveLeft, Settings } from "lucide-react";
import { type Data } from "../utils/types";
import { useState, useRef, useEffect } from "react";
import { generateFractal } from "../utils/request";

interface FractalProps {
    onNavigate: (page: 'Home' | 'Fractal') => void;
}

const Fractal: React.FC<FractalProps> = ({ onNavigate }) => {

    const [formData, setFormData] = useState<Data>({
        type: 'mandelbrot',
        iterations: 2000,
        size: 'medium'
    });

    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: name === 'iteration' ? parseInt(value) || 0 : value
        }));
    };

    const handleApply = async () => {
        try {
            const response = await generateFractal(formData);

            if (response?.points) {
                setPoints(response.points);

                setScale(1);
                setOffset({ x: 0, y: 0 });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || points.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }

        const scaleX = canvas.width / (maxX - minX);
        const scaleY = canvas.height / (maxY - minY);
        const baseScale = Math.min(scaleX, scaleY);

        for (let i = 0; i < points.length; i++) {
            const p = points[i];

            const x = ((p.x - minX) * baseScale) * scale + offset.x;
            const y = ((p.y - minY) * baseScale) * scale + offset.y;

            ctx.fillStyle = `hsl(${(i % 360)}, 100%, 50%)`;

            ctx.fillRect(x, y, 1, 1);
        }

    }, [points, scale, offset]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();

        const zoomFactor = 1.1;
        const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;

        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;

        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;

        setOffset(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
        }));

        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    return (
        <div className="h-screen w-screen p-5">

            <div className="flex items-center">
                <button onClick={() => onNavigate('Home')} className="btn btn-circle btn-primary">
                    <MoveLeft />
                </button>
                <h1 className="mx-auto">Fractal Explorer</h1>
            </div>

            <div className="grid grid-cols-5 h-full">

                {/* SETTINGS */}
                <div className="col-span-1 p-4">
                    <div className="flex gap-2 font-bold">
                        <Settings />
                        Settings
                    </div>

                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="mandelbrot">Mandelbrot</option>
                        <option value="barnsley">Barnsley</option>
                    </select>

                    <label>Iteration</label>
                    <input
                        type="number"
                        name="iteration"
                        value={formData.iterations}
                        onChange={handleChange}
                    />

                    <label>Size</label>
                    <select name="size" value={formData.size} onChange={handleChange}>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>

                    <button className="btn btn-primary mt-4" onClick={handleApply}>
                        Apply
                    </button>
                </div>

                {/* CANVAS */}
                <div className="col-span-4 flex justify-center items-center">
                    <canvas
                        ref={canvasRef}
                        width={900}
                        height={600}
                        className="border"
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </div>

            </div>
        </div>
    );
};

export default Fractal;