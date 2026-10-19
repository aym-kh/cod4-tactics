export interface PanOffset {
    x: number;
    y: number;
}

export interface DragState {
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
}

export type UtilityType = 'frag' | 'flash' | 'smoke';
export type TeamSide = 'marines' | 'opfor';
export type TeamFilter = TeamSide | 'all';
export type MatchPhase = 'early' | 'mid' | 'late';

/** Position on the map, in percentage of the map frame (0-100). */
export interface MapPoint {
    x: number;
    y: number;
}

export interface Lineup {
    id: string;
    /** Map id, e.g. 'backlot'. */
    map: string;
    name: string;
    utility: UtilityType;
    team: TeamSide;
    phase: MatchPhase;
    /** Where the player stands / starts the throw. */
    position: MapPoint;
}

export interface LineupFilter {
    map: string;
    utility: UtilityType;
    team: TeamFilter;
    phase: MatchPhase;
}
