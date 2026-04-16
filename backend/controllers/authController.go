package controllers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// Secret Key untuk menandatangani JWT 
var JwtSecret = []byte("rahasia_negara_fleetify")

// Struct untuk menerima data dari body request (JSON)
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func Login(c *fiber.Ctx) error {
	var req LoginRequest

	// Parsing body JSON dari frontend
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format request tidak valid",
		})
	}

	// Tentukan Role berdasarkan Dummy Credentials
	var role string
	var userID uint

	if req.Username == "admin" && req.Password == "admin123" {
		role = "Admin"
		userID = 1
	} else if req.Username == "kerani" && req.Password == "kerani123" {
		role = "Kerani"
		userID = 2
	} else {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Username atau Password salah",
		})
	}

	// Membuat Token JWT
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(), 
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate string token
	t, err := token.SignedString(JwtSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal membuat token",
		})
	}

	// Frontend response
	return c.JSON(fiber.Map{
		"message": "Login berhasil",
		"token":   t,
		"role":    role,
	})
}