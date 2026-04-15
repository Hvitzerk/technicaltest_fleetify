package main

import (
	"backend/database"
	"github.com/gofiber/fiber/v2"
)

func main() {
	// 1. Inisialisasi Database (Auto-Migrate & Seeding otomatis jalan)
	database.ConnectDB()

	// 2. Inisialisasi Fiber App
	app := fiber.New()

	// 3. route test
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Backend Fleetify API Berjalan Mulus!")
	})

	// 4. server on
	app.Listen(":8000")
}