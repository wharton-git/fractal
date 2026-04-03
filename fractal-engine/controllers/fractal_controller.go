package controllers

import (
	"fractal-engine/models"
	"math/rand"
	"net/http"
	"github.com/gin-gonic/gin"
)

// pour le stress test
func StressTest(c *gin.Context) {
	complexity := 10000
	result := 0.0
	for i := 0; i < complexity; i++ {
		result += 1.0
	}
	c.JSON(http.StatusOK, gin.H{"status": "stressed", "val": result})
}

func GenerateFractal(c *gin.Context) {
	var req models.FractalRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var points []models.Point

	switch req.Type {
	case "mandelbrot":
		points = generateMandelbrot(req.Iterations, req.Size)
	case "barnsley":
		points = generateBarnsley(req.Iterations)
	}

	c.JSON(http.StatusOK, models.FractalResponse{Points: points})
}

func generateMandelbrot(iters int, sizeStr string) []models.Point {

	res := 100
	if sizeStr == "medium" {
		res = 300
	}
	if sizeStr == "large" {
		res = 600
	}

	points := make([]models.Point, 0)

	for px := 0; px < res; px++ {
		for py := 0; py < res; py++ {

			x0 := float64(px)/float64(res)*3.5 - 2.5
			y0 := float64(py)/float64(res)*2.0 - 1.0

			x, y := 0.0, 0.0
			iteration := 0
			for x*x+y*y <= 4 && iteration < iters {
				xtemp := x*x - y*y + x0
				y = 2*x*y + y0
				x = xtemp
				iteration++
			}

			if iteration == iters {
				points = append(points, models.Point{X: float64(px), Y: float64(py)})
			}
		}
	}
	return points
}

func generateBarnsley(iters int) []models.Point {
	points := make([]models.Point, iters)
	x, y := 0.0, 0.0

	for i := 0; i < iters; i++ {
		r := rand.Float64()
		var nextX, nextY float64

		if r < 0.01 {
			nextX = 0
			nextY = 0.16 * y
		} else if r < 0.86 {
			nextX = 0.85*x + 0.04*y
			nextY = -0.04*x + 0.85*y + 1.6
		} else if r < 0.93 {
			nextX = 0.2*x - 0.26*y
			nextY = 0.23*x + 0.22*y + 1.6
		} else {
			nextX = -0.15*x + 0.28*y
			nextY = 0.26*x + 0.24*y + 0.44
		}
		x, y = nextX, nextY

		points[i] = models.Point{X: x * 50, Y: y * 50}
	}
	return points
}
