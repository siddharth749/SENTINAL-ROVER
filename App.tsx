/**
 * ARGUS // AUTONOMOUS MINE SAFETY & PERCEPTION
 * Weather-Adaptive Multi-Sensor Fusion & Redundancy Arbitration Console
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { CameraSurveillance } from './components/CameraSurveillance';
import { WeatherFusionEngine } from './components/WeatherFusionEngine';
import { RedundancyArbitration } from './components/RedundancyArbitration';
import { DevelopmentPhaseSelector } from './components/DevelopmentPhaseSelector';
import { FailSafeMonitor } from './components/FailSafeMonitor';
import { AiVisionPanel } from './components/AiVisionPanel';
import { DriveControl } from './components/DriveControl';
import { EmergencyStop } from './components/EmergencyStop';
import { MotorTelemetry } from './components/MotorTelemetry';
import { RoverTelemetry } from './components/RoverTelemetry';
import { ObstacleMonitor } from './components/ObstacleMonitor';
import { AutonomousPatrol } from './components/AutonomousPatrol';
import { UplinkConfigPanel } from './components/UplinkConfig';
import { SystemLog } from './components/SystemLog';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ArgusLandingPage } from './components/ArgusLandingPage';
import { 
  SystemStatus, 
  UplinkStatus, 
  AiStatus, 
  MotorData, 
  ObstacleDistanceData, 
  RoverTelemetryData, 
  AiVisionState, 
  DriveVector, 
  AutonomousPatrolMission, 
  UplinkConfig, 
  LogEvent,
  DevelopmentPhase,
  MineWeatherCondition,
  WeatherState,
  SensorTrustWeights,
  RedundancyArbitrationState,
  FailSafeState
} from './types';
import { formatTime, playTacticalBeep, playAlarmSound } from './utils/sound';

export default function App() {
  // Top-Level Application View: 'WEBSITE' (Product Platform) vs 'SENTINEL' (Live Proving Ground)
  const [currentView, setCurrentView] = useState<'WEBSITE' | 'SENTINEL'>('WEBSITE');

  // Main System State
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('ONLINE');
  const [uplinkStatus, setUplinkStatus] = useState<UplinkStatus>('CONNECTED');
  const [aiStatus, setAiStatus] = useState<AiStatus>('READY');
  const [signalDbm, setSignalDbm] = useState<number | null>(-62);
  const [latencyMs, setLatencyMs] = useState<number | null>(19);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isBenchSimulatorActive, setIsBenchSimulatorActive] = useState(true);

  // Development Roadmap Phase (Default to Phase 3: Full autonomous control proven on rover)
  const [developmentPhase, setDevelopmentPhase] = useState<DevelopmentPhase>('PHASE_3_AUTONOMOUS');

  // Open-Cast Mine Weather & Degraded Visibility State
  const [weather, setWeather] = useState<WeatherState>({
    condition: 'DENSE_FOG',
    fogDensity: 82, // Starts with dense pit fog to showcase the solution
    rainMmHr: 12,
    ironDustPpm: 65,
    humidityPercent: 88,
    visibilityMeters: 6, // 6m visibility = extreme zero-visibility hazard
    opticalTransmissivity: 12.4,
  });

  // Deterministic Fail-Safe State
  const [failSafe, setFailSafe] = useState<FailSafeState>({
    signalLossTriggered: false,
    heartbeatAgeMs: 24,
    workerKillSwitchTriggered: false,
    workerProximityHazard: false,
    safeStopActive: false,
    statusMessage: 'SYSTEM SECURE',
  });

  // Speed Limiter (default 70%)
  const [speedLimiter, setSpeedLimiter] = useState<number>(70);

  // Drive Vector
  const [driveVector, setDriveVector] = useState<DriveVector>({
    x: 0.0,
    y: 0.0,
    speedLimitPercent: 70,
    activeDirection: 'STOP',
  });

  // Motor Telemetry
  const [leftMotor, setLeftMotor] = useState<MotorData>({
    speed: 0,
    direction: 'IDLE',
    status: 'READY',
    current: 0.0,
    rpm: 0,
    temperature: 32,
  });

  const [rightMotor, setRightMotor] = useState<MotorData>({
    speed: 0,
    direction: 'IDLE',
    status: 'READY',
    current: 0.0,
    rpm: 0,
    temperature: 31,
  });

  // Rover & Mining Haul Truck Proving Ground Telemetry
  const [roverTelemetry, setRoverTelemetry] = useState<RoverTelemetryData>({
    batteryPercent: 88,
    batteryVoltage: 12.4,
    speedCms: 0,
    obstacleDistanceCm: 142,
    motorLeftPercent: 0,
    motorRightPercent: 0,
    linkUptimeSeconds: 145,
    pitchDeg: 4.8, // Pit ramp inclination
    rollDeg: -0.4,
    yawDeg: 124.6,
    cpuTempC: 46.2,
    cpuLoadPercent: 34,
    ramUsagePercent: 42,
    simulatedPayloadTons: 220, // 220 tons simulated haul load
    hydraulicBrakePressureBar: 28,
    inclineGradePercent: 8.4,
  });

  // Obstacle Distances
  const [obstacleData, setObstacleData] = useState<ObstacleDistanceData>({
    front: 142,
    left: 88,
    right: 94,
    rear: 210,
    minDistance: 88,
    sensorStatus: 'ACTIVE',
    radarTargetMeters: 42.0,
    thermalHotspotDetected: true,
  });

  // AI Vision State
  const [aiVisionState, setAiVisionState] = useState<AiVisionState>({
    objectDetection: 'READY',
    personDetection: 'READY',
    obstacleDetection: 'ACTIVE',
    imageProcessing: 'ACTIVE',
    cameraStatus: 'ONLINE',
    yoloModel: 'READY',
    ros2Status: 'CONNECTED',
    objectsDetectedCount: 3,
    personsDetectedCount: 1,
    confidenceThreshold: 65,
    fps: 30,
    inferenceLatencyMs: 14,
  });

  // Autonomous Haul Cycle (Pit-04 Circuit)
  const [mission, setMission] = useState<AutonomousPatrolMission>({
    missionName: 'HAUL-PIT-04',
    status: 'PATROLLING',
    currentWaypoint: 'BENCH-4',
    totalWaypoints: 4,
    currentLocation: {
      lat: 21.8458,
      lng: 85.3926,
      gridX: 42.8,
      gridY: 19.4,
    },
    distanceTravelledM: 84.6,
    missionDurationSeconds: 168,
    patrolProgressPercent: 42,
    batteryReservePercent: 88,
    haulCycle: {
      pitBench: 'BENCH 4 (HIGH-GRADE HEMATITE)',
      targetDestination: 'PRIMARY CRUSHER HOPPER',
      oreGrade: '64.5% Fe',
      cycleLap: 3,
    },
  });

  // Uplink Config
  const [uplinkConfig, setUplinkConfig] = useState<UplinkConfig>({
    roverIp: '192.168.1.120',
    port: 9090,
    protocol: 'ROS 2 WebSocket',
    status: 'CONNECTED',
    latencyMs: 19,
    signalStrengthDbm: -62,
    baudRate: 115200,
  });

  // System Logs with FUSION, ARBITRATION, and FAILSAFE
  const [logs, setLogs] = useState<LogEvent[]>([
    { id: 'log-1', timestamp: '08:14:02', category: 'SYSTEM', message: 'ARGUS-01 PROVING GROUND INITIALIZED (SENTINEL ONLINE)' },
    { id: 'log-2', timestamp: '08:14:05', category: 'FUSION', message: 'Weather-adaptive sensor fusion online: Kalman filter active' },
    { id: 'log-3', timestamp: '08:14:08', category: 'FUSION', message: 'Pit fog detected (82%). Shifting trust weight: Radar 48%, Thermal 32%' },
    { id: 'log-4', timestamp: '08:14:12', category: 'ARBITRATION', message: 'Redundancy arbitration consensus locked (97.4%). Fallback path active.' },
    { id: 'log-5', timestamp: '08:14:15', category: 'MISSION', message: 'Autonomous Haul Cycle active: Bench 4 -> Primary Crusher' },
    { id: 'log-6', timestamp: '08:14:22', category: 'AI', message: 'Thermal IR: Stalled CAT 793D haul truck localized at 42.0m' },
    { id: 'log-7', timestamp: '08:14:28', category: 'AI', message: 'FLIR LWIR: Miner in high-vis detected on right safety berm (14m)' },
  ]);

  // Append new log helper
  const addLog = useCallback((message: string, category: LogEvent['category'] = 'SYSTEM') => {
    const newLog: LogEvent = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: formatTime(),
      category,
      message,
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // =========================================================================
  // "HOW IT SEES" — WEATHER-ADAPTIVE SENSOR TRUST ENGINE
  // Dynamic smooth sigmoid/exponential transfer — never a hard cutover
  // =========================================================================
  const sensorTrustWeights: SensorTrustWeights = useMemo(() => {
    // Environmental severity index S: 0 (clear dry) to 1.0 (worst-case zero visibility)
    const fogFactor = weather.fogDensity / 100;
    const rainFactor = weather.rainMmHr / 120;
    const dustFactor = weather.ironDustPpm / 500;
    const severity = Math.min(1.0, Math.max(0, fogFactor * 0.65 + rainFactor * 0.25 + dustFactor * 0.2));

    // Raw weights calculation
    // Camera: 45% clear -> drops to ~3% in severe weather
    const rawCamera = Math.max(3, 45 * Math.exp(-2.6 * severity));
    
    // LiDAR: 35% clear -> drops to ~7% due to fog/rain backscatter
    const rawLidar = Math.max(7, 35 * Math.exp(-1.8 * severity));
    
    // 77GHz mmWave Radar: 14% clear -> surges to ~52% (completely penetrates fog and rain)
    const rawRadar = 14 + 38 * (1 / (1 + Math.exp(-6 * (severity - 0.35))));
    
    // Thermal LWIR 8-14μm: 6% clear -> surges to ~38% (penetrates cold fog & dust)
    const rawThermal = 6 + 32 * (1 / (1 + Math.exp(-5.5 * (severity - 0.4))));
    
    // Ultrasonic: steady 5% (near-field blind spot)
    const rawUltrasonic = 5;

    // Normalize so sum = 100%
    const total = rawCamera + rawLidar + rawRadar + rawThermal + rawUltrasonic;
    return {
      camera: Math.round((rawCamera / total) * 100),
      lidar: Math.round((rawLidar / total) * 100),
      radar: Math.round((rawRadar / total) * 100),
      thermal: Math.round((rawThermal / total) * 100),
      ultrasonic: Math.max(3, 100 - (
        Math.round((rawCamera / total) * 100) + 
        Math.round((rawLidar / total) * 100) + 
        Math.round((rawRadar / total) * 100) + 
        Math.round((rawThermal / total) * 100)
      )),
    };
  }, [weather]);

  // =========================================================================
  // "HOW IT DECIDES" — REDUNDANCY ARBITRATION LAYER
  // Primary (Camera+LiDAR) vs Fallback (Radar+Thermal) Cross-Check
  // =========================================================================
  const arbitrationState: RedundancyArbitrationState = useMemo(() => {
    const isHeavyDegraded = weather.fogDensity > 50 || weather.rainMmHr > 40;
    
    // Primary path confidence degrades rapidly under fog/rain
    const primaryConf = Math.max(12, Math.round(95 - (weather.fogDensity * 0.65) - (weather.rainMmHr * 0.3)));
    
    // Fallback path confidence remains high or rises in degraded weather
    const fallbackConf = Math.min(98, Math.round(75 + (weather.fogDensity * 0.2) + (weather.rainMmHr * 0.1)));

    const primarySteer = +2.4;
    const fallbackSteer = +2.8;
    const deltaTheta = Math.abs(primarySteer - fallbackSteer);
    const consensusScore = parseFloat(Math.max(65, 98.6 - deltaTheta * 2.2 - (isHeavyDegraded ? 2.5 : 0)).toFixed(1));

    let mode: RedundancyArbitrationState['arbitrationMode'] = 'CONSENSUS_LOCKED';
    if (deltaTheta > 6.0) {
      mode = 'DISCREPANCY_ALERT';
    } else if (isHeavyDegraded) {
      mode = 'ARBITRATED_FALLBACK';
    } else {
      mode = 'ARBITRATED_PRIMARY';
    }

    // Commanded speeds based on weather and safe stop
    let targetKmh = isHeavyDegraded ? 18.0 : 26.0;
    if (failSafe.safeStopActive || systemStatus === 'EMERGENCY_STOP') {
      targetKmh = 0.0;
    }

    return {
      primaryPath: {
        steeringDeg: primarySteer,
        targetSpeedKmh: targetKmh,
        confidence: primaryConf,
        status: primaryConf > 40 ? 'OPTIMAL' : 'DEGRADED',
        sensorSources: ['SONY_IMX_OPTICAL', '3D_LIDAR_HESAI'],
      },
      fallbackPath: {
        steeringDeg: fallbackSteer,
        targetSpeedKmh: targetKmh,
        confidence: fallbackConf,
        status: 'OPTIMAL',
        sensorSources: ['77GHZ_MMWAVE_RADAR', 'FLIR_LWIR_THERMAL'],
      },
      consensusScore,
      discrepancyDeltaTheta: deltaTheta,
      discrepancyDeltaSpeed: 0.4,
      arbitrationMode: mode,
      actuationCommand: {
        steeringAngleDeg: isHeavyDegraded ? fallbackSteer : primarySteer,
        brakingPressureBar: failSafe.safeStopActive ? 140 : 18,
        throttlePercent: failSafe.safeStopActive ? 0 : 38,
        gear: failSafe.safeStopActive ? 'N' : 'D1',
        retarderBrakePercent: isHeavyDegraded ? 25 : 0,
      },
    };
  }, [weather, failSafe.safeStopActive, systemStatus]);

  // Weather Preset Change Handler
  const handleSetWeatherPreset = (preset: MineWeatherCondition) => {
    let newWeather: Partial<WeatherState> = {};
    switch (preset) {
      case 'CLEAR_PIT':
        newWeather = {
          condition: 'CLEAR_PIT',
          fogDensity: 0,
          rainMmHr: 0,
          ironDustPpm: 25,
          humidityPercent: 42,
          visibilityMeters: 1400,
          opticalTransmissivity: 98.2,
        };
        addLog('Weather preset: Clear Pit (Dry). Optical & LiDAR at maximum trust.', 'FUSION');
        break;
      case 'IRON_DUST':
        newWeather = {
          condition: 'IRON_DUST',
          fogDensity: 20,
          rainMmHr: 0,
          ironDustPpm: 380,
          humidityPercent: 48,
          visibilityMeters: 45,
          opticalTransmissivity: 32.5,
        };
        addLog('Weather preset: Iron Ore Blasting Dust. Radar & Thermal taking priority.', 'FUSION');
        break;
      case 'DENSE_FOG':
        newWeather = {
          condition: 'DENSE_FOG',
          fogDensity: 88,
          rainMmHr: 4,
          ironDustPpm: 45,
          humidityPercent: 94,
          visibilityMeters: 5,
          opticalTransmissivity: 8.4,
        };
        addLog('Weather preset: Dense Pit Fog (<5m visibility). Radar & Thermal in full primary surge.', 'FUSION');
        break;
      case 'MONSOON_RAIN':
        newWeather = {
          condition: 'MONSOON_RAIN',
          fogDensity: 55,
          rainMmHr: 85,
          ironDustPpm: 15,
          humidityPercent: 98,
          visibilityMeters: 18,
          opticalTransmissivity: 19.0,
        };
        addLog('Weather preset: Torrential Monsoon Downpour (85mm/h). Rain scattering mitigated by 77GHz Radar.', 'FUSION');
        break;
      case 'EXTREME_ZERO_VISIBILITY':
        newWeather = {
          condition: 'EXTREME_ZERO_VISIBILITY',
          fogDensity: 100,
          rainMmHr: 110,
          ironDustPpm: 180,
          humidityPercent: 100,
          visibilityMeters: 2,
          opticalTransmissivity: 1.2,
        };
        addLog('CRITICAL: Worst-case zero visibility pit condition. 100% reliant on Redundancy Arbitration.', 'FUSION');
        break;
    }
    setWeather(prev => ({ ...prev, ...newWeather }));
  };

  // Weather Slider Update Handler
  const handleWeatherChange = (updated: Partial<WeatherState>) => {
    setWeather(prev => {
      const next = { ...prev, ...updated };
      // Recalculate visibility & transmissivity
      const opt = Math.max(1.0, 100 - (next.fogDensity * 0.85) - (next.rainMmHr * 0.4) - (next.ironDustPpm * 0.1));
      const vis = Math.max(2, Math.round(1400 * Math.pow(opt / 100, 2.2)));
      return {
        ...next,
        opticalTransmissivity: parseFloat(opt.toFixed(1)),
        visibilityMeters: vis,
      };
    });
  };

  // =========================================================================
  // "FAIL-SAFE" HANDLERS
  // Lost signal -> truck defaults to a safe stop. Physical kill-switch halts instantly.
  // =========================================================================
  const handleTriggerSignalLoss = () => {
    setFailSafe(prev => ({
      ...prev,
      signalLossTriggered: true,
      safeStopActive: true,
      statusMessage: 'SIGNAL LOSS (>500ms) — AUTONOMOUS SAFE STOP ENGAGED',
    }));
    setUplinkStatus('DISCONNECTED');
    setSignalDbm(null);
    setLatencyMs(null);

    // Stop motors & engage maximum hydraulic braking
    setLeftMotor(prev => ({ ...prev, speed: 0, direction: 'STOP', current: 0 }));
    setRightMotor(prev => ({ ...prev, speed: 0, direction: 'STOP', current: 0 }));
    setRoverTelemetry(prev => ({ ...prev, speedCms: 0, hydraulicBrakePressureBar: 140 }));
    if (mission.status === 'PATROLLING') {
      setMission(prev => ({ ...prev, status: 'PAUSED' }));
    }

    addLog('FAIL-SAFE TRIGGERED: Comms heartbeat lost > 500ms. Autonomous safe stop sequence executed.', 'FAILSAFE');
    addLog('Hydraulic brake accumulators charged to 140 bar. Throttle cut to 0%. Hazard strobes flashing.', 'FAILSAFE');
  };

  const handleTriggerWorkerKillSwitch = () => {
    setFailSafe(prev => ({
      ...prev,
      workerKillSwitchTriggered: true,
      safeStopActive: true,
      statusMessage: 'PHYSICAL WORKER KILL-SWITCH TRIPPED (CHASSIS LANYARD)',
    }));
    setSystemStatus('EMERGENCY_STOP');

    setLeftMotor(prev => ({ ...prev, speed: 0, direction: 'STOP', status: 'E-STOP' }));
    setRightMotor(prev => ({ ...prev, speed: 0, direction: 'STOP', status: 'E-STOP' }));
    setRoverTelemetry(prev => ({ ...prev, speedCms: 0, hydraulicBrakePressureBar: 160 }));

    addLog('HARDWARE FAIL-SAFE: Physical worker lanyard kill-switch pulled on chassis! Drive motors halted.', 'FAILSAFE');
  };

  const handleTriggerWorkerHazard = () => {
    setFailSafe(prev => ({
      ...prev,
      workerProximityHazard: true,
      safeStopActive: true,
      statusMessage: 'WORKER DETECTED IN 10m SAFETY PERIMETER (THERMAL IR)',
    }));

    setLeftMotor(prev => ({ ...prev, speed: 0, direction: 'STOP' }));
    setRightMotor(prev => ({ ...prev, speed: 0, direction: 'STOP' }));
    setRoverTelemetry(prev => ({ ...prev, speedCms: 0, hydraulicBrakePressureBar: 120 }));

    addLog('WORKER SAFETY ZONE BREACH: Thermal IR detected miner at 8.4m range. Autonomous safety hold engaged.', 'FAILSAFE');
  };

  const handleResetFailSafe = () => {
    setFailSafe({
      signalLossTriggered: false,
      heartbeatAgeMs: 22,
      workerKillSwitchTriggered: false,
      workerProximityHazard: false,
      safeStopActive: false,
      statusMessage: 'SYSTEM SECURE',
    });
    setSystemStatus('ONLINE');
    setUplinkStatus('CONNECTED');
    setSignalDbm(-62);
    setLatencyMs(19);
    setLeftMotor(prev => ({ ...prev, status: 'READY' }));
    setRightMotor(prev => ({ ...prev, status: 'READY' }));
    setRoverTelemetry(prev => ({ ...prev, hydraulicBrakePressureBar: 18 }));

    addLog('Fail-Safe disengaged and re-armed. Heartbeat restored. Redundancy arbitration active.', 'SYSTEM');
  };

  // Speed Limiter
  const handleSpeedLimiterChange = (val: number) => {
    setSpeedLimiter(val);
    setDriveVector(prev => ({ ...prev, speedLimitPercent: val }));
  };

  // Drive Vector updates & motor speed sync
  const handleDriveVectorChange = (newVector: DriveVector) => {
    setDriveVector(newVector);

    if (newVector.activeDirection === 'STOP' || (newVector.x === 0 && newVector.y === 0) || failSafe.safeStopActive) {
      setLeftMotor(prev => ({ ...prev, speed: 0, direction: 'STOP', current: 0.15 }));
      setRightMotor(prev => ({ ...prev, speed: 0, direction: 'STOP', current: 0.15 }));
      setRoverTelemetry(prev => ({ ...prev, speedCms: 0, motorLeftPercent: 0, motorRightPercent: 0 }));
      return;
    }

    const baseSpeed = Math.round(Math.abs(newVector.x !== 0 ? newVector.x : newVector.y) * 100);
    let lSpeed = baseSpeed;
    let rSpeed = baseSpeed;
    let lDir = 'FWD';
    let rDir = 'FWD';

    if (newVector.activeDirection === 'FWD') {
      lDir = 'FWD';
      rDir = 'FWD';
    } else if (newVector.activeDirection === 'REV') {
      lDir = 'REV';
      rDir = 'REV';
    } else if (newVector.activeDirection === 'LEFT') {
      lDir = 'REV';
      rDir = 'FWD';
    } else if (newVector.activeDirection === 'RIGHT') {
      lDir = 'FWD';
      rDir = 'REV';
    }

    const currentDraw = parseFloat((1.2 + (baseSpeed / 100) * 2.8).toFixed(2));
    const speedCmsVal = Math.round((baseSpeed / 100) * 85);

    setLeftMotor(prev => ({ ...prev, speed: lSpeed, direction: lDir as any, current: currentDraw }));
    setRightMotor(prev => ({ ...prev, speed: rSpeed, direction: rDir as any, current: currentDraw }));
    setRoverTelemetry(prev => ({
      ...prev,
      speedCms: speedCmsVal,
      motorLeftPercent: lSpeed,
      motorRightPercent: rSpeed,
    }));
  };

  // Autonomous Haul Cycle Handlers
  const handleStartPatrol = () => {
    setMission(prev => ({ ...prev, status: 'PATROLLING', currentWaypoint: 'BENCH-4' }));
    addLog('Autonomous Haul Cycle started [PIT-04]: Hauling hematite from Bench 4 to Primary Crusher', 'MISSION');
  };

  const handlePausePatrol = () => {
    setMission(prev => ({ ...prev, status: 'PAUSED' }));
    addLog('Autonomous Haul Cycle paused by dispatcher. Holding ramp position.', 'MISSION');
  };

  const handleReturnToBase = () => {
    setMission(prev => ({ ...prev, status: 'RETURNING', currentWaypoint: 'CRUSHER' }));
    addLog('Return to Primary Crusher Hopper initiated. Nav2 safe trajectory generated.', 'MISSION');
  };

  const handleStopMission = () => {
    setMission(prev => ({
      ...prev,
      status: 'STANDBY',
      currentWaypoint: '–',
      patrolProgressPercent: 0,
      missionDurationSeconds: 0,
      distanceTravelledM: 0,
    }));
    addLog('Haul mission terminated. Truck idling in safe parking berm.', 'MISSION');
  };

  // Uplink Connect & Disconnect
  const handleConnectUplink = () => {
    setUplinkConfig(prev => ({ ...prev, status: 'CONNECTING' }));
    addLog(`Connecting rosbridge to ws://${uplinkConfig.roverIp}:${uplinkConfig.port}...`, 'SYSTEM');

    setTimeout(() => {
      setUplinkStatus('CONNECTED');
      setUplinkConfig(prev => ({
        ...prev,
        status: 'CONNECTED',
        latencyMs: 18,
        signalStrengthDbm: -60,
      }));
      setSignalDbm(-60);
      setLatencyMs(18);
      setIsBenchSimulatorActive(true);

      setRoverTelemetry(prev => ({
        ...prev,
        batteryPercent: 88,
        batteryVoltage: 12.4,
        speedCms: 0,
        obstacleDistanceCm: 142,
        motorLeftPercent: 0,
        motorRightPercent: 0,
      }));

      addLog(`ROS 2 link established with ARGUS Proving Ground Rover`, 'SYSTEM');
    }, 1000);
  };

  const handleDisconnectUplink = () => {
    handleTriggerSignalLoss();
  };

  // Simulation & Uptime Tick Interval
  useEffect(() => {
    const timer = setInterval(() => {
      // Advance uptime if connected
      if (uplinkStatus === 'CONNECTED' && !failSafe.signalLossTriggered) {
        setRoverTelemetry(prev => ({
          ...prev,
          linkUptimeSeconds: prev.linkUptimeSeconds + 1,
        }));
      }

      // If autonomous mission is active and no e-stop, simulate haul cycle progress
      if (mission.status === 'PATROLLING' && systemStatus !== 'EMERGENCY_STOP' && !failSafe.safeStopActive) {
        setMission(prev => {
          const nextSec = prev.missionDurationSeconds + 1;
          const nextProgress = Math.min(100, prev.patrolProgressPercent + 1);
          const nextDist = (prev.distanceTravelledM || 0) + 0.5;
          let wp = prev.currentWaypoint;
          if (nextProgress > 75) wp = 'BERM-D';
          else if (nextProgress > 50) wp = 'BENCH-4';
          else if (nextProgress > 25) wp = 'SHOVEL-2';

          return {
            ...prev,
            missionDurationSeconds: nextSec,
            patrolProgressPercent: nextProgress >= 100 ? 0 : nextProgress,
            distanceTravelledM: parseFloat(nextDist.toFixed(1)),
            currentWaypoint: wp,
            currentLocation: {
              ...prev.currentLocation,
              gridX: parseFloat((42.8 + Math.sin(nextSec * 0.1) * 8).toFixed(1)),
              gridY: parseFloat((19.4 + Math.cos(nextSec * 0.1) * 6).toFixed(1)),
            },
          };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [uplinkStatus, mission.status, systemStatus, failSafe.safeStopActive, failSafe.signalLossTriggered]);

  if (currentView === 'WEBSITE') {
    return (
      <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 relative">
        {/* Full 21-Section Project Argus Platform Website */}
        <ArgusLandingPage
          onOpenSentinel={() => {
            playTacticalBeep(1100);
            setCurrentView('SENTINEL');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenArchitecture={() => {
            playTacticalBeep(980);
            setIsArchitectureOpen(true);
          }}
        />

        {/* Floating Quick Sentinel Access Button */}
        <aside aria-label="Quick launch Sentinel console" className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => {
              playTacticalBeep(1100);
              setCurrentView('SENTINEL');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/50 active:scale-95 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
            </span>
            <span>Launch Sentinel Console</span>
          </button>
        </aside>

        {/* Technical Architecture Modal */}
        <ArchitectureModal
          isOpen={isArchitectureOpen}
          onClose={() => setIsArchitectureOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080c] bg-tactical-grid text-slate-200 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header with Back to Website Action */}
      <Header
        systemStatus={systemStatus}
        uplinkStatus={uplinkStatus}
        aiStatus={aiStatus}
        signalDbm={signalDbm}
        latencyMs={latencyMs}
        developmentPhase={developmentPhase}
        weatherCondition={weather.condition}
        safeStopActive={failSafe.safeStopActive}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onEmergencyStop={handleTriggerWorkerKillSwitch}
        onBackToWebsite={() => {
          playTacticalBeep(880);
          setCurrentView('WEBSITE');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto p-3 sm:p-4 lg:p-6 space-y-4">
        {/* ROW 1: 3-Phase Development Pathway Selector */}
        <section aria-label="Development Pathway">
          <DevelopmentPhaseSelector
            currentPhase={developmentPhase}
            onSelectPhase={(phase) => {
              setDevelopmentPhase(phase);
              addLog(`Development phase switched to: ${phase}`, 'SYSTEM');
            }}
          />
        </section>

        {/* ROW 2: Rover & Mining Haul Truck Telemetry Strip */}
        <section aria-label="Rover Live Telemetry">
          <RoverTelemetry
            telemetry={roverTelemetry}
            isUplinkConnected={uplinkStatus === 'CONNECTED'}
          />
        </section>

        {/* ROW 3: Primary Tactical Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (8 cols on lg): Multi-Sensor Perception, Weather Fusion & Redundancy Arbitration */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* 1. Multi-Sensor Perception Suite ("HOW IT SEES") */}
            <CameraSurveillance
              weather={weather}
              weights={sensorTrustWeights}
              onAddLog={addLog}
              detectedObjectsCount={aiVisionState.objectsDetectedCount}
              detectedPersonsCount={aiVisionState.personsDetectedCount}
              onUpdateDetectionCounts={(objects, persons) => {
                setAiVisionState(prev => ({
                  ...prev,
                  objectsDetectedCount: objects,
                  personsDetectedCount: persons,
                }));
              }}
            />

            {/* 2. Weather-Adaptive Fusion Layer ("HOW IT SEES") */}
            <WeatherFusionEngine
              weather={weather}
              weights={sensorTrustWeights}
              onWeatherChange={handleWeatherChange}
              onSetPreset={handleSetWeatherPreset}
            />

            {/* 3. Redundancy Arbitration Layer ("HOW IT DECIDES") */}
            <RedundancyArbitration
              arbitration={arbitrationState}
              isDegradedVisibility={weather.fogDensity > 50 || weather.rainMmHr > 40}
            />

            {/* 4. Autonomous Haul Cycle (Pit-04 Circuit) */}
            <AutonomousPatrol
              mission={mission}
              onStartPatrol={handleStartPatrol}
              onPausePatrol={handlePausePatrol}
              onReturnToBase={handleReturnToBase}
              onStopMission={handleStopMission}
              isEmergencyStop={systemStatus === 'EMERGENCY_STOP' || failSafe.safeStopActive}
            />
          </div>

          {/* Right Column (4 cols on lg): Fail-Safe, Controls, Radar & Motors */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* 1. Fail-Safe Monitor & Physical Kill-Switch ("FAIL-SAFE") */}
            <FailSafeMonitor
              failSafe={failSafe}
              onTriggerSignalLoss={handleTriggerSignalLoss}
              onTriggerKillSwitch={handleTriggerWorkerKillSwitch}
              onTriggerWorkerHazard={handleTriggerWorkerHazard}
              onResetFailSafe={handleResetFailSafe}
            />

            {/* 2. Emergency Stop Interlock */}
            <EmergencyStop
              isEmergencyStop={systemStatus === 'EMERGENCY_STOP' || failSafe.safeStopActive}
              onTriggerEmergencyStop={handleTriggerWorkerKillSwitch}
              onResetEmergencyStop={handleResetFailSafe}
            />

            {/* 3. Drive Vector Control (WASD) */}
            <DriveControl
              vector={driveVector}
              onVectorChange={handleDriveVectorChange}
              onAddLog={addLog}
              isEmergencyStop={systemStatus === 'EMERGENCY_STOP' || failSafe.safeStopActive}
            />

            {/* 4. Radar & Proximity Perimeter */}
            <ObstacleMonitor
              obstacleData={obstacleData}
              isUplinkConnected={uplinkStatus === 'CONNECTED'}
            />

            {/* 5. AI Vision System Inference Status */}
            <AiVisionPanel
              visionState={aiVisionState}
              onUpdateConfidence={(val) => {
                setAiVisionState(prev => ({ ...prev, confidenceThreshold: val }));
              }}
              onAddLog={addLog}
            />

            {/* 6. Motor Telemetry & Speed Limiter */}
            <MotorTelemetry
              leftMotor={leftMotor}
              rightMotor={rightMotor}
              speedLimiter={speedLimiter}
              onSpeedLimiterChange={handleSpeedLimiterChange}
              onAddLog={addLog}
              isEmergencyStop={systemStatus === 'EMERGENCY_STOP' || failSafe.safeStopActive}
            />
          </div>
        </div>

        {/* ROW 4: Secondary Tactical Grid (Uplink Config & System Activity Log) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <UplinkConfigPanel
              config={uplinkConfig}
              onConfigChange={(field, value) => {
                setUplinkConfig(prev => ({ ...prev, [field]: value }));
              }}
              onConnect={handleConnectUplink}
              onDisconnect={handleDisconnectUplink}
              onAddLog={addLog}
            />
          </div>

          <div className="lg:col-span-8">
            <SystemLog
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          </div>
        </div>
      </main>

      {/* Mission Briefing & Architecture Specification Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Tactical Status Footer */}
      <footer className="w-full border-t border-emerald-500/20 bg-[#04070a] px-4 py-2.5 text-[11px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold">ARGUS-01 CONSOLE // AUTONOMOUS MINE SAFETY</span>
          <span className="text-slate-600">|</span>
          <span>TACTICAL PROVING GROUND</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">OPEN-CAST IRON ORE PIT-04</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">ROS 2 HUMBLE // NAV2 // FREERTOS</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">STATUS: OPERATIONAL</span>
        </div>
      </footer>
    </div>
  );
}
