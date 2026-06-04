package httpapi

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"clt-or-pj/backend/internal/auth"
)

func AuthRequired(tokenIssuer *auth.TokenIssuer) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, ok := ClaimsFromRequest(c, tokenIssuer)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid token"})
			c.Abort()
			return
		}

		c.Set(UserClaimsKey, claims)
		c.Next()
	}
}

func ClaimsFromRequest(c *gin.Context, tokenIssuer *auth.TokenIssuer) (auth.Claims, bool) {
	header := c.GetHeader("Authorization")
	if header == "" {
		return auth.Claims{}, false
	}

	rawToken := strings.TrimPrefix(header, "Bearer ")
	if rawToken == header || rawToken == "" {
		return auth.Claims{}, false
	}

	claims, err := tokenIssuer.Verify(rawToken)
	if err != nil {
		return auth.Claims{}, false
	}

	return claims, true
}

func CurrentClaims(c *gin.Context) (auth.Claims, bool) {
	value, exists := c.Get(UserClaimsKey)
	if !exists {
		return auth.Claims{}, false
	}

	claims, ok := value.(auth.Claims)
	return claims, ok
}
