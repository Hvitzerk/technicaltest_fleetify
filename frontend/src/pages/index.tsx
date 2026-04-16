import { useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import api from "../lib/axios"; // Menggunakan jalan mundur agar aman dari error TypeScript

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Menembak API Backend Golang yang sudah kita buat
      const response = await api.post("/login", {
        username: username,
        password: password,
      });

      const token = response.data.token;

      if (token) {
        // Simpan token ke dalam brankas Cookies
        Cookies.set("token", token, { expires: 1 }); // Berlaku 1 hari
        
        // Pindah ke halaman form Wizard
        router.push("/wizard");
      }
    } catch (err: any) {
      // Menangkap pesan error dari backend
      setError(
        err.response?.data?.error || "Login gagal. Periksa kembali username dan password Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Fleetify</h1>
          <p className="text-gray-500 mt-2">Masuk untuk membuat resi invoice</p>
        </div>

        {/* Notifikasi Error (Sesuai Syarat Robust Error Handling di Dokumen) */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg transition-colors ${
              loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}