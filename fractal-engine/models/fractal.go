package models

import (
	"math"
)

type FractalRequest struct {
	Type       string  `json:"type"`
	Iterations int     `json:"iterations"`
	Size       string  `json:"size"`

	CenterX float64 `json:"centerX"`
	CenterY float64 `json:"centerY"`
	Zoom    float64 `json:"zoom"`
	DevMode bool `json:"devMode"`
}

type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	I int     `json:"i"`
}

type FractalResponse struct {
	Points []Point `json:"points"`
}

func HeavyMandelBrot(iteration int) float64 {
	result := 0.0
	for i := 0; i < iteration;  i++ {
		result += math.Sin(float64(i)) * math.Log(float64(i+1))
	}
	return result
}
