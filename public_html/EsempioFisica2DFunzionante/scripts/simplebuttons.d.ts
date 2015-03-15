interface SimpleButtonParams {
    id: string;
    left: number;
    top: number;
    right: number;
    bottom: number;
    callback: () => void;
    hoverCallback?: () => void;
}
interface SimpleButton {
    id: string;
    left: number;
    top: number;
    right: number;
    bottom: number;
    callback: () => void;
    hoverCallback?: () => void;
    hovering: boolean;
}
declare class SimpleButtonManager {
    static buttons: {
        [id: string]: SimpleButton;
    };
    static mouseX: number;
    static mouseY: number;
    static loopButtons(callback): void;
    static checkOverlap(x, y, button): boolean;
    static init(inputDevice: InputDevice): void;
    static addButton(params: SimpleButtonParams): void;
    static clearButtons(): void;
}
