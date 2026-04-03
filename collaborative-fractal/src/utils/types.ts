export type Page = 'Home' | 'Fractal'

export type Data = {
    type : 'mandelbrot' | 'barnsley';
    iterations : number;
    size : 'small' | 'medium' | 'large';
}

export type Point = {
    x: number;
    y: number;
};

export type FractalResponse = {
    points: Point[];
};