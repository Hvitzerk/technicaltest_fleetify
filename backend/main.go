package main

import (
	"backend/controllers"
	"backend/database"
	"backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// 1. Inisialisasi Database (Auto-Migrate & Seeding otomatis jalan)
	database.ConnectDB()

	// 2. Inisialisasi Fiber App
	app := fiber.New()

	// 3. test route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Backend Fleetify API Berjalan Mulus!")
	})

	// Route untuk login (mendapatkan token JWT)
	app.Post("/api/login", controllers.Login)

	// Route untuk mengambil data barang dengan optional query parameter "code"
	app.Get("/api/items", controllers.GetItems)

	// Route yang dilindungi middleware untuk menguji token JWT
	app.Get("/api/profile", middleware.Protected(), func(c *fiber.Ctx) error {
			// Ambil user_id dan role dari token JWT yang sudah diverifikasi oleh middleware
			userID := c.Locals("user_id")
			role := c.Locals("role")

			return c.JSON(fiber.Map{
				"message": "Berhasil masuk ke area rahasia!",
				"user_id": userID,
				"role":    role,
			})
		})

	app.Post("/api/invoices", middleware.Protected(), controllers.CreateInvoice)
	
	// 4. server on
	app.Listen(":8000")
}
