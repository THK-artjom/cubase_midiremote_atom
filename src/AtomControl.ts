import { Communication } from './Communication';
import { Switch } from './Switch';
import { TriggerPad } from './TriggerPad';
import { Button } from './Button';

export class AtomControl {
    /* left side */
    public setup: Switch;
    public setLoop: Switch;

    public editor: Switch;
    public nudge: Switch;

    public showHide: Button;
    public preset: Button;
    public bank: Button;

    public fullLevel: Button;
    public noteRepeat: Button;

    private shift: Button;

    /* right side */
    public up: Button;
    public down: Button;
    public left: Button;
    public right: Button;
    public select: Button;
    public zoom: Switch;

    public click: Switch;
    public record: Switch;
    public start: Switch;
    public stop: Switch;

    public pads: TriggerPad[] = new Array(16);

    /*public knobs: Knobs[] =  new Array(4);*/

    constructor(private surface: MR_DeviceSurface, private midiInput: MR_DeviceMidiInput, private communication : Communication, private btnHeight: number, private btnWidth: number) {

        var labelSong = surface.makeLabelField(0, 2 + 0 * this.btnHeight, this.btnWidth, this.btnHeight)
        this.setup = new Switch(0, 2 + 1 * this.btnHeight, 86, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        labelSong.relateTo(this.setup.button)
        this.setLoop = new Switch(0, 2 + 2 * this.btnHeight, 85, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)

        var labelEvent = surface.makeLabelField(0, 7 + 0 * this.btnHeight, this.btnWidth, this.btnHeight)
        this.editor = new Switch(0, 7 + 1 * this.btnHeight, 31, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        labelEvent.relateTo(this.editor.button)
        this.nudge = new Switch(0, 7 + 2 * this.btnHeight, 30, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)

        var labelInst = surface.makeLabelField(0, 12 + 0 * this.btnHeight, this.btnWidth, this.btnHeight)
        this.showHide = new Button(0, 12 + 1 * this.btnHeight, 29, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        labelInst.relateTo(this.showHide.button)
        this.preset = new Button(0, 12 + 2 * this.btnHeight, 27, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        this.bank = new Button(0, 12 + 3 * this.btnHeight, 26, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)

        var labelMode = surface.makeLabelField(0, 18 + 0 * this.btnHeight, this.btnWidth, this.btnHeight)
        this.fullLevel = new Button(0, 18 + 1 * this.btnHeight, 25, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        labelMode.relateTo(this.fullLevel.button)
        this.noteRepeat = new Button(0, 18 + 2 * this.btnHeight, 24, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        this.shift = new Button(0, 21.5 + 1 * this.btnHeight, 32, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)

        var labelNav = surface.makeLabelField(25, 2 + 0 * this.btnHeight, this.btnWidth, this.btnHeight)
        this.up = new Button(25, 2 + 1 * this.btnHeight, 87, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        labelNav.relateTo(this.up.button)
        this.down = new Button(25, 2 + 2 * this.btnHeight, 89, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        this.left = new Button(25, 2 + 3 * this.btnHeight, 90, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        this.right = new Button(25, 2 + 4 * this.btnHeight, 102, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        this.select = new Button(25, 2 + 5 * this.btnHeight, 103, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)
        this.zoom = new Switch(25, 2 + 6 * this.btnHeight, 104, surface, this.midiInput, communication, this.btnWidth, this.btnHeight)

        var labelTransport = surface.makeLabelField(25, 13 + 0 * this.btnHeight, this.btnWidth, this.btnHeight);
        this.click = new Switch(25, 13 + 1 * this.btnHeight, 105, surface, this.midiInput, communication, this.btnWidth, this.btnHeight);
        labelTransport.relateTo(this.click.button)
        this.record = new Switch(25, 13 + 2 * this.btnHeight, 107, surface, this.midiInput, communication, this.btnWidth, this.btnHeight);
        this.start = new Switch(25, 13 + 3 * this.btnHeight, 109, surface, this.midiInput, communication, this.btnWidth, this.btnHeight);
        this.stop = new Switch(25, 13 + 4 * this.btnHeight, 111, surface, this.midiInput, communication, this.btnWidth, this.btnHeight);

        this.pads = this.makeTriggers(36, 7, 10);

        this.shift.stateVariable.onProcessValueChange = this.onShift.bind({});
    }

    private makeTriggers(startCC: number, x: number, y: number): TriggerPad[] {
        var overflow = false
        var note = 0

        var labelTab = this.surface.makeLabelField(x, y - 2.5 * this.btnHeight, this.btnWidth, this.btnHeight)
        var pads = new Array(16);
        for (var rowIdx = 0; rowIdx < 4; rowIdx++) {
            for (var colIdx = 0; colIdx < 4; colIdx++) {

                if (overflow == false)
                    note = startCC + rowIdx * 4 + colIdx
                else
                    note++

                if (note > 127) //last cc is 127 then it starts on 0
                {
                    note = 0
                    overflow = true
                }

                pads[rowIdx * 4 + colIdx + 1] = new TriggerPad(x + colIdx * this.btnWidth, y + 7 - rowIdx * this.btnWidth, note, this.surface, this.midiInput, this.communication, this.btnWidth);
            }
        }

        labelTab.relateTo(pads[1].pad)
        return pads
    }

    private onShift: (activeDevice: MR_ActiveDevice, value: number, diff: number) => void = (activeDevice, value, diff) => {
        console.log("Shifted: " + value);
        if (value) {
            this.nudge.shift(activeDevice);

            this.click.shift(activeDevice);
            this.record.shift(activeDevice);
            this.start.shift(activeDevice);
            this.stop.shift(activeDevice);
        }
        else {
            this.nudge.unShift(activeDevice);

            this.click.unShift(activeDevice);
            this.record.unShift(activeDevice);
            this.start.unShift(activeDevice);
            this.stop.unShift(activeDevice);
        }
    }
}
