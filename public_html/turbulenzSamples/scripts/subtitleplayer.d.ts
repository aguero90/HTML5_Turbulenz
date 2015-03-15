interface SubtitlePlayerParameters {
    mathDevice: MathDevice;
    graphicsDevice: GraphicsDevice;
    fontManager: FontManager;
    shaderManager: ShaderManager;
    fontURL: string;
    shaderURL: string;
    fontTechniqueName: string;
    maxWidthFactor: number;
    lowEdgeFactor: number;
    languageCode?: string;
    defaultLanguageCode?: string;
    onReady?: () => void;
    onError: (msg: string) => void;
}
interface SubtitleCaption {
    startTime: number;
    duration: number;
    text: {
        [locale: string]: string;
    };
}
interface SubtitleScript {
    [idx: number]: SubtitleCaption;
    length: number;
}
declare class SubtitlePlayer {
    private md;
    private gd;
    private font;
    private technique;
    private techniqueParameters;
    private script;
    private nextActiveIdx;
    private maxWidthFactor;
    private lowEdgeFactor;
    private languageCode;
    private defaultLanguageCode;
    private scratchDimensions;
    private scratchDrawParameters;
    constructor(params: SubtitlePlayerParameters);
    public setScript(script: SubtitleScript): void;
    public getDuration(): number;
    public reset(): void;
    public setLanguageCode(languageCode: string): void;
    public draw(timeMS: number): boolean;
    static create(params: SubtitlePlayerParameters): SubtitlePlayer;
}
