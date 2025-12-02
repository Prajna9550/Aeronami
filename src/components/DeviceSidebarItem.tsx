import { Device } from "@/types/sensor";
import { useLatestReading } from "@/hooks/useSensorReadings";
import { calculateAQI } from "@/lib/aqi";
import { cn } from "@/lib/utils";

interface DeviceSidebarItemProps {
  device: Device;
  isActive: boolean;
  onClick: () => void;
}

export function DeviceSidebarItem({ device, isActive, onClick }: DeviceSidebarItemProps) {
  const { reading } = useLatestReading(device.deviceId);
  const aqi = reading ? calculateAQI(reading.pm25) : { value: 0, color: "#94a3b8", label: "Unknown" };
  const isOnline = device.status === "online";
  const pm25Value = reading?.pm25 ?? 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-lg text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        isActive
          ? "bg-sidebar-accent shadow-sm scale-[1.01]"
          : "hover:bg-sidebar-accent/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: aqi.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{device.name}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="truncate">{device.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isOnline ? "bg-aqi-good" : "bg-muted-foreground"
            )}
          />
          <span className="text-xs font-medium">{pm25Value.toFixed(0)}</span>
        </div>
      </div>
    </button>
  );
}
