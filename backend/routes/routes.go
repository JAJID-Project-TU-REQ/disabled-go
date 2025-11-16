package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/JAJID-Project-TU-REQ/back-disabled-go/handlers"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Auth routes
		api.POST("/auth/login", handlers.Login)
		api.POST("/auth/register", handlers.Register)
		
		// Users routes
		api.GET("/users/:id", handlers.GetProfile)
		api.PUT("/users/:id", handlers.UpdateUser)

		// Jobs routes
		api.GET("/jobs", handlers.GetJobs)
		api.GET("/jobs/:id", handlers.GetJob)
		api.POST("/jobs", handlers.CreateJob)
		api.PUT("/jobs/:id", handlers.UpdateJob)
		api.DELETE("/jobs/:id", handlers.DeleteJob)
		api.GET("/requesters/:id/jobs", handlers.GetRequesterJobs)

		// Applications routes
		api.POST("/jobs/:id/apply", handlers.ApplyToJob)
		api.POST("/jobs/:id/cancel", handlers.CancelApplication)
		api.POST("/applications/:id/accept", handlers.AcceptApplication)
		api.POST("/applications/:id/reject", handlers.RejectApplication)
		api.GET("/jobs/:id/applications", handlers.GetJobApplications)
		api.GET("/volunteers/:id/applications", handlers.GetVolunteerApplications)

		// Completion & reviews
		api.POST("/jobs/:id/complete", handlers.CompleteJob)
		api.POST("/jobs/:id/rating", handlers.SubmitRating)
		api.GET("/volunteers/:id/reviews", handlers.GetVolunteerReviews)
	}
}

