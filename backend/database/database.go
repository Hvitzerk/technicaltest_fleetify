package database

import (
	"backend/models"
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	// DSN disesuaikan dengan isi docker-compose.yml 
	dsn := "host=127.0.0.1 user=admin password=secretpassword dbname=fleetify_invoice port=5433 sslmode=disable"
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi ke database!\n", err)
	}

	fmt.Println("Koneksi Database Berhasil!")
	DB = database

	// Menjalankan Auto-Migrate dari GORM
	err = DB.AutoMigrate(&models.Item{}, &models.Invoice{}, &models.InvoiceDetail{})
	if err != nil {
		log.Fatal("Gagal auto-migrate database!\n", err)
	}
	fmt.Println("Auto-Migrate Selesai!")

	// Jalankan Seeder
	SeedItems(DB)
}

func SeedItems(db *gorm.DB) {
	var count int64
	db.Model(&models.Item{}).Count(&count)

	// Jika tabel items masih kosong, masukkan data dummy
	if count == 0 {
		items := []models.Item{
			{Code: "BRG-001", Name: "Oli Mesin Super", Price: 150000},
			{Code: "BRG-002", Name: "Ban Truk Ukuran Besar", Price: 2500000},
			{Code: "BRG-003", Name: "Filter Udara", Price: 85000},
			{Code: "BRG-004", Name: "Kampas Rem Depan", Price: 350000},
		}
		db.Create(&items)
		fmt.Println("Seeder: Data Master Item berhasil ditambahkan!")
	} else {
		fmt.Println("Seeder: Data Master Item sudah ada, skip seeding.")
	}
}