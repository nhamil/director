/*
 * Declarations for types used in Director 
 */

// declare namespace NodeJS {
//     interface global {

//     }
// }

// declare interface Directive {
//     preUpdate(): void; 
//     update(): void; 
//     postUpdate(): void; 
// }

// declare interface RoomDirective extends Directive {
//     preUpdateRoom(room: Room): void; 
//     updateRoom(room: Room): void; 
//     postUpdateRoom(room: Room): void; 
// }

// declare function Task(creep: Creep): boolean; 

// declare interface Role {
//     name: string; 
//     shortName: string; 
//     createBody(energy: number): BodyPartConstant[]; 
// }

// declare interface SpawnRequest {
//     room: Room; 
//     role: Role; 
//     now: boolean; 
//     priority: number; 
// }

// declare interface SpawnRequestOptions {
//     now?: boolean; 
//     priority?: number; 
// }

// declare interface Director {

//     getRooms(): Room[]; 
//     getOwnedRooms(): Room[]; 

//     getCreepsByHome(room: Room): Creep[]; 
//     getCreepRolesByHome(room: Room, role: Role): Creep[]; 
//     getIdleCreepRolesByHome(room: Room, role: Role): Creep[]; 

//     addSpawnRequest(room: Room, role: Role, opts?: SpawnRequestOptions): void; 
//     getSpawnRequest(room: Room): SpawnRequest; 

// }

// declare interface RoleOptions {
//     name: string; 
//     shortName: string; 
//     base: BodyPartConstant[]; 
//     add: BodyPartConstant[]; 
//     buildStyle: 'standard' | 'soldier'; 
//     movesPerPart: number; 
//     maxParts: number; 
// }
