import axios, { type AxiosResponse } from "axios";
import { type Data, type FractalResponse } from "./types";


export async function generateFractal(data: Data): Promise<FractalResponse | null> {
    try {
        const response: AxiosResponse<FractalResponse> = await axios.post(
            "http://192.168.83.66:6543/api/generate", 
            data
        );

        return response.data; 
    } catch (error) {
        console.error("Error while generating fractal", error);
        return null;
    }
}