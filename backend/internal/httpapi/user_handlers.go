package httpapi

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"clt-or-pj/backend/internal/users"
)

type UserHandlers struct {
	repository *users.Repository
}

func NewUserHandlers(repository *users.Repository) *UserHandlers {
	return &UserHandlers{repository: repository}
}

func (h *UserHandlers) Me(c *gin.Context) {
	claims, _ := CurrentClaims(c)
	user, exists, err := h.repository.FindUserByID(claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                 user.ID,
		"name":               user.Name,
		"email":              user.Email,
		"role":               user.Role,
		"email_confirmed_at": user.EmailConfirmedAt,
		"created_at":         user.CreatedAt,
	})
}

func (h *UserHandlers) Calculations(c *gin.Context) {
	claims, _ := CurrentClaims(c)
	calculations, err := h.repository.ListUserCalculations(claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, calculations)
}
