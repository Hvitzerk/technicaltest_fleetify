import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useWizardStore, WizardItem } from "../store/useWizardStore";
import { useItemSearch } from "../lib/useItemSearch"; // 🔌 Kabel pencarian kita colok di sini
import api from "../lib/axios";

export default function Wizard() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Panggil isi dari brankas Zustand
  const {
    step,
    sender_name,
    sender_address,
    receiver_name,
    receiver_address,
    items, // State untuk daftar barang
    setClientData,
    setItems, // Fungsi untuk mengubah daftar barang
    nextStep,
    prevStep,
  } = useWizardStore();

  // Panggil "Senjata Rahasia" Debounce & React Query kita
  const { searchTerm, setSearchTerm, data: searchResult, isLoading, isError } = useItemSearch();

  useEffect(() => {
    setIsMounted(true);
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  if (!isMounted) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  // Fungsi untuk memasukkan barang hasil cari ke dalam tabel
  const handleAddItem = (itemFromApi: { id: number; code: string; name: string; price: number }) => {
    // Cek apakah barang sudah ada di tabel
    const existingItem = items.find((i) => i.item_id === itemFromApi.id);
    
    if (existingItem) {
      // Kalau sudah ada, tambah quantity-nya saja
      const updatedItems = items.map((i) =>
        i.item_id === itemFromApi.id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
          : i
      );
      setItems(updatedItems);
    } else {
      // Kalau belum ada, masukkan sebagai baris baru
      const newItem: WizardItem = {
        item_id: itemFromApi.id,
        code: itemFromApi.code,
        name: itemFromApi.name,
        price: itemFromApi.price,
        quantity: 1,
        subtotal: itemFromApi.price, // Qty 1 x Harga
      };
      setItems([...items, newItem]);
    }
    // Bersihkan kolom pencarian setelah barang ditambahkan
    setSearchTerm("");
  };

  // Fungsi mengubah jumlah (Qty) di tabel
  const handleUpdateQty = (itemId: number, newQty: number) => {
    if (newQty < 1) return; // Minimal qty 1
    const updatedItems = items.map((i) =>
      i.item_id === itemId ? { ...i, quantity: newQty, subtotal: newQty * i.price } : i
    );
    setItems(updatedItems);
  };

  // Fungsi hapus barang dari tabel
  const handleRemoveItem = (itemId: number) => {
    setItems(items.filter((i) => i.item_id !== itemId));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        
        {/* Header & Indikator Step */}
        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Buat Resi Pengiriman</h1>
          <div className="flex space-x-4">
            <div className={`flex-1 py-3 text-center rounded-lg font-bold text-sm transition-all ${step === 1 ? "bg-blue-600 text-white shadow-md transform scale-105" : "bg-gray-200 text-gray-500"}`}>1. Data Pengirim</div>
            <div className={`flex-1 py-3 text-center rounded-lg font-bold text-sm transition-all ${step === 2 ? "bg-blue-600 text-white shadow-md transform scale-105" : "bg-gray-200 text-gray-500"}`}>2. Pilih Barang</div>
            <div className={`flex-1 py-3 text-center rounded-lg font-bold text-sm transition-all ${step === 3 ? "bg-blue-600 text-white shadow-md transform scale-105" : "bg-gray-200 text-gray-500"}`}>3. Review & Submit</div>
          </div>
        </div>

        {/* ================= STEP 1: PENGIRIM & PENERIMA ================= */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 border rounded-xl bg-blue-50 border-blue-100">
                <h2 className="text-xl font-bold text-blue-800 mb-5 flex items-center">
                  <span className="mr-2">📤</span> Detail Pengirim
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Pengirim</label>
                    <input type="text" required value={sender_name} onChange={(e) => setClientData({ sender_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white" placeholder="Masukkan nama pengirim" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Pengirim</label>
                    <textarea required value={sender_address} onChange={(e) => setClientData({ sender_address: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white" placeholder="Alamat lengkap pengirim" rows={3}></textarea>
                  </div>
                </div>
              </div>

              <div className="p-6 border rounded-xl bg-green-50 border-green-100">
                <h2 className="text-xl font-bold text-green-800 mb-5 flex items-center">
                  <span className="mr-2">📥</span> Detail Penerima
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Penerima</label>
                    <input type="text" required value={receiver_name} onChange={(e) => setClientData({ receiver_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-black bg-white" placeholder="Masukkan nama penerima" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Penerima</label>
                    <textarea required value={receiver_address} onChange={(e) => setClientData({ receiver_address: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-black bg-white" placeholder="Alamat lengkap penerima" rows={3}></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t mt-6">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center">
                Selanjutnya (Pilih Barang) <span className="ml-2">➔</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 2: PILIH BARANG ================= */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 border rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📦</span> Daftar Barang
              </h2>

              {/* Komponen Pencarian Barang */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cari & Tambah Barang (Masukkan Kode)</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)} // Mengubah nilai Hook
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black bg-white"
                      placeholder="Contoh: BRG-001 lalu tunggu 500ms..."
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400">
                      {isLoading ? "⏳" : "🔍"}
                    </div>
                  </div>
                </div>

                {/* Box Hasil Pencarian API */}
                {searchTerm && (
                  <div className="mt-2 p-3 bg-white border rounded shadow-sm">
                    {isLoading && <p className="text-blue-500 text-sm">Mencari di database...</p>}
                    {isError && <p className="text-red-500 text-sm">Barang tidak ditemukan.</p>}
                    {searchResult && (
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-black">{searchResult.code}</span> - <span className="text-gray-700">{searchResult.name}</span>
                          <p className="text-sm text-green-600 font-semibold">Rp {searchResult.price.toLocaleString('id-ID')}</p>
                        </div>
                        <button 
                          onClick={() => handleAddItem(searchResult)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-bold"
                        >
                          + Tambah
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">*Sistem dilengkapi Debounce & AbortController (Anti-Race Condition).</p>
              </div>

              {/* Tabel Barang Terpilih */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-3 border-b font-semibold">Kode</th>
                      <th className="p-3 border-b font-semibold">Nama Barang</th>
                      <th className="p-3 border-b font-semibold">Harga</th>
                      <th className="p-3 border-b font-semibold w-24">Qty</th>
                      <th className="p-3 border-b font-semibold">Subtotal</th>
                      <th className="p-3 border-b font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 italic border-b">
                          Belum ada barang yang ditambahkan. Silakan cari kode barang di atas.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.item_id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-black">{item.code}</td>
                          <td className="p-3 text-black">{item.name}</td>
                          <td className="p-3 text-black">Rp {item.price.toLocaleString('id-ID')}</td>
                          <td className="p-3">
                            <input 
                              type="number" 
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQty(item.item_id, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border rounded text-black text-center"
                            />
                          </td>
                          <td className="p-3 font-semibold text-green-700">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center">
                            <button onClick={() => handleRemoveItem(item.item_id)} className="text-red-500 hover:text-red-700 font-bold" title="Hapus">
                              ❌
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Navigasi Step 2 */}
            <div className="flex justify-between pt-6 border-t mt-6">
              <button type="button" onClick={prevStep} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center">
                <span className="mr-2">⬅</span> Kembali
              </button>
              <button 
                type="button" 
                onClick={nextStep} 
                disabled={items.length === 0}
                className={`font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center ${items.length === 0 ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                Selanjutnya (Review) <span className="ml-2">➔</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: REVIEW, SUBMIT, & CETAK ================= */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in" id="area-cetak">
            <div className="bg-white p-8 border rounded-xl shadow-sm relative">
              
              {/* Kop Surat (Hanya Muncul Saat Dicetak atau di Step 3) */}
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-4xl font-extrabold text-blue-800 tracking-wider uppercase">FLEETIFY LOGISTICS</h1>
                <p className="text-gray-500">Jl. Teknologi Canggih No. 99, Jakarta Raya | Telp: (021) 555-1234</p>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">RESI PENGIRIMAN BARANG</h2>
              </div>

              {/* Info Pengirim & Penerima */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-bold text-gray-700 border-b pb-2 mb-2">PENGIRIM</h3>
                  <p className="text-black font-semibold text-lg">{sender_name}</p>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{sender_address}</p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-bold text-gray-700 border-b pb-2 mb-2">PENERIMA</h3>
                  <p className="text-black font-semibold text-lg">{receiver_name}</p>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{receiver_address}</p>
                </div>
              </div>

              {/* Tabel Review Barang */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-700 mb-3">RINCIAN BARANG</h3>
                <table className="w-full text-left border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200 text-gray-800">
                      <th className="p-2 border border-gray-300">Kode</th>
                      <th className="p-2 border border-gray-300">Nama Barang</th>
                      <th className="p-2 border border-gray-300 text-center">Qty</th>
                      {/* Harga dan Subtotal tetap tampil di layar Review agar user tahu, 
                          tapi tidak akan dikirim ke Backend jika rolenya Kerani */}
                      <th className="p-2 border border-gray-300 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.item_id} className="text-black">
                        <td className="p-2 border border-gray-300">{item.code}</td>
                        <td className="p-2 border border-gray-300">{item.name}</td>
                        <td className="p-2 border border-gray-300 text-center">{item.quantity}</td>
                        <td className="p-2 border border-gray-300 text-right font-semibold">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100">
                      <td colSpan={3} className="p-2 border border-gray-300 text-right font-bold text-gray-800">TOTAL KESELURUHAN</td>
                      <td className="p-2 border border-gray-300 text-right font-bold text-blue-700 text-lg">
                        Rp {items.reduce((total, item) => total + item.subtotal, 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 gap-8 mt-12 text-center text-black">
                <div>
                  <p className="mb-20">Petugas / Kerani</p>
                  <p className="font-bold underline">(........................................)</p>
                </div>
                <div>
                  <p className="mb-20">Pengirim</p>
                  <p className="font-bold underline">{sender_name}</p>
                </div>
              </div>
            </div>

            {/* Tombol Aksi (Akan Hilang Saat Dicetak) */}
            <div className="flex justify-between pt-6 mt-6 sembunyikan-saat-cetak">
              <button type="button" onClick={prevStep} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all">
                ⬅ Kembali Edit
              </button>
              
              <div className="space-x-4">
                <button type="button" onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all">
                  🖨️ Cetak Resi
                </button>
                
                <button 
                  type="button" 
                  onClick={async () => {
                    try {
                      const token = Cookies.get("token");
                      if (!token) throw new Error("Token tidak ditemukan");

                      // 1. DECODE TOKEN UNTUK CEK ROLE
                      const decoded= jwtDecode<{ role?: string }>(token);
                      const userRole = decoded.role?.toLowerCase() || ""; // Pastikan property role sesuai dengan Golang kamu

                      // 2. MANIPULASI PAYLOAD (SATPAM KEAMANAN)
                      const finalItems = items.map((item) => {
                        // Jika Kerani, hapus harga dan subtotal dari payload
                        if (userRole === "kerani") {
                          return {
                            item_id: item.item_id,
                            quantity: item.quantity
                          };
                        }
                        // Jika Admin, kirim utuh
                        return {
                          item_id: item.item_id,
                          quantity: item.quantity,
                          price: item.price,
                          subtotal: item.subtotal
                        };
                      });

                      const payload = {
                        sender_name,
                        sender_address,
                        receiver_name,
                        receiver_address,
                        items: finalItems
                      };

                      // 3. TEMBAK API BACKEND
                      // PENTING: Ganti '/transactions' dengan endpoint API Golang kamu yang sebenarnya
                      await api.post("/invoices", payload);
                      
                      alert("Transaksi Berhasil Disimpan!");
                      // Hapus data dari brankas Zustand dan kembali ke step 1
                      useWizardStore.getState().resetForm(); 

                    } catch (error) {
                      console.error(error);
                      alert("Gagal menyimpan transaksi. Cek console log.");
                    }
                  }} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all"
                >
                  🚀 Submit Transaksi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}