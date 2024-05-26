export class Button {
    private readonly stateVariable: MR_SurfaceCustomValueVariable;
    private readonly shiftVariable: MR_SurfaceCustomValueVariable;
    private readonly shiftActive: MR_SurfaceCustomValueVariable;

    public readonly button: MR_Button; //only for the relate to

    constructor(x: number, y: number, private command: number, surface: MR_DeviceSurface, midiInput: MR_DeviceMidiInput, communication: Communication, btnWidth: number, btnHeight: number) {
        this.stateVariable = surface.makeCustomValueVariable('button cc ' + command);
        this.shiftVariable = surface.makeCustomValueVariable('button cc ' + command + 'shift');
        this.shiftActive = surface.makeCustomValueVariable('button cc ' + command + 'shift active');
        this.button = surface.makeButton(x, y, btnWidth, btnHeight);

        this.button.mSurfaceValue.mMidiBinding.setInputPort(midiInput)
            //.setOutputPort(midiOutput) //will send feedback to button automatically (disabled to be controllable)
            .bindToControlChange(0, command); //MidiChanel 1 id:0 in nativeMode; midiChanel 10 (id:9) in midiMode

        this.button.mSurfaceValue.mOnProcessValueChange = this.onProcessValueChange.bind({});
    }

    private onProcessValueChange: (activeDevice: MR_ActiveDevice, value: number, diff: number) => void = (activeDevice, value) => {
        console.log("button cmd: " + this.command + " value " + value);
        if (this.shiftActive.getProcessValue(activeDevice)) {
            this.shiftVariable.setProcessValue(activeDevice, value);
        }
        else
            this.stateVariable.setProcessValue(activeDevice, value);
    }

    public shift(activeDevice: MR_ActiveDevice) {
        this.shiftActive.setProcessValue(activeDevice, 1);
    }

    public unShift(activeDevice: MR_ActiveDevice) {
        this.shiftActive.setProcessValue(activeDevice, 0);
    }

    public subscribeToClick(subscriber: (activeDevice: MR_ActiveDevice, value: number, diff: number) => any) {
        console.log("Adding command binding to button: " + this.command)
        var previousBind = this.button.mSurfaceValue.mOnProcessValueChange;

        this.button.mSurfaceValue.mOnProcessValueChange = (activeDevice: MR_ActiveDevice, value: number, diff: number) => {
            previousBind(activeDevice, value, diff);
            subscriber(activeDevice, value, diff);
        };//.bind({});
    }
}
