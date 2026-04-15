package models

import "time"

type Item struct {
	ID    uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	Code  string  `gorm:"unique;not null" json:"code"`
	Name  string  `gorm:"not null" json:"name"`
	Price float64 `gorm:"not null" json:"price"`
}

type Invoice struct {
	ID              uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	InvoiceNumber   string          `gorm:"unique;not null" json:"invoice_number"`
	SenderName      string          `gorm:"not null" json:"sender_name"`
	SenderAddress   string          `gorm:"not null" json:"sender_address"`
	ReceiverName    string          `gorm:"not null" json:"receiver_name"`
	ReceiverAddress string          `gorm:"not null" json:"receiver_address"`
	TotalAmount     float64         `gorm:"not null" json:"total_amount"`
	CreatedBy       uint            `gorm:"not null" json:"created_by"` // ID User
	CreatedAt       time.Time       `json:"created_at"`
	InvoiceDetails  []InvoiceDetail `gorm:"foreignKey:InvoiceID" json:"invoice_details"` // Relasi One-to-Many
}

type InvoiceDetail struct {
	ID        uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	InvoiceID uint    `gorm:"not null" json:"invoice_id"`
	ItemID    uint    `gorm:"not null" json:"item_id"`
	Item      Item    `gorm:"foreignKey:ItemID" json:"item"` // Untuk memanggil data item
	Quantity  int     `gorm:"not null" json:"quantity"`
	Price     float64 `gorm:"not null" json:"price"`
	Subtotal  float64 `gorm:"not null" json:"subtotal"`
}