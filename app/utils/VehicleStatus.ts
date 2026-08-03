import type { Vehicle } from "./../../api/services/vehicleService";

const STORAGE_KEY = "vehicleStatusOverrides";

type VehicleStatusMap = Record<string, string>;

function getStatusMap(): VehicleStatusMap {
  if (typeof window === "undefined") {
    return {};
  }

  const savedStatuses = localStorage.getItem(STORAGE_KEY);

  if (!savedStatuses) {
    return {};
  }

  try {
    return JSON.parse(savedStatuses) as VehicleStatusMap;
  } catch {
    return {};
  }
}

function saveStatusMap(statusMap: VehicleStatusMap): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(statusMap)
  );
}

export function setLocalVehicleStatus(
  vehicleId: number,
  status: string
): void {
  const statusMap = getStatusMap();

  statusMap[String(vehicleId)] = status;

  saveStatusMap(statusMap);
}

export function clearLocalVehicleStatus(
  vehicleId: number
): void {
  const statusMap = getStatusMap();

  delete statusMap[String(vehicleId)];

  saveStatusMap(statusMap);
}

export function getLocalVehicleStatus(
  vehicleId: number
): string | null {
  const statusMap = getStatusMap();

  return statusMap[String(vehicleId)] ?? null;
}

export function applyLocalVehicleStatus(
  vehicle: Vehicle
): Vehicle {
  const localStatus = getLocalVehicleStatus(vehicle.id);

  return {
    ...vehicle,
    status: localStatus ?? vehicle.status,
  };
}

export function isVehicleAvailable(
  vehicle: Vehicle
): boolean {
  const vehicleWithLocalStatus =
    applyLocalVehicleStatus(vehicle);

  const normalizedStatus =
    vehicleWithLocalStatus.status
      ?.trim()
      .toLocaleLowerCase("tr-TR");

  return (
    normalizedStatus === "aktif" ||
    normalizedStatus === "active"
  );
}