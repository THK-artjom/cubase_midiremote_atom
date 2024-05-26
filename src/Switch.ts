//import { Button } from "./Button";
//todo: inherit from Button but somehow inheritance is not working for Cubase 13 as Reflect is not suported

export class Switch {
    private readonly stateVariable: MR_SurfaceCustomValueVariable;
    private readonly shiftVariable: MR_SurfaceCustomValueVariable;
    private readonly shiftActive: MR_SurfaceCustomValueVariable;
    
    public readonly button: MR_Button; //only for the relate to

    constructor(x: number, y: number, private command: number, surface: MR_DeviceSurface, midiInput: MR_DeviceMidiInput, private communication: Communication, btnWidth: number, btnHeight: number) {
        this.stateVariable = surface.makeCustomValueVariable('button cc ' + command);
        this.shiftVariable = surface.makeCustomValueVariable('button cc ' + command + 'shift');
        this.shiftActive = surface.makeCustomValueVariable('button cc ' + command + 'shift active');
        this.button = surface.makeButton(x, y, btnWidth, btnHeight);

        this.button.mSurfaceValue.mMidiBinding.setInputPort(midiInput)
            //.setOutputPort(midiOutput) //will send feedback to button automatically (disabled to be controllable)
            .bindToControlChange(0, command); //MidiChanel 1 id:0 in nativeMode; midiChanel 10 (id:9) in midiMode

        this.button.mSurfaceValue.mOnProcessValueChange = this.onProcessValueChanged.bind({});

        this.stateVariable.mOnProcessValueChange = this.toggleState.bind({});
    }

    private onProcessValueChanged: (activeDevice: MR_ActiveDevice, value: number, diff: number) => void = (activeDevice, value, diff) => {
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
    }
}
