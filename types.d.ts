/*
 * Declarations for types used in Director 
 */

declare interface Directive {
    preFrame(): void; 
    update(): void; 
    postFrame(): void; 

    room: Room; 
}

declare interface Task {
    update(): void; 

    creep: Creep; 
}

declare interface SpawnRequest {
    room: Room; 
    templateName: string; 
    now: boolean; 
    priority: number; 
}

declare interface SpawnRequestOptions {
    now?: boolean; 
    priority?: number; 
}

declare interface Director {
    update(): void; 
    addDirective(dir: Directive): void; 
    addTask(task: Task): void; 
    requestSpawn(room: Room, template: string, opts: SpawnRequestOptions): void; 
    getSpawnRequest(room: Room): SpawnRequest; 
}
