import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipe data untuk item dalam wizard
export interface WizardItem {
  item_id: number;
  code: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// untuk menyimpan data form Wizard di seluruh halaman 
interface WizardState {
  step: number;
  sender_name: string;
  sender_address: string;
  receiver_name: string;
  receiver_address: string;
  items: WizardItem[];

  // mengubah data di store
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setClientData: (data: Partial<WizardState>) => void;
  setItems: (items: WizardItem[]) => void;
  resetForm: () => void;
}

// Membuat Store dengan middleware 
export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      // Nilai awal saat web pertama kali dibuka
      step: 1,
      sender_name: '',
      sender_address: '',
      receiver_name: '',
      receiver_address: '',
      items: [],

      // Logika pengubah data
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: state.step - 1 })),
      setClientData: (data) => set((state) => ({ ...state, ...data })),
      setItems: (items) => set({ items }),
      resetForm: () => set({
        step: 1,
        sender_name: '',
        sender_address: '',
        receiver_name: '',
        receiver_address: '',
        items: []
      }),
    }),
    {
      name: 'fleetify-wizard-storage', // Nama brankas di LocalStorage browser
    }
  )
);  