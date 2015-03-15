declare var loadCustomFileShape: (shapeName: any, shape: any, fileShape: any, loadParams: any) => any;
declare class MorphShape extends Geometry {
    public initialWeight: number;
    static create(initialWeight?): MorphShape;
}
declare class Morph {
    public version: number;
    public maxMorphs: number;
    public semanticMap: {
        POSITION: string[];
        NORMAL: string[];
        TEXCOORD: string[];
        POSITION0: string[];
        NORMAL0: string[];
        TEXCOORD0: string[];
    };
    public remainingAttributes: string[];
    public reference: Reference;
    public baseShape: Geometry;
    public halfExtents: any;
    public center: any;
    public type: string;
    public semanticsNamesArray: string[];
    public shapes: Geometry[];
    public addShapes(morphShapes): boolean;
    public generateSemanticsNames(shapes): boolean;
    public getShapeCount(): number;
    public destroy(): void;
    static create(baseShape): Morph;
}
declare class MorphInstance {
    public version: number;
    public maxUpdateValue: number;
    public morph: Morph;
    public geometryType: string;
    public halfExtents: any;
    public center: any;
    public techniqueParameters: TechniqueParameters;
    public sharedMaterial: Material;
    public worldExtents: any;
    public worldUpdate: number;
    public worldExtentsUpdate: number;
    public sorting: any;
    public rendererInfo: any;
    public renderUpdate: any;
    public drawParameters: DrawParameters;
    public node: SceneNode;
    public cachedSemantics: {
        [hash: string]: Semantics;
    };
    public semanticsHashes: string[];
    public disabled: boolean;
    public clone(): MorphInstance;
    public setNode(node): void;
    public getNode(): SceneNode;
    public setMaterial(material): void;
    public getMaterial(): Material;
    public getWorldExtents();
    public addCustomWorldExtents(customWorldExtents): void;
    public removeCustomWorldExtents(): void;
    public getCustomWorldExtents();
    public hasCustomWorldExtents(): boolean;
    public destroy(): void;
    public prepareDrawParameters(drawParameters): void;
    public generateSemantics(graphicsDevice, semanticsNames);
    public setWeights(weights): void;
    static registerEffects(mathDevice, renderer, shaderManager, effectManager): void;
    static create(morph: Morph, sharedMaterial: Material): MorphInstance;
}
