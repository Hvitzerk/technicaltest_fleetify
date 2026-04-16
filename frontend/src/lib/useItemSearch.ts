import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from './axios';

export function useItemSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // debounce:  500ms setelah user berhenti mengetik
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer); // Bersihkan timer jika searchTerm berubah sebelum 500ms
  }, [searchTerm]);

  //  react Query v5 + AbortController (Anti-Race Condition)
  const query = useQuery({
    queryKey: ['itemSearch', debouncedTerm],
    queryFn: async ({ signal }) => {
      if (!debouncedTerm) return null;
      
      // endpoint GET /api/items?code={kode} 
    const response = await api.get(`/items?code=${debouncedTerm}`, {
        signal,
      });
      
      
      const itemsArray = response.data.data;
      
      // Jika array-nya ada isinya, kembalikan barang urutan pertama (index 0)
      if (itemsArray && itemsArray.length > 0) {
        return itemsArray[0];
      }
      
      // Jika kosong, lempar error agar ditangkap oleh isError di UI
      throw new Error("Barang tidak ditemukan");
    },
    enabled: !!debouncedTerm,
    staleTime: 1000 * 60 * 5,
  });

  return {
    searchTerm,
    setSearchTerm,
    ...query,
  };
}