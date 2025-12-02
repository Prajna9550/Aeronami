import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Device } from "@/types/sensor";
import { AQIBadge } from "./AQIBadge";
import { calculateAQI } from "@/lib/aqi";
import { MapPin, Thermometer, Droplets, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface DeviceCardProps {
  device: Device & {
    pm25?: number;
    pm10?: number;
    temp?: number;
    humidity?: number;
  };
}

export function DeviceCard({ device }: DeviceCardProps) {
  const isOnline = device.status === "online";
  
  // Use device data or defaults
  const pm25 = device.pm25 || 0;
  const pm10 = device.pm10 || 0;
  const temp = device.temp || 0;
  const humidity = device.humidity || 0;
  
  // Calculate time since last update
  const getTimeSinceUpdate = () => {
    const now = new Date();
    const lastUpdate = new Date(device.lastSeen);
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const aqi = calculateAQI(pm25);

  return (
    <Link to={`/device/${device.deviceId}`}>
      <Card className={`hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer border backdrop-blur-sm ${
        isOnline ? "shadow-glow-green border-aqi-good/30" : "shadow-glow-red border-destructive/30"
      }`}
      style={{ 
        background: 'linear-gradient(145deg, hsl(var(--card)), hsl(var(--muted) / 0.3))'
      }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">{device.name}</CardTitle>
              {/* AQI mini bar */}
              <div className="w-full h-1 bg-muted rounded-full mt-2 mb-1 overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((aqi.value / 500) * 100, 100)}%`,
                    backgroundColor: aqi.color 
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{device.location}</span>
              </div>
            </div>
            <div className={`h-3 w-3 rounded-full ${
              isOnline 
                ? "bg-aqi-good shadow-glow-green animate-pulse" 
                : "bg-destructive shadow-glow-red"
            }`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <AQIBadge pm25={pm25} size="lg" showLabel={true} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="h-4 w-4 text-primary" />
                <span className="font-medium">{temp.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-primary" />
                <span className="font-medium">{humidity.toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
              <Clock className="h-3.5 w-3.5" />
              <span>Last updated {getTimeSinceUpdate()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
