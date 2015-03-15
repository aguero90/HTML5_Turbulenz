declare class DynamicCameraController {
    public version: number;
    public transformTypes: {
        linear: number;
    };
    public cameraType: {
        fixed: number;
        rail: number;
        chase: number;
    };
    public gd: GraphicsDevice;
    public md: MathDevice;
    public camera: Camera;
    public curMode: number;
    public camTargetPos: any;
    public transformMode: number;
    public rate: number;
    public chaseRate: number;
    public currentTime: number;
    public startTime: number;
    public endTime: number;
    public camCurUp: any;
    public trackCurPos: any;
    public isTracking: boolean;
    public setRate(rate): void;
    public setChaseRate(rate): void;
    public setTracking(isTracking): void;
    public setCameraTargetPos(pos, time?, delta?): void;
    public setTrackTarget(pos): void;
    public setCameraMode(mode): boolean;
    public snapCameraToTarget(): void;
    public isCameraAtTarget(): boolean;
    public getLookAtMatrix();
    public transform(delta): void;
    public rotate(): void;
    public update(delta): void;
    static create(camera: Camera, gd: GraphicsDevice): DynamicCameraController;
}
