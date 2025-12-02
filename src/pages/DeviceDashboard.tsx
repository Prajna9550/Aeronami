import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AQIBadge } from "@/components/AQIBadge";
import { DeviceSidebarItem } from "@/components/DeviceSidebarItem";
import { useDevices } from "@/hooks/useDevices";
import { useSensorReadings, useLatestReading } from "@/hooks/useSensorReadings";
import { calculateAQI } from "@/lib/aqi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Wind,
  Droplets,
  Thermometer,
  Battery,
  Download,
  Edit,
  RefreshCw,
  AlertTriangle,
  CloudRain,
  Flame,
  Zap,
} from "lucide-react";

export default function DeviceDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devices } = useDevices();
  const { readings } = useSensorReadings(id || "", 24);
  const { reading: currentReading } = useLatestReading(id || "");

  const device = devices.find((d) => d.device_id === id);

  if (!id || (!device && devices.length > 0)) {
    navigate("/");
    return null;
  }

  if (!device || !currentReading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          {devices.length === 0 ? "No devices found. Add your first device to get started." : "Loading..."}
        </div>
      </Layout>
    );
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const aqi = calculateAQI(currentReading.pm25);
  const showAlert = currentReading.pm25 > 35 || aqi.value > 100;

  // Transform readings for charts
  const chartData = readings.map((r) => ({
    timestamp: r.timestamp,
    pm1: Number(r.pm1),
    pm25: Number(r.pm25),
    pm10: Number(r.pm10),
    nh3: Number(r.nh3),
    no2: Number(r.no2),
    so2: Number(r.so2),
    voc: Number(r.voc),
    temp: Number(r.temperature),
    humidity: Number(r.humidity),
    aqi: calculateAQI(Number(r.pm25)).value,
  }));

  // Calculate 24h summary
  const pm25Values = chartData.map(d => d.pm25).filter(v => !isNaN(v));
  const maxPM25 = pm25Values.length > 0 ? Math.max(...pm25Values) : 0;
  const avgPM25 = pm25Values.length > 0 ? pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length : 0;
  const peakReading = chartData.find(d => d.pm25 === maxPM25);
  const peakTime = peakReading ? formatTime(peakReading.timestamp) : "N/A";

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar border-r border-sidebar-border p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-sidebar-foreground mb-3 px-3">All Devices</h3>
          <div className="space-y-2">
            {devices.map((d) => (
              <DeviceSidebarItem
                key={d.device_id}
                device={{
                  deviceId: d.device_id,
                  name: d.name,
                  location: d.location,
                  status: d.status as "online" | "offline",
                  lastSeen: d.last_update,
                }}
                isActive={d.device_id === id}
                onClick={() => navigate(`/device/${d.device_id}`)}
              />
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Alert Banner */}
          {showAlert && (
            <div 
              className="mb-6 border-l-4 rounded-lg p-4 backdrop-blur-sm"
              style={{
                backgroundColor: `${aqi.color}15`,
                borderColor: aqi.color,
                boxShadow: `0 0 20px ${aqi.color}30`
              }}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5" style={{ color: aqi.color }} />
                <div>
                  <div className="font-semibold" style={{ color: aqi.color }}>
                    {aqi.label} Air Quality Alert
                  </div>
                  <div className="text-sm text-muted-foreground">
                    PM2.5 levels are {aqi.value}. Consider limiting outdoor activities.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold">{device.name}</h2>
                <p className="text-muted-foreground mt-1">{device.location}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hover:shadow-glow transition-all">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="hover:shadow-glow transition-all">
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" className="hover:shadow-glow transition-all">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* AQI Card */}
          <Card 
            className="mb-6 backdrop-blur-sm border-2 transition-all"
            style={{
              background: `linear-gradient(135deg, hsl(var(--card)), ${aqi.color}10)`,
              borderColor: `${aqi.color}40`,
              boxShadow: `0 0 30px ${aqi.color}20`
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Current Air Quality Index</div>
                  <AQIBadge pm25={currentReading.pm25} size="lg" showLabel={true} />
                </div>
                <div className="text-right">
                  <Badge 
                    variant={device.status === "online" ? "default" : "secondary"} 
                    className={`mb-2 ${device.status === "online" ? "shadow-glow-green" : ""}`}
                  >
                    {device.status === "online" ? "Online" : "Offline"}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {formatTime(currentReading.timestamp)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="hover:shadow-glow transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Temperature</div>
                    <div className="text-2xl font-bold">{currentReading.temperature?.toFixed(1) || 0}°C</div>
                  </div>
                  <Thermometer className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-glow transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Humidity</div>
                    <div className="text-2xl font-bold">{currentReading.humidity.toFixed(0)}%</div>
                  </div>
                  <Droplets className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-glow transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="text-2xl font-bold capitalize">{device.status}</div>
                  </div>
                  <Zap className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Sensor Grid */}
          <Card className="mb-6 hover:shadow-glow transition-all">
            <CardHeader>
              <CardTitle>Live Sensor Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-sensor-card rounded-lg p-4 border shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">PM1</span>
                  </div>
                  <div className="text-2xl font-bold">{currentReading.pm1.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">µg/m³</div>
                </div>
                <div className="bg-sensor-card rounded-lg p-4 border shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">PM2.5</span>
                  </div>
                  <div className="text-2xl font-bold">{currentReading.pm25.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">µg/m³</div>
                </div>
                <div className="bg-sensor-card rounded-lg p-4 border shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">PM10</span>
                  </div>
                  <div className="text-2xl font-bold">{currentReading.pm10.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">µg/m³</div>
                </div>
                <div className="bg-sensor-card rounded-lg p-4 border shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">NH₃</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Ammonia</span>
                  </div>
                  <div className="text-2xl font-bold">{currentReading.nh3.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">ppm</div>
                </div>
                <div className="bg-sensor-card rounded-lg p-4 border shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">NO₂</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Nitrogen Dioxide</span>
                  </div>
                  <div className="text-2xl font-bold">{currentReading.no2.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">ppm</div>
                </div>
                <div className="bg-sensor-card rounded-lg p-4 border shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">SO₂</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Sulfur Dioxide</span>
                  </div>
                  <div className="text-2xl font-bold">{currentReading.so2.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">ppm</div>
                </div>
                <div className="bg-sensor-card rounded-lg p-4 border shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">VOC</span>
                  </div>
                  <div className="text-2xl font-bold">{currentReading.voc.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">ppb</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 24h Summary */}
          <Card className="mb-6 hover:shadow-glow transition-all">
            <CardHeader>
              <CardTitle>24-Hour Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <div className="text-sm text-muted-foreground mb-1">Max PM2.5</div>
                  <div className="text-2xl font-bold text-primary">{maxPM25.toFixed(1)} µg/m³</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <div className="text-sm text-muted-foreground mb-1">Avg PM2.5</div>
                  <div className="text-2xl font-bold text-accent">{avgPM25.toFixed(1)} µg/m³</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <div className="text-sm text-muted-foreground mb-1">Peak Time</div>
                  <div className="text-2xl font-bold">{peakTime}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Charts */}
          <Card className="hover:shadow-glow transition-all">
            <CardHeader>
              <CardTitle>Historical Data (24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pm" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="pm">Particulate Matter</TabsTrigger>
                  <TabsTrigger value="gas">Gas Sensors</TabsTrigger>
                  <TabsTrigger value="climate">Climate</TabsTrigger>
                  <TabsTrigger value="combined">Combined View</TabsTrigger>
                </TabsList>

                <TabsContent value="pm" className="mt-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="pm25" stroke="hsl(var(--accent))" strokeWidth={2} name="PM2.5" dot={false} />
                      <Line type="monotone" dataKey="pm10" stroke="hsl(var(--aqi-moderate))" strokeWidth={2} name="PM10" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="gas" className="mt-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="nh3" stroke="hsl(var(--primary))" strokeWidth={2} name="NH₃" dot={false} />
                      <Line type="monotone" dataKey="no2" stroke="hsl(var(--accent))" strokeWidth={2} name="NO₂" dot={false} />
                      <Line type="monotone" dataKey="so2" stroke="hsl(var(--aqi-moderate))" strokeWidth={2} name="SO₂" dot={false} />
                      <Line type="monotone" dataKey="voc" stroke="hsl(var(--aqi-sensitive))" strokeWidth={2} name="VOC" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="climate" className="mt-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="temp" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} name="Temperature (°C)" />
                      <Area type="monotone" dataKey="humidity" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.2)" strokeWidth={2} name="Humidity (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="combined" className="mt-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="aqi" stroke="hsl(var(--primary))" strokeWidth={3} name="AQI" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
