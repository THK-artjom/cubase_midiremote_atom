import { Communication } from "./Communication";

export class Button {
    //public stateVariable: MR_SurfaceCustomValueVariable;

    private readonly button: MR_Button; //only for the relate to

    constructor(x: number, y: number, private command: number, surface: MR_DeviceSurface, private communication: Communication, btnWidth: number, btnHeight: number) {
        //this.stateVariable = surface.makeCustomValueVariable('button cc ' + command);
        this.button = surface.makeButton(x, y, btnWidth, btnHeight);

        communication.subscribeToMidiControlChange(this.button, command);

        this.button.mSurfaceValue.mOnProcessValueChange = this.onProcessValueChange.bind({});
    }

    private onProcessValueChange: (activeDevice: MR_ActiveDevice, value: number, diff: number) => void = (activeDevice, value) => {
        console.log("button cmd: " + this.command + " value " + value); //TODO doesn't work cuz it is overriden
    }

    public buttonLampOn(activeDevice: MR_ActiveDevice) {
        this.communication.buttonLampOn(activeDevice, this.command);
    }

    public buttonLampOff(activeDevice: MR_ActiveDevice) {
        this.communication.buttonLampOff(activeDevice, this.command);
    }
}
