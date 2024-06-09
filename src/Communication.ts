export class Communication {
    constructor(private midiOutput: MR_DeviceMidiOutput, private midiInput: MR_DeviceMidiInput) {
    }

    /**
     * @param {number} cc chanel code 1-16
     * @param {number} note 0-127 60=C1
     * @param {number} velocity 0-127
     * @param {MR_ActiveDevice} activeDevice session reference for midi control
     */
    public sendMidiNoteOff(cc: number, note: number, velocity: number, activeDevice: MR_ActiveDevice) {
        if (velocity < 0)
            velocity = 0;
        if (velocity > 127)
            velocity = 127;

        var midiNoteOff = 0x80;
        var chanelValue = midiNoteOff + cc - 1;

        this.midiOutput.sendMidi(activeDevice, [chanelValue, note, velocity]);
        console.log("send midi note Off on chanel " + cc + " note " + note + " velocity " + velocity);
    }

    /**
     * @param {number} cc chanel code 1-16
     * @param {number} note 36 == C1
     * @param {number} velocity 0-127
     * @param {MR_ActiveDevice} activeDevice session reference for midi control
     */
    public sendMidiNoteOn(cc: number, note: number, velocity: number, activeDevice: MR_ActiveDevice) {
        if (velocity < 0)
            velocity = 0;
        if (velocity > 127)
            velocity = 127;

        var midiNoteOn = 0x90;
        var chanelValue = midiNoteOn + cc - 1;

        console.log("send midi [" + chanelValue + ", " + note + ", " + velocity + "]");
        this.midiOutput.sendMidi(activeDevice, [chanelValue, note, velocity]);
        console.log("send midi note On on chanel " + cc + " note " + note + " velocity " + velocity);
    }

    /**
     * @param {number} chanel 1-16
     * @param {number} control 0-127
     * @param {number} value 0-127
     * @param {MR_ActiveDevice} activeDevice session reference for midi control
     */
    public sendMidiControlChange(chanel: number, control: number, value: number, activeDevice: MR_ActiveDevice) {
        if (value < 0)
            value = 0;
        if (value > 127)
            value = 127;

        var midiControlChange = 0xB0;
        var chanelValue = midiControlChange + chanel - 1;

        this.midiOutput.sendMidi(activeDevice, [chanelValue, control, value]);
        console.log("send midi note Off chanel " + chanel + " control " + control + "  value  " + value);
    }

    public subscribeToMidiControlChange(button: MR_SurfaceElement, command: number) {
        button.mSurfaceValue.mMidiBinding.setInputPort(this.midiInput)
            //.setOutputPort(communication.midiOutput) //will send feedback to button automatically (disabled to be controllable)
            .bindToControlChange(0, command); //MidiChanel 1 id:0 in nativeMode; midiChanel 10 (id:9) in midiMode
    }

    public buttonLampOn(activeDevice: MR_ActiveDevice, command: number) {
        this.sendMidiControlChange(1, command, 127, activeDevice);
    }

    public buttonLampOff(activeDevice: MR_ActiveDevice, command: number) {
        this.sendMidiControlChange(1, command, 0, activeDevice);
    }

    public subscribeToMidiNote(pad: any, note: number) {
        pad.mSurfaceValue.mMidiBinding
            .setInputPort(this.midiInput)
            .bindToNote(0, note); //chanel 10 (id:9) C1 = 36
    }
}
