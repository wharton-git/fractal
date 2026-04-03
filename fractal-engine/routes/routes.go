package routes

import (
	"fractal-engine/controllers"
	"time"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Configuration du CORS
	r.Use(cors.New(cors.Config{
		// AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowAllOrigins: true,
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge: 12 * time.Hour,
	}))

	r.GET("/api/stress", controllers.StressTest)

	r.POST("/api/generate", controllers.GenerateFractal)

	return r
}