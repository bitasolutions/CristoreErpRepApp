import {Platform} from 'react-native';
import * as Device from 'expo-device';

/** Returns a human-readable device identifier, e.g. "Android 13" or "iOS 17.2". */
export const getDeviceName = (): string => {
  const normalize = (value?: string | null) => {
    const trimmed = value?.trim() ?? '';
    if (!trimmed || trimmed.toLowerCase() === 'unknown') {
      return '';
    }
    return trimmed;
  };

  const deviceName = normalize(Device.deviceName);
  if (deviceName) {
    return deviceName;
  }

  const brand = normalize(Device.brand);
  const model = normalize(Device.modelName);
  if (brand || model) {
    return `${brand} ${model}`.trim();
  }

  const osName =
    normalize(Device.osName) || (Platform.OS === 'ios' ? 'iOS' : 'Android');
  const osVersion =
    normalize(Device.osVersion) || String(Platform.Version ?? '');
  return `${osName} ${osVersion}`.trim();
};
