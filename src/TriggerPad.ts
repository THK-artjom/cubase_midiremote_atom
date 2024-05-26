import { Communication } from './Communication';
import { Colors } from './Colors';

export class TriggerPad {
    private red: MR_SurfaceCustomValueVariable;
    private green: MR_SurfaceCustomValueVariable;
    private blue: MR_SurfaceCustomValueVariable;
    private state: MR_SurfaceCustomValueVariable;

    private communication: Communication;
    private colors: Colors

    public pad: MR_TriggerPad

    constructor(x: number, y: number, private note: number, surface: MR_DeviceSurface, midiInput: MR_DeviceMidiInput, communication: Communication, triggerSize: number) {
        this.note = note;
        this.communication = communication;
        this.colors = new Colors();

        this.pad = surface.makeTriggerPad(x, y, triggerSize, triggerSize);
        this.pad.mSurfaceValue.mMidiBinding
            .setInputPort(midiInput)
            //.setOutputPort(midiOutput)
            .bindToNote(0, note); //chanel 10 (id:9) C1 = 36
        console.log('created binding to note: ' + note);

        this.red = surface.makeCustomValueVariable('pad ' + note + ' red');
        this.green = surface.makeCustomValueVariable('pad ' + note + ' green');
        this.blue = surface.makeCustomValueVariable('pad ' + note + ' blue');
        this.state = surface.makeCustomValueVariable('pad ' + note + ' value');

        this.pad.mSurfaceValue.mOnProcessValueChange = this.onProcessValueChange.bind({});
    }

    private onProcessValueChange: (activeDevice: MR_ActiveDevice, value: number, diff: number) => void = (activeDevice, value, diff) => {
        value *= 100;
        console.log('Pad ' + this.note + ' value' + value);
        this.state.setProcessValue(activeDevice, value);
        if (value <= 0)
            this.setTriggerPadColor(this.note, [this.red.getProcessValue(activeDevice), this.green.getProcessValue(activeDevice), this.blue.getProcessValue(activeDevice)], activeDevice);
        else if (value > 0
            && value < 60)
            this.setTriggerPadColor(this.note, this.colors.buttonPress, activeDevice);
        else if (value >= 60)
            this.setTriggerPadColor(this.note, this.colors.white, activeDevice);
    }

    public toggleColor(rgb: [number, number, number], activeDevice: MR_ActiveDevice) {
        this.red.setProcessValue(activeDevice, rgb[0]);
        this.green.setProcessValue(activeDevice, rgb[1]);
        this.blue.setProcessValue(activeDevice, rgb[2]);
        this.setTriggerPadColor(this.note, rgb, activeDevice);
    }

    /**
     * @param {number} note 36-51,
     * @param {[number, number, number]} rgb
     * @param {MR_ActiveDevice} activeDevice
     */
    private setTriggerPadColor(note: number, rgb: [number, number, number], activeDevice: MR_ActiveDevice) {
        this.communication.sendMidiNoteOn(1, note, 127, activeDevice); //solid
        //sendMidiNoteOn(1, note, 2, activeDevice) //breathe
        //sendMidiNoteOn(1, note, 1, activeDevice) //blink
        //sendMidiNoteOn(1, note, 0, activeDevice) //off
        this.communication.sendMidiNoteOn(2, note, rgb[0], activeDevice);
        this.communication.sendMidiNoteOn(3, note, rgb[1], activeDevice);
        this.communication.sendMidiNoteOn(4, note, rgb[2], activeDevice);
        console.log("send rgb on for note " + note + " R " + rgb[0] + " G " + rgb[1] + " B " + rgb[2]);
    }
}
