package controllers

import (
	"backend/database"
	"backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetItems(c *fiber.Ctx) error {
	// Menangkap query parameter "code" (contoh: /api/items?code=BRG)
	code := c.Query("code")
	
	var items []models.Item

	// Jika user mengetik sesuatu, cari berdasarkan kode barang (menggunakan ILIKE agar tidak case-sensitive)
	if code != "" {
		database.DB.Where("code ILIKE ?", "%"+code+"%").Find(&items)
	} else {
		// Jika query kosong, tampilkan semua barang
		database.DB.Find(&items)
	}

	return c.JSON(fiber.Map{
		"message": "Berhasil mengambil data barang",
		"data":    items,
	})
}