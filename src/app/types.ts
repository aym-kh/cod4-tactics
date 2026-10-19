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
export type MatchPhase = 'early' | 'mid' | 'late';
export type StanceType = 'standing' | 'crouch' | 'walk' | 'jump';
export type PlacingTarget = 'start' | 'landing';

/**
 * Viewer filter values. 'all' disables a dimension, so a freshly navigated
 * map always shows everything its tactics JSON contains.
 */
export type UtilityFilter = UtilityType | 'all';
export type TeamFilter = TeamSide | 'all';
export type PhaseFilter = MatchPhase | 'all';

/** Position on the map, in percentage of the map frame (0-100). */
export interface MapPoint {
    x: number;
    y: number;
}

/** A published tactic powering the map markers. Mirrors the JSON schema. */
export interface Lineup {
    id: string;
    /** Map id, e.g. 'backlot'. */
    map: string;
    name: string;
    utility: UtilityType;
    team: TeamSide;
    phase: MatchPhase;
    stance: StanceType | null;
    description: string;
    videoUrl: string | null;
    /** Where the player stands / starts the throw. */
    start: MapPoint;
    /** Nade landing point (optional). */
    landing?: MapPoint | null;
}

/** A tactic being authored in the editor; coordinates may still be missing. */
export interface TacticDraft extends Omit<Lineup, 'start'> {
    start: MapPoint | null;
    landing: MapPoint | null;
}