import { create } from 'zustand';

const useDeviceStore = create((set) => ({
    device: 'Desktop',
    setDevice: (d) => set({ device: d }),
}));

export default useDeviceStore;
