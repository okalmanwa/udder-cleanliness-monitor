import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Farm = {
  id: string
  name: string
  code: string
}

type UddersCacheKey = string; // e.g., `${farmId}_${dateFilter}_${selectedYear}`
type UddersCacheEntry = {
  udders: any[];
  fetchedAt: number;
};

type AnalyticsCacheKey = string; // e.g., `analytics_${farmId}_${timeRange}`
type AnalyticsCacheEntry = {
  analytics: any;
  fetchedAt: number;
};

type FarmStore = {
  selectedFarm: Farm | null
  setSelectedFarm: (farm: Farm | null) => void
  uddersCache: Record<UddersCacheKey, UddersCacheEntry>
  setUddersCache: (key: UddersCacheKey, udders: any[]) => void
  getUddersCache: (key: UddersCacheKey) => UddersCacheEntry | undefined
  analyticsCache: Record<AnalyticsCacheKey, AnalyticsCacheEntry>
  setAnalyticsCache: (key: AnalyticsCacheKey, analytics: any) => void
  getAnalyticsCache: (key: AnalyticsCacheKey) => AnalyticsCacheEntry | undefined
  clearAnalyticsCache: (farmId?: string) => void
}

export const useFarmStore = create<FarmStore>()(
  persist(
    (set, get) => ({
      selectedFarm: null,
      setSelectedFarm: (farm) => set({ selectedFarm: farm }),
      uddersCache: {},
      setUddersCache: (key, udders) => set((state) => ({
        uddersCache: {
          ...state.uddersCache,
          [key]: { udders, fetchedAt: Date.now() },
        },
      })),
      getUddersCache: (key) => get().uddersCache[key],
      analyticsCache: {},
      setAnalyticsCache: (key, analytics) => set((state) => ({
        analyticsCache: {
          ...state.analyticsCache,
          [key]: { analytics, fetchedAt: Date.now() },
        },
      })),
      getAnalyticsCache: (key) => get().analyticsCache[key],
      clearAnalyticsCache: (farmId) => set((state) => {
        if (farmId) {
          // Clear only analytics cache for specific farm - fix the key pattern matching
          const newCache = { ...state.analyticsCache }
          Object.keys(newCache).forEach(key => {
            // Match keys like "analytics_farmId_timeRange"
            if (key.startsWith(`analytics_${farmId}_`)) {
              delete newCache[key]
            }
          })
          return { analyticsCache: newCache }
        } else {
          // Clear all analytics cache
          return { analyticsCache: {} }
        }
      }),
    }),
    {
      name: 'udder-selected-farm', // key in localStorage
    }
  )
) 