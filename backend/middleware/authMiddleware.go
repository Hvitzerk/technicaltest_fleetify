package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// Secret Key harus sama persis dengan yang ada di authController
var JwtSecret = []byte("rahasia_negara_fleetify")

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// 1. Ambil header Authorization dari request Frontend/Postman
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Akses ditolak. Token tidak ditemukan.",
			})
		}

		// 2. Pastikan formatnya bener: "Bearer <token_panjang_kamu>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Format token tidak valid. Gunakan 'Bearer <token>'.",
			})
		}

		tokenString := parts[1]

		// 3. Cek keaslian Token menggunakan Secret Key
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return JwtSecret, nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token tidak valid atau sudah expired.",
			})
		}

		// 4. Kalau token asli, ambil data User ID & Role-nya, simpan di memori sementara (Locals)
		claims, ok := token.Claims.(jwt.MapClaims)
		if ok && token.Valid {
			c.Locals("user_id", claims["user_id"])
			c.Locals("role", claims["role"])
		}

		// 5. Izinkan lewat ke fungsi selanjutnya (Endpoint tujuan)
		return c.Next()
	}
}