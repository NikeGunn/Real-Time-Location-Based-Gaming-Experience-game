import React from 'react';
import { Polygon } from 'react-native-maps';
import { Zone } from '../../types/game';
import { ZONE_STATUS } from '../../utils/constants';

interface ZoneTileProps {
  zone: Zone;
  status: keyof typeof ZONE_STATUS;
  color: string;
  isNearby: boolean;
  onPress: () => void;
}

export const ZoneTile: React.FC<ZoneTileProps> = ({
  zone,
  status,
  color,
  isNearby,
  onPress
}) => {  // Create a square grid tile around the zone coordinates
  const tileSize = 0.001; // Adjust for desired tile size (roughly 100m)
  const coordinates = [
    {
      latitude: zone.center_lat - tileSize / 2,
      longitude: zone.center_lng - tileSize / 2,
    },
    {
      latitude: zone.center_lat - tileSize / 2,
      longitude: zone.center_lng + tileSize / 2,
    },
    {
      latitude: zone.center_lat + tileSize / 2,
      longitude: zone.center_lng + tileSize / 2,
    },
    {
      latitude: zone.center_lat + tileSize / 2,
      longitude: zone.center_lng - tileSize / 2,
    },
  ];

  return (
    <Polygon
      coordinates={coordinates}
      fillColor={`${color}60`} // Add transparency (60 = 37.5% opacity)
      strokeColor={color}
      strokeWidth={isNearby ? 3 : 1}
      tappable={true}
      onPress={onPress}
    />
  );
};
