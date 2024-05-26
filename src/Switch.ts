export class Switch {
    public stateVariable: MR_SurfaceCustomValueVariable;
    public shiftVariable: MR_SurfaceCustomValueVariable;
    public button: MR_Button;
    private shiftActive: MR_SurfaceCustomValueVariable;

    constructor(x: number, y: number, command: number, surface: MR_DeviceSurface, midiInput: MR_DeviceMidiInput, communication: Communication, btnWidth: number, btnHeight: number) {
        this.stateVariable = surface.makeCustomValueVariable('button cc ' + command);
        this.shiftVariable = surface.makeCustomValueVariable('button cc ' + command + 'shift');
        this.shiftActive = surface.makeCustomValueVariable('button cc ' + command + 'shift active');
        this.button = surface.makeButton(x, y, btnWidth, btnHeight);

        this.button.mSurfaceValue.mMidiBinding.setInputPort(midiInput)
            //.setOutputPort(midiOutput) //will send feedback to button automatically (disabled to be controllable)
            .bindToControlChange(0, command); //MidiChanel 1 id:0

        this.button.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
            if (value == false)
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
        }.bind({});

        this.stateVariable.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number, diff: number) {
            if (value) {
                communication.sendMidiControlChange(1, command, 127, activeDevice);
            }
            else {
                communication.sendMidiControlChange(1, command, 0, activeDevice);
            }
        };
    }

    public shift(activeDevice: MR_ActiveDevice) {
        this.shiftActive.setProcessValue(activeDevice, 1);
    }

    public unShift(activeDevice: MR_ActiveDevice) {
        this.shiftActive.setProcessValue(activeDevice, 0);
    }
}
