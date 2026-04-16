package controllers

import (
	"backend/database"
	"backend/models"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Struct ini sudah disesuaikan dengan kebutuhan models.go milikmu
type InvoiceRequest struct {
	SenderName      string `json:"sender_name"`
	SenderAddress   string `json:"sender_address"`
	ReceiverName    string `json:"receiver_name"`
	ReceiverAddress string `json:"receiver_address"`
	Items           []struct {
		ItemID   uint `json:"item_id"`
		Quantity int  `json:"quantity"`
	} `json:"items"`
}

func CreateInvoice(c *fiber.Ctx) error {
	var req InvoiceRequest

	// Parse body JSON
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Format data tidak valid"})
	}

	
	// ZERO-TRUST LOGIC 
	
	rawUserID := c.Locals("user_id")
	if rawUserID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Akses ditolak, User tidak teridentifikasi"})
	}
	userID := uint(rawUserID.(float64)) // Ambil ID Kasir dari JWT

	
	// transaksi Database 
	
	tx := database.DB.Begin()

	// Fitur pengaman: Jika terjadi panic/crash, otomatis Rollback
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	invoiceNumber := fmt.Sprintf("INV-%d", time.Now().Unix())

	// TAHAP 1: Simpan ke tabel Invoice (Menggunakan field dari models.go kamu!)
	invoice := models.Invoice{
		InvoiceNumber:   invoiceNumber,
		SenderName:      req.SenderName,
		SenderAddress:   req.SenderAddress,
		ReceiverName:    req.ReceiverName,
		ReceiverAddress: req.ReceiverAddress,
		CreatedBy:       userID, // Zero Trust: Pakai ID dari JWT
		TotalAmount:     0,
		CreatedAt:       time.Now(),
	}

	if err := tx.Create(&invoice).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal membuat struk invoice utama"})
	}

	var grandTotal float64

	// TAHAP 2: Simpan ke tabel InvoiceDetail
	for _, itemReq := range req.Items {
		var masterItem models.Item
		
		// Zero-Trust: Cari harga asli dari database
		if err := tx.First(&masterItem, itemReq.ItemID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("Barang dengan ID %d tidak ditemukan", itemReq.ItemID),
			})
		}

		subtotal := masterItem.Price * float64(itemReq.Quantity)
		grandTotal += subtotal

		// Menggunakan struct models.InvoiceDetail milikmu!
		invoiceDetail := models.InvoiceDetail{
			InvoiceID: invoice.ID,
			ItemID:    masterItem.ID,
			Quantity:  itemReq.Quantity,
			Price:     masterItem.Price, // Catat harga satuan
			Subtotal:  subtotal,
		}

		if err := tx.Create(&invoiceDetail).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan detail barang"})
		}
	}

	// TAHAP 3: Update TotalAmount di tabel Invoices utama
	if err := tx.Model(&invoice).Update("TotalAmount", grandTotal).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal mengupdate total harga"})
	}

	tx.Commit()

	return c.JSON(fiber.Map{
		"message":        "Invoice berhasil diterbitkan!",
		"invoice_number": invoiceNumber,
	})
}