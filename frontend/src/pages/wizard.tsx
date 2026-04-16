import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useWizardStore } from "../store/useWizardStore";

export default function Wizard() {
  // State untuk Hydration Error
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Memanggil semua data dan fungsi dari "Otak" Zustand kita
  const {
    step,
    sender_name,
    sender_address,
    receiver_name,
    receiver_address,
    setClientData,
    nextStep,
    prevStep,
  } = useWizardStore();

  useEffect(() => {
    setIsMounted(true); // Memberi tahu Next.js bahwa komponen sudah aman dirender di sisi client

    // Cek apakah user punya tiket masuk (token JWT)
    const token = Cookies.get("token");
    if (!token) {
      router.push("/"); // if not back to login
    }
  }, [router]);

  
  if (!isMounted) return null;

  // Fungsi saat tombol "Selanjutnya" di Step 1 ditekan
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep(); // Melangkah ke Step 2
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
              {/* Blok Pengirim */}
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

              {/* Blok Penerima */}
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

        {/* ================= STEP 2: PLACEHOLDER ================= */}
        {step === 2 && (
          <div className="text-center py-16 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-700 mb-4">Tahap 2: Pencarian Barang</h2>
            <p className="text-gray-500 mb-8">Ini adalah tempat kita memasang fitur Debounce Search sebentar lagi!</p>
            <button type="button" onClick={prevStep} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
              ⬅ Kembali ke Step 1
            </button>
          </div>
        )}

        {/* ================= STEP 3: PLACEHOLDER ================= */}
        {step === 3 && (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-gray-700">Tahap 3: Review & Submit</h2>
          </div>
        )}

      </div>
    </div>
  );
}