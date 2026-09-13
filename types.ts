export type SystemStatus = 'ONLINE' | 'STANDBY' | 'EMERGENCY_STOP' | 'MAINTENANCE';
export type UplinkStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
export type AiStatus = 'STANDBY' | 'READY' | 'ACTIVE' | 'PROCESSING';
export type DriveDirection = 'FWD' | 'REV' | 'LEFT' | 'RIGHT' | 'STOP' | 'IDLE';
export type MissionStatus = 'STANDBY' | 'PATROLLING' | 'PAUSED' | 'RETURNING' | 'COMPLETED' | 'ABORTED';

// ARGUS: Deployment Roadmap Phases
export type DevelopmentPhase = 
  | 'PHASE_1_ALERT'       // Phase 1 — Alert-only retrofit kit (camera + YOLO)
  | 'PHASE_2_ADVISORY'    // Phase 2 — Sensor-fused monitoring, still advisory
  | 'PHASE_3_AUTONOMOUS'; // Phase 3 — Full autonomous control, proven here on this rover

// ARGUS: Open-Cast Mine Weather & Degraded Visibility
export type MineWeatherCondition = 
  | 'CLEAR_PIT' 
  | 'IRON_DUST' 
  | 'DENSE_FOG' 
  | 'MONSOON_RAIN' 
  | 'EXTREME_ZERO_VISIBILITY';

export interface WeatherState {
  condition: MineWeatherCondition;
  fogDensity: number; // 0 - 100%
  rainMmHr: number; // 0 - 120 mm/hr
  ironDustPpm: number; // 0 - 500 ppm
  humidityPercent: number; // 30 - 100%
  visibilityMeters: number; // 2m to 1200m
  opticalTransmissivity: number; // 0 - 100%
}

// Weather-Adaptive Sensor Trust Weights (Dynamic Fusion Layer)
// As fog/rain severity rises, trust shifts from camera/LiDAR toward radar/thermal
export interface SensorTrustWeights {
  camera: number;    // % weight (Optical RGB)
  lidar: number;     // % weight (3D Laser)
  radar: number;     // % weight (77GHz mmWave Radar)
  thermal: number;   // % weight (FLIR Long-Wave IR)
  ultrasonic: number;// % weight (Near-field proximity)
}

// Trajectory & Path Vector for Dual-Path Decision
export interface PlanningPath {
  steeringDeg: number;       // -35° to +35°
  targetSpeedKmh: number;    // 0 to 45 km/h
  confidence: number;        // 0 to 100%
  status: 'OPTIMAL' | 'DEGRADED' | 'DISPERSED' | 'FAILED';
  sensorSources: string[];
}

// Redundancy Arbitration Layer
export interface RedundancyArbitrationState {
  primaryPath: PlanningPath;   // Camera + LiDAR (Clear weather)
  fallbackPath: PlanningPath;  // Radar + Thermal (Heavy fog/rain)
  consensusScore: number;      // 0 - 100% consensus
  discrepancyDeltaTheta: number; // Angular divergence between paths
  discrepancyDeltaSpeed: number; // Speed divergence
  arbitrationMode: 'CONSENSUS_LOCKED' | 'ARBITRATED_PRIMARY' | 'ARBITRATED_FALLBACK' | 'DISCREPANCY_ALERT';
  actuationCommand: {
    steeringAngleDeg: number;
    brakingPressureBar: number;
    throttlePercent: number;
    gear: 'N' | 'D1' | 'D2' | 'R';
    retarderBrakePercent: number;
  };
}

// Multi-spectral Perception View Mode
export type PerceptionViewMode = 'FUSED' | 'OPTICAL' | 'THERMAL' | 'LIDAR' | 'RADAR';

// Fail-Safe State & Hardware Kill-Switch
export interface FailSafeState {
  signalLossTriggered: boolean;
  heartbeatAgeMs: number;
  workerKillSwitchTriggered: boolean;
  workerProximityHazard: boolean;
  safeStopActive: boolean;
  statusMessage: string;
}

export interface MotorData {
  speed: number | null; // percentage or null for '--'
  direction: DriveDirection | null;
  status: 'READY' | 'ACTIVE' | 'STANDBY' | 'E-STOP' | 'ERROR';
  current: number | null; // Amperes or null for '--'
  rpm: number | null;
  temperature: number | null; // Celsius
}

export interface ObstacleDistanceData {
  front: number | null; // cm
  left: number | null;
  right: number | null;
  rear: number | null;
  minDistance: number | null;
  sensorStatus: 'ACTIVE' | 'STANDBY' | 'CALIBRATING' | 'OFFLINE';
  radarTargetMeters?: number | null;
  thermalHotspotDetected?: boolean;
}

export interface RoverTelemetryData {
  batteryPercent: number | null; // % or null for '--'
  batteryVoltage: number | null; // Volts
  speedCms: number | null; // cm/s or null for '--'
  obstacleDistanceCm: number | null; // cm or null for '--'
  motorLeftPercent: number | null;
  motorRightPercent: number | null;
  linkUptimeSeconds: number; // seconds
  pitchDeg: number | null;
  rollDeg: number | null;
  yawDeg: number | null;
  cpuTempC: number | null;
  cpuLoadPercent: number | null;
  ramUsagePercent: number | null;
  // Mining haul truck proving ground telemetries:
  simulatedPayloadTons?: number; // e.g. 220 tons nominal
  hydraulicBrakePressureBar?: number; // 0 - 180 bar
  inclineGradePercent?: number; // ramp grade e.g. +8.2%
}

export interface AiVisionState {
  objectDetection: 'READY' | 'PROCESSING' | 'OFFLINE';
  personDetection: 'READY' | 'DETECTED' | 'OFFLINE';
  obstacleDetection: 'ACTIVE' | 'WARNING' | 'CLEAR' | 'OFFLINE';
  imageProcessing: 'ACTIVE' | 'PAUSED' | 'OFFLINE';
  cameraStatus: 'ONLINE' | 'NO_SIGNAL' | 'CONNECTING' | 'ERROR';
  yoloModel: 'READY' | 'INFERENCE' | 'OFFLINE';
  ros2Status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  objectsDetectedCount: number | null;
  personsDetectedCount: number | null;
  confidenceThreshold: number; // 0-100
  fps: number | null;
  inferenceLatencyMs: number | null;
}

export interface DriveVector {
  x: number; // -1.0 to 1.0 (linear.x)
  y: number; // -1.0 to 1.0 (angular.z)
  speedLimitPercent: number; // 10 to 100
  activeDirection: DriveDirection;
}

export interface AutonomousPatrolMission {
  missionName: string;
  status: MissionStatus;
  currentWaypoint: string | null;
  totalWaypoints: number;
  currentLocation: {
    lat: number | null;
    lng: number | null;
    gridX: number | null;
    gridY: number | null;
  };
  distanceTravelledM: number | null;
  missionDurationSeconds: number;
  patrolProgressPercent: number;
  batteryReservePercent: number;
  haulCycle?: {
    pitBench: string;
    targetDestination: string;
    oreGrade: string;
    cycleLap: number;
  };
}

export interface UplinkConfig {
  roverIp: string;
  port: number;
  protocol: 'ROS 2 WebSocket' | 'WebRTC' | 'HTTP REST' | 'ESP-NOW Bridge' | 'MQTT';
  status: UplinkStatus;
  latencyMs: number | null;
  signalStrengthDbm: number | null;
  baudRate: number;
}

export interface LogEvent {
  id: string;
  timestamp: string;
  category: 'SYSTEM' | 'TELEMETRY' | 'AI' | 'DRIVE' | 'MISSION' | 'WARNING' | 'CRITICAL' | 'FUSION' | 'ARBITRATION' | 'FAILSAFE';
  message: string;
}

export interface DetectedEntity {
  id: string;
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [x%, y%, w%, h%]
  color: string;
  sensorSource: 'CAMERA_RGB' | 'THERMAL_IR' | 'LIDAR_POINT' | 'RADAR_DOPPLER' | 'FUSED';
  distanceMeters?: number;
  isWorker?: boolean;
}
