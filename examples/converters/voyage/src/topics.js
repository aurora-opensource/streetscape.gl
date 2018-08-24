export const CURRENT_POSE             = '/current_pose';
export const PLANNER_PATH             = '/planner/path';
export const FOREGROUND_POINTS        = '/commander/points_fore';
export const BACKGROUND_POINTS        = '/commander/points_back';
export const TRACKS_LIST              = '/commander/perception_dct/track_list';
export const TRACKS_MARKERS           = '/commander/perception_dct/marker_array';
export const TRAJECTORY_CIRCLE_MARKER = '/closest_waypoint_marker';
export const ROUTE                    = '/commander/route_viz/route';

export const ALL = [
  CURRENT_POSE,
  PLANNER_PATH,
  FOREGROUND_POINTS,
  BACKGROUND_POINTS,
  TRACKS_LIST,
  TRACKS_MARKERS,
  TRAJECTORY_CIRCLE_MARKER,
  ROUTE
];