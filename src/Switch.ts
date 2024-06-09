//import { Button } from "./Button";
//todo: inherit from Button but somehow inheritance is not working for Cubase 13 as Reflect is not suported

export class Switch {
    //public readonly stateVariable: MR_SurfaceCustomValueVariable;
    //private readonly shiftVariable: MR_SurfaceCustomValueVariable;
    //private readonly shiftActive: MR_SurfaceCustomValueVariable;

    public readonly button: MR_Button; //only for the relate to

    constructor(x: number, y: number, private command: number, surface: MR_DeviceSurface, private communication: Communication, btnWidth: number, btnHeight: number) {
        //this.stateVariable = surface.makeCustomValueVariable('button cc ' + command);
        //this.shiftVariable = surface.makeCustomValueVariable('button cc ' + command + 'shift');
        //this.shiftActive = surface.makeCustomValueVariable('button cc ' + command + 'shift active');
        this.button = surface.makeButton(x, y, btnWidth, btnHeight);

        this.communication.subscribeToMidiControlChange(this.button, command);

        //this.button.mSurfaceValue.mOnProcessValueChange = this.onProcessValueChanged.bind({});

        //this.stateVariable.mOnProcessValueChange = this.toggleState.bind({});
    }

    public buttonLampOn(activeDevice: MR_ActiveDevice) {
        this.communication.buttonLampOn(activeDevice, this.command);
    }

    public buttonLampOff(activeDevice: MR_ActiveDevice) {
        this.communication.buttonLampOff(activeDevice, this.command);
    }

    /*private onProcessValueChanged: (activeDevice: MR_ActiveDevice, value: number, diff: number) => void = (activeDevice, value, diff) => {
        console.log("switch " + this.command + " value " + value)
        if (value <= 0)
            return;

        if (this.shiftActive.getProcessValue(activeDevice)) {
            this.shiftVariable.setProcessValue(activeDevice, value);
            return;
        }

        if (this.stateVariable.getProcessValue(activeDevice)) {
            this.stateVariable.setProcessValue(activeDevice, 0);
        }
        else {
            this.stateVariable.setProcessValue(activeDevice, 1);
        }
    }

    private toggleState: (activeDevice: MR_ActiveDevice, value: number, diff: number) => void = (activeDevice, value, diff) => {
        if (value) {
            this.communication.sendMidiControlChange(1, this.command, 127, activeDevice);
        }
        else {
            this.communication.sendMidiControlChange(1, this.command, 0, activeDevice);
        }
    }

    public shift(activeDevice: MR_ActiveDevice) {
        this.shiftActive.setProcessValue(activeDevice, 1);
    }

    public unShift(activeDevice: MR_ActiveDevice) {
        this.shiftActive.setProcessValue(activeDevice, 0);
    }

    public isToggled(activeDevice: MR_ActiveDevice): boolean {
        return this.stateVariable.getProcessValue(activeDevice) > 0;
    }*/
}
