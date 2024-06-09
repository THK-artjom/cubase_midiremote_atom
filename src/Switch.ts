//import { Button } from "./Button";
//todo: inherit from Button but somehow inheritance is not working for Cubase 13 as Reflect is not suported

export class Switch {
    public readonly click: MR_SurfaceCustomValueVariable;
    public readonly shiftClick: MR_SurfaceCustomValueVariable;

    private readonly shiftActive: MR_SurfaceCustomValueVariable;
    public readonly clickState: MR_SurfaceCustomValueVariable;
    public readonly shiftState: MR_SurfaceCustomValueVariable;

    private readonly button: MR_Button;

    constructor(x: number, y: number, private command: number, surface: MR_DeviceSurface, private communication: Communication, btnWidth: number, btnHeight: number, private isShiftLatching: boolean) {
        this.click = surface.makeCustomValueVariable('button cc ' + command);
        this.shiftClick = surface.makeCustomValueVariable('button cc ' + command + 'shift');
        this.shiftActive = surface.makeCustomValueVariable('button cc ' + command + 'shiftActive');
        this.clickState = surface.makeCustomValueVariable('button cc ' + command + 'clickSatte');
        this.shiftState = surface.makeCustomValueVariable('button cc ' + command + 'shiftState');

        this.button = surface.makeButton(x, y, btnWidth, btnHeight);
        this.communication.subscribeToMidiControlChange(this.button, command);

        this.button.mSurfaceValue.mOnProcessValueChange = this.onProcessValueChanged.bind({});
        this.clickState.mOnProcessValueChange = this.onStateChanged.bind({});
        this.shiftState.mOnProcessValueChange = this.onShiftStateChanged.bind({});
    }

    private buttonLampOn(activeDevice: MR_ActiveDevice) {
        this.communication.buttonLampOn(activeDevice, this.command);
    }

    private buttonLampOff(activeDevice: MR_ActiveDevice) {
        this.communication.buttonLampOff(activeDevice, this.command);
    }

    private onProcessValueChanged: (activeDevice: MR_ActiveDevice, value: number, diff: number) => void = (activeDevice, value, diff) => {
        if (value <= 0)
            return;

        if (this.shiftActive.getProcessValue(activeDevice)) {
            console.log("shifted switch " + this.command + " value " + value);
            this.shiftClick.setProcessValue(activeDevice, 127);

            if (this.shiftState.getProcessValue(activeDevice)
                && this.isShiftLatching == false) {
                this.shiftState.setProcessValue(activeDevice, 0);
            }
            else if (this.isShiftLatching == false) {
                this.shiftState.setProcessValue(activeDevice, 127);
            }
        }
        else {
            console.log("switch " + this.command + " value " + value);
            this.click.setProcessValue(activeDevice, 127);

            if (this.clickState.getProcessValue(activeDevice)) {
                this.clickState.setProcessValue(activeDevice, 0);
            }
            else {
                this.clickState.setProcessValue(activeDevice, 127);
            }
        }

        this.setState(activeDevice);
    }

    private setState(activeDevice: MR_ActiveDevice) {
        if (this.shiftActive.getProcessValue(activeDevice)) {

            if (this.isShiftLatching == false) {
                this.buttonLampOn(activeDevice);
                return;
            }

            if (this.shiftState.getProcessValue(activeDevice)) {
                this.buttonLampOn(activeDevice);
            }
            else {
                this.buttonLampOff(activeDevice);
            }
        }
        else {
            if (this.clickState.getProcessValue(activeDevice)) {
                this.buttonLampOn(activeDevice);
            }
            else {
                this.buttonLampOff(activeDevice);
            }
        }
    }

    private onStateChanged: (activeDevice: MR_ActiveDevice, value: number, diff: number) => void = (activeDevice, value, diff) => {

        if (this.shiftActive.getProcessValue(activeDevice)) {
            console.log("shifted switch " + this.command + " value " + value);
            return;
        }
        else {
            console.log("switch " + this.command + " value " + value);
            if (value) {
                this.buttonLampOn(activeDevice);
            }
            else {
                this.buttonLampOff(activeDevice);
            }
        }
    }

    private onShiftStateChanged: (activeDevice: MR_ActiveDevice, value: number, diff: number) => void = (activeDevice, value, diff) => {

        if (this.shiftActive.getProcessValue(activeDevice)) {
            console.log("shifted switch " + this.command + " value " + value);
            if (value) {
                this.buttonLampOn(activeDevice);
            }
            else {
                this.buttonLampOff(activeDevice);
            }
        }
        else {
            console.log("switch " + this.command + " value " + value);
            return;
        }
    }

    public shift(activeDevice: MR_ActiveDevice) {
        this.shiftActive.setProcessValue(activeDevice, 1);
        this.setState(activeDevice);
    }

    public unShift(activeDevice: MR_ActiveDevice) {
        this.shiftActive.setProcessValue(activeDevice, 0);
        this.setState(activeDevice);
    }
}
