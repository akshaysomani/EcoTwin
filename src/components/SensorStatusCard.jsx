import { useState, useEffect } from "react";
import { Thermometer, Zap, Server, Activity } from "lucide-react";

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  return Number(value).toFixed(digits);
}

function getRelativeTime(timestamp) {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  if (diffSec < 0) return "Just now";
  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return date.toLocaleTimeString();
}

export default function SensorStatusCard({ type, reading, status }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (type === "connectivity" && reading?.created_at) {
      const interval = setInterval(() => {
        setTick((t) => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [type, reading?.created_at]);

  const relativeTime = getRelativeTime(reading?.created_at);

  const getStatusColor = (s) => {
    switch (s) {
      case "NORMAL":
      case "ONLINE":
        return "status-normal";
      case "WARNING":
        return "status-warning";
      case "CRITICAL":
      case "OFFLINE":
        return "status-critical";
      case "UNAVAILABLE":
      default:
        return "status-unavailable";
    }
  };

  if (type === "temperature") {
    const temp = reading?.temperature_c;
    return (
      <div className="sensor-card">
        <div className="sensor-card-top">
          <div className={`sensor-icon ${getStatusColor(status)}`}>
            <Thermometer size={21} />
          </div>
          <span className={`status-dot-new ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>

        <div className="sensor-label">Temperature</div>
        <div className="sensor-value">
          {formatNumber(temp)}
          <span>°C</span>
        </div>
        <div className="sensor-subtitle">DS18B20 · Ambient Temp</div>
      </div>
    );
  }

  if (type === "vibration") {
    const accelX = reading?.accel_x ?? 0;
    const accelY = reading?.accel_y ?? 0;
    const accelZ = reading?.accel_z ?? 0;
    
    // We import calculateVibrationMagnitude and calculateVibrationDeviation from healthEngine inline,
    // or just calculate them directly to keep it simple.
    const mag = Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);
    const dev = Math.abs(mag - 9.81);

    return (
      <div className="sensor-card">
        <div className="sensor-card-top">
          <div className={`sensor-icon ${getStatusColor(status)}`}>
            <Activity size={21} />
          </div>
          <span className={`status-dot-new ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>

        <div className="sensor-label">Vibration</div>
        <div className="sensor-value">
          {formatNumber(mag)}
          <span>m/s²</span>
        </div>
        <div className="sensor-subtitle">
          Deviation: {formatNumber(dev)} m/s²
        </div>
      </div>
    );
  }

  if (type === "electrical") {
    const isValValid = reading?.ina219_voltage_valid === true && status !== "UNAVAILABLE";
    const voltage = isValValid ? reading.bus_voltage_v : null;
    const current = isValValid ? reading.current_ma : null;
    const power = isValValid ? reading.power_mw : null;

    return (
      <div className="sensor-card electrical-status-card">
        <div className="sensor-card-top">
          <div className={`sensor-icon ${getStatusColor(status)}`}>
            <Zap size={21} />
          </div>
          <span className={`status-dot-new ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>

        <div className="sensor-label">Electrical Telemetry</div>
        
        {isValValid ? (
          <div className="electrical-metrics">
            <div className="metric-row">
              <span className="metric-lbl">Voltage:</span>
              <span className="metric-val">{formatNumber(voltage, 3)} <span>V</span></span>
            </div>
            <div className="metric-row">
              <span className="metric-lbl">Current:</span>
              <span className="metric-val">{formatNumber(current, 1)} <span>mA</span></span>
            </div>
            <div className="metric-row">
              <span className="metric-lbl">Power:</span>
              <span className="metric-val">{formatNumber(power, 1)} <span>mW</span></span>
            </div>
          </div>
        ) : (
          <div className="electrical-unavailable">
            <div className="sensor-value">--</div>
            <div className="notice-text">Measurement unavailable</div>
          </div>
        )}
        <div className="sensor-subtitle">INA219 · Power Monitoring</div>
      </div>
    );
  }

  if (type === "connectivity") {
    const exactTime = reading?.created_at
      ? new Date(reading.created_at).toLocaleTimeString()
      : "--:--:--";
    return (
      <div className="sensor-card">
        <div className="sensor-card-top">
          <div className={`sensor-icon ${getStatusColor(status)}`}>
            <Server size={21} />
          </div>
          <span className={`status-dot-new ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>

        <div className="sensor-label">Connectivity</div>
        <div className="sensor-value uppercase-val">
          {status}
        </div>
        <div className="sensor-subtitle">
          Last sync: {relativeTime} ({exactTime})
        </div>
      </div>
    );
  }

  return null;
}
