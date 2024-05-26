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

    public shift: Button;

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

    constructor(surface: MR_DeviceSurface, midiInput: MR_DeviceMidiInput, communication: Communication, btnHeight: number, btnWidth: number) {

        var labelSong = surface.makeLabelField(0, 2 + 0 * btnHeight, btnWidth, btnHeight)
        this.setup = new Switch(0, 2 + 1 * btnHeight, 86, surface, midiInput, communication, btnWidth, btnHeight)
        labelSong.relateTo(this.setup.button)
        this.setLoop = new Switch(0, 2 + 2 * btnHeight, 85, surface, midiInput, communication, btnWidth, btnHeight)

        var labelEvent = surface.makeLabelField(0, 7 + 0 * btnHeight, btnWidth, btnHeight)
        this.editor = new Switch(0, 7 + 1 * btnHeight, 31, surface, midiInput, communication, btnWidth, btnHeight)
        labelEvent.relateTo(this.editor.button)
        this.nudge = new Switch(0, 7 + 2 * btnHeight, 30, surface, midiInput, communication, btnWidth, btnHeight)

        var labelInst = surface.makeLabelField(0, 12 + 0 * btnHeight, btnWidth, btnHeight)
        this.showHide = new Button(0, 12 + 1 * btnHeight, 29, surface, midiInput, communication, btnWidth, btnHeight)
        labelInst.relateTo(this.showHide.button)
        this.preset = new Button(0, 12 + 2 * btnHeight, 27, surface, midiInput, communication, btnWidth, btnHeight)
        this.bank = new Button(0, 12 + 3 * btnHeight, 26, surface, midiInput, communication, btnWidth, btnHeight)

        var labelMode = surface.makeLabelField(0, 18 + 0 * btnHeight, btnWidth, btnHeight)
        this.fullLevel = new Button(0, 18 + 1 * btnHeight, 25, surface, midiInput, communication, btnWidth, btnHeight)
        labelMode.relateTo(this.fullLevel.button)
        this.noteRepeat = new Button(0, 18 + 2 * btnHeight, 24, surface, midiInput, communication, btnWidth, btnHeight)
        this.shift = new Button(0, 21.5 + 1 * btnHeight, 32, surface, midiInput, communication, btnWidth, btnHeight)

        var labelNav = surface.makeLabelField(25, 2 + 0 * btnHeight, btnWidth, btnHeight)
        this.up = new Button(25, 2 + 1 * btnHeight, 87, surface, midiInput, communication, btnWidth, btnHeight)
        labelNav.relateTo(this.up.button)
        this.down = new Button(25, 2 + 2 * btnHeight, 89, surface, midiInput, communication, btnWidth, btnHeight)
        this.left = new Button(25, 2 + 3 * btnHeight, 90, surface, midiInput, communication, btnWidth, btnHeight)
        this.right = new Button(25, 2 + 4 * btnHeight, 102, surface, midiInput, communication, btnWidth, btnHeight)
        this.select = new Button(25, 2 + 5 * btnHeight, 103, surface, midiInput, communication, btnWidth, btnHeight)
        this.zoom = new Switch(25, 2 + 6 * btnHeight, 104, surface, midiInput, communication, btnWidth, btnHeight)

        var labelTransport = surface.makeLabelField(25, 13 + 0 * btnHeight, btnWidth, btnHeight);
        this.click = new Switch(25, 13 + 1 * btnHeight, 105, surface, midiInput, communication, btnWidth, btnHeight);
        labelTransport.relateTo(this.click.button)
        this.record = new Switch(25, 13 + 2 * btnHeight, 107, surface, midiInput, communication, btnWidth, btnHeight);
        this.start = new Switch(25, 13 + 3 * btnHeight, 109, surface, midiInput, communication, btnWidth, btnHeight);
        this.stop = new Switch(25, 13 + 4 * btnHeight, 111, surface, midiInput, communication, btnWidth, btnHeight);

        this.pads = this.makeTriggers(36, 7, 10, btnHeight, btnWidth, surface, midiInput, communication);

        //this.addShiftFunctionality();
    }

    private makeTriggers(startCC: number, x: number, y: number, btnHeight: number, btnWidth: number, surface: MR_DeviceSurface, midiInput: MR_DeviceMidiInput, communication: Communication): TriggerPad[] {
        var overflow = false
        var note = 0

        var labelTab = surface.makeLabelField(x, y - 2.5 * btnHeight, btnWidth, btnHeight)
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

                pads[rowIdx * 4 + colIdx + 1] = new TriggerPad(x + colIdx * btnWidth, y + 7 - rowIdx * btnWidth, note, surface, midiInput, communication, btnWidth);
            }
        }

        labelTab.relateTo(pads[1].pad)
        return pads
    }

    /*
    private addShiftFunctionality() {
        this.shift.subscribeToClick((activeDevice, value, diff) => {
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
        });
    }*/
}
