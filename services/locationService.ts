import * as Location from "expo-location";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined"
  | "restricted";

class LocationService {
  private hasRequestedPermission = false;

  public async getPermissionStatus(): Promise<LocationPermissionStatus> {
    const { status } = await Location.getForegroundPermissionsAsync();

    switch (status) {
      case Location.PermissionStatus.GRANTED:
        return "granted";
      case Location.PermissionStatus.DENIED:
        return "denied";
      case Location.PermissionStatus.UNDETERMINED:
        return "undetermined";
      default:
        return "restricted";
    }
  }

  public async requestLocationPermission(): Promise<boolean> {
    try {
      this.hasRequestedPermission = true;
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === Location.PermissionStatus.GRANTED;
    } catch (error) {
      if (__DEV__) {
        console.error("[LocationService] Permission request failed:", error);
      }
      return false;
    }
  }

  public async getCurrentLocation(): Promise<Coordinates | null> {
    try {
      const permissionStatus = await this.getPermissionStatus();

      if (permissionStatus !== "granted") {
        if (__DEV__) {
          console.log("[LocationService] No permission to get location");
        }
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      if (__DEV__) {
        console.error("[LocationService] Failed to get location:", error);
      }
      return null;
    }
  }

  public calculateDistance(
    coord1: Coordinates,
    coord2: Coordinates
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371000;
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1.latitude)) *
        Math.cos(toRad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  public hasUserDeniedPermission(): boolean {
    return this.hasRequestedPermission;
  }
}

export const locationService = new LocationService();
