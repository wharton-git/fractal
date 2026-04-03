package routes

import (
	"fractal-engine/controllers"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.GET("/api/stress", controllers.StressTest)

	r.POST("/api/generate", controllers.GenerateFractal)

	return r
}