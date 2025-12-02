import { useQuery } from "@tanstack/react-query";
import { generateMockReadings, mockLatestReadings } from "@/lib/mockData";

export interface SensorReading {
  id: string;
  device_id: string;
  timestamp: string;
  pm25: number;
  pm10: number;
  pm1: number;
  nh3: number | null;
  no2: number | null;
  so2: number | null;
  voc: number | null;
  temperature: number | null;
  humidity: number | null;
}

export const useSensorReadings = (deviceId: string, hours: number = 24) => {
  const { data: readings } = useQuery({
    queryKey: ["sensor-readings", deviceId, hours],
    queryFn: async () => {
      return generateMockReadings(deviceId);
    },
    enabled: !!deviceId,
  });

  return { readings: readings || [] };
};

export const useSensorReadingsByDateRange = (
  deviceId: string,
  startDate: Date | null,
  endDate: Date | null
) => {
  const { data: readings } = useQuery({
    queryKey: ["sensor-readings-range", deviceId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      return generateMockReadings(deviceId);
    },
    enabled: !!deviceId && !!startDate && !!endDate,
  });

  return { readings: readings || [] };
};

export const useLatestReading = (deviceId: string) => {
  const { data: reading } = useQuery({
    queryKey: ["latest-reading", deviceId],
    queryFn: async () => {
      return mockLatestReadings[deviceId] || null;
    },
    enabled: !!deviceId,
  });

  return { reading };
};
