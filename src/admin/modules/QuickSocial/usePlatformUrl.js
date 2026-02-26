import { PLATFORM_CONFIG } from "./platformConfig";

export const usePlatformUrl = () => {
  const generateUrl = (platformId, mode) => {
    const config = PLATFORM_CONFIG[platformId];
    if (!config) return "";

    return config[mode] || config.profile || "";
  };

  const getPlatformsByGroup = (group) => {
    return Object.entries(PLATFORM_CONFIG)
      .filter(([_, value]) => value.group === group)
      .map(([key]) => key);
  };

  return { generateUrl, getPlatformsByGroup };
};
