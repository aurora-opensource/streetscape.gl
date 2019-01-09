/* eslint-disable camelcase */
export const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const MAP_STYLE = 'mapbox://styles/mapbox/light-v9';

export const XVIZ_CONFIG = {
  PLAYBACK_FRAME_RATE: 10
};

export const CODE_SAMPLE_METADATA = `// metadata
xvizMetadataBuilder
  .stream('/vehicle_pose')
  .category('pose')
  
  .stream('/object/tracking_point')
  .category('primitive')
  .type('circle')
 
  .startTime(1000)
  .endTime(1010);
`;

export const CODE_SAMPLE_FRAME = `// frame
const timestamp = 1000;

xvizBuilder.pose('/vehicle_pose')
  .timestamp(timestamp)
  .mapOrigin(-122.4, 37.8, 0)
  .orientation(0, 0, 0);
  
xvizBuilder.primitive('/object/tracking_point')
  .circle([10, 10, 0])
  .style({
    fill_color: '#fb0'
  })
  .id('object-1')

  .circle([-5, 20, 0])
  .style({
    fill_color: '#08f'
  })
  .id('object-2');
`;
