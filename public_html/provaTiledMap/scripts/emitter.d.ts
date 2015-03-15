interface EmitterParticle {
    velocity: any;
    position: any;
    dieTime: number;
    size: number;
    color: any;
    invlifeTime: number;
}
declare class EmitterParticleSystem {
    static version: number;
    public md: MathDevice;
    public numActiveParticles: number;
    public spawnNextParticle: number;
    public worldPosition: any;
    public particles: EmitterParticle[];
    public dirtyWorldExtents: boolean;
    public colorList: any[];
    public v3temp: any;
    public extents: Float32Array;
    public maxSpawnTime: number;
    public minSpawnTime: number;
    public diffSpawnTime: number;
    public maxLifetime: number;
    public minLifetime: number;
    public diffLifetime: number;
    public size: number;
    public growRate: number;
    public maxParticles: number;
    public gravity: number;
    public geometryInstance: GeometryInstance;
    public indexBuffer: IndexBuffer;
    public setWorldPosition(worldPosition): void;
    public createParticle(particle): void;
    public initialize(): void;
    public update(currentTime, deltaTime): void;
    public getWorldExtents(): Float32Array;
    public destroy(): void;
    static create(md: MathDevice, gd: GraphicsDevice, parameters): EmitterParticleSystem;
}
declare class EmitterParticleSystemRenderer {
    static version: number;
    public gd: GraphicsDevice;
    public md: MathDevice;
    public update(particleSystem, camera): void;
    public updateRenderableWorldExtents(particleSystem): void;
    public initialize(particleSystem, material, node): void;
    public destroy(particleSystems): void;
    static create(gd: GraphicsDevice, md: MathDevice): EmitterParticleSystemRenderer;
}
declare class Emitter {
    static version: number;
    public gd: GraphicsDevice;
    public md: MathDevice;
    public particleSystem: EmitterParticleSystem;
    public particleSystemRenderer: EmitterParticleSystemRenderer;
    public material: Material;
    public node: SceneNode;
    public updateExtentsTime: number;
    public update(currentTime, deltaTime, camera): void;
    public setMaterial(material): void;
    public setParticleColors(colorList): void;
    public getNumActiveParticles(): number;
    public destroy(): void;
    static create(gd: GraphicsDevice, md: MathDevice, material, node, parameters): Emitter;
}
