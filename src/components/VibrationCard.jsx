import {
  calculateVibrationMagnitude,
  calculateVibrationDeviation,
} from "../utils/healthEngine";

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  return Number(value).toFixed(digits);
}

export default function VibrationCard({ reading, status }) {
  const accelX = reading?.accel_x ?? 0;
  const accelY = reading?.accel_y ?? 0;
  const accelZ = reading?.accel_z ?? 0;

  const magnitude = calculateVibrationMagnitude(accelX, accelY, accelZ);
  const deviation = calculateVibrationDeviation(accelX, accelY, accelZ);

  const getStatusColor = (s) => {
    switch (s) {
      case "NORMAL":
        return "status-normal";
      case "WARNING":
        return "status-warning";
      case "CRITICAL":
        return "status-critical";
      default:
        return "status-unavailable";
    }
  };

  return (
    <div className="panel vibration-card">
      <div className="panel-header">
        <div>
          <h2>Motion & Vibration Analysis</h2>
          <p>MPU6050 real-time dynamic forces</p>
        </div>

        <span className={`status-pill ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="vibration-twin-grid">
        <div className="dynamic-calcs">
          <div className="calc-group">
            <span className="calc-lbl">Vibration Magnitude</span>
            <div className="calc-value-row">
              <strong className="calc-val">{formatNumber(magnitude)}</strong>
              <small className="calc-unit">m/s²</small>
            </div>
            <p className="calc-desc">Resultant force vector sqrt(x² + y² + z²)</p>
          </div>

          <div className="calc-group">
            <span className="calc-lbl">Vibration Deviation</span>
            <div className="calc-value-row">
              <strong className="calc-val">{formatNumber(deviation)}</strong>
              <small className="calc-unit">m/s²</small>
            </div>
            <p className="calc-desc">Absolute variance from earth gravity (9.81 m/s²)</p>
          </div>
        </div>

        <div className="raw-axes-data">
          <h3>Raw Accelerometer Values</h3>
          <div className="axis-grid">
            <div className="axis-box">
              <span className="axis-lbl">ACCEL X</span>
              <strong className="axis-val">{formatNumber(accelX)}</strong>
              <small className="axis-unit">m/s²</small>
            </div>
            <div className="axis-box">
              <span className="axis-lbl">ACCEL Y</span>
              <strong className="axis-val">{formatNumber(accelY)}</strong>
              <small className="axis-unit">m/s²</small>
            </div>
            <div className="axis-box">
              <span className="axis-lbl">ACCEL Z</span>
              <strong className="axis-val">{formatNumber(accelZ)}</strong>
              <small className="axis-unit">m/s²</small>
            </div>
          </div>

          <h3>Raw Gyroscope Values</h3>
          <div className="axis-grid">
            <div className="axis-box">
              <span className="axis-lbl">GYRO X</span>
              <strong className="axis-val">{formatNumber(reading?.gyro_x)}</strong>
              <small className="axis-unit">rad/s</small>
            </div>
            <div className="axis-box">
              <span className="axis-lbl">GYRO Y</span>
              <strong className="axis-val">{formatNumber(reading?.gyro_y)}</strong>
              <small className="axis-unit">rad/s</small>
            </div>
            <div className="axis-box">
              <span className="axis-lbl">GYRO Z</span>
              <strong className="axis-val">{formatNumber(reading?.gyro_z)}</strong>
              <small className="axis-unit">rad/s</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
