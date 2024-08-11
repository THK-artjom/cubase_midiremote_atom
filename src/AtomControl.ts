import { Communication } from './Communication';
import { Switch } from './Switch';
import { TriggerPad } from './TriggerPad';
import { Button } from './Button';
import { Knob } from './Knob';

export class AtomControl {
    /* left side */
    public setup: Switch;
    public setLoop: Switch;

    public editor: Button;
    public nudge: Switch;

    public showHide: Button;
    public preset: Switch; //yellow and blue 27/28
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
    public zoom: Button;

    public click: Switch;
    public record: Switch;
    public start: Switch; //green and light blue 109/110
    public stop: Switch;

    public pads: TriggerPad[] = new Array(17); //16 pads starting with id 1 for easier usage
    public knobs: Knob[] = new Array(5); //4 knobs starting with id 1 for easier usage

    constructor(private surface: MR_DeviceSurface, private communication: Communication, private btnHeight: number, private btnWidth: number) {

        var labelSong = this.surface.makeLabelField(0, 2 + 0 * this.btnHeight, this.btnWidth, this.btnHeight)
        this.setup = new Switch(0, 2 + 1 * this.btnHeight, 86, surface, communication, this.btnWidth, this.btnHeight, false)
        //labelSong.relateTo(this.setup.button) //todo add relates to later
        this.setLoop = new Switch(0, 2 + 2 * this.btnHeight, 85, surface, communication, this.btnWidth, this.btnHeight, true)

        var labelEvent = this.surface.makeLabelField(0, 7 + 0 * this.btnHeight, this.btnWidth, this.btnHeight)
        this.editor = new Button(0, 7 + 1 * this.btnHeight, 31, surface, communication, this.btnWidth, this.btnHeight)
        //labelEvent.relateTo(this.editor.button)
        this.nudge = new Switch(0, 7 + 2 * this.btnHeight, 30, surface, communication, this.btnWidth, this.btnHeight, false)

        var labelInst = this.surface.makeLabelField(0, 12 + 0 * this.btnHeight, this.btnWidth, this.btnHeight)
        this.showHide = new Button(0, 12 + 1 * this.btnHeight, 29, surface, communication, this.btnWidth, this.btnHeight)
        //labelInst.relateTo(this.showHide.button)
        this.preset = new Switch(0, 12 + 2 * this.btnHeight, 27, surface, communication, this.btnWidth, this.btnHeight, true)
        this.bank = new Button(0, 12 + 3 * this.btnHeight, 26, surface, communication, this.btnWidth, this.btnHeight)

        var labelMode = this.surface.makeLabelField(0, 18 + 0 * this.btnHeight, this.btnWidth, this.btnHeight)
        this.fullLevel = new Button(0, 18 + 1 * this.btnHeight, 25, surface, communication, this.btnWidth, this.btnHeight)
        //labelMode.relateTo(this.fullLevel.button)
        this.noteRepeat = new Button(0, 18 + 2 * this.btnHeight, 24, surface, communication, this.btnWidth, this.btnHeight)
        this.shift = new Button(0, 21.5 + 1 * this.btnHeight, 32, surface, communication, this.btnWidth, this.btnHeight)

        var labelNav = this.surface.makeLabelField(25, 2 + 0 * this.btnHeight, this.btnWidth, this.btnHeight)
        this.up = new Button(25, 2 + 1 * this.btnHeight, 87, surface, communication, this.btnWidth, this.btnHeight)
        //labelNav.relateTo(this.up.button)
        this.down = new Button(25, 2 + 2 * this.btnHeight, 89, surface, communication, this.btnWidth, this.btnHeight)
        this.left = new Button(25, 2 + 3 * this.btnHeight, 90, surface, communication, this.btnWidth, this.btnHeight)
        this.right = new Button(25, 2 + 4 * this.btnHeight, 102, surface, communication, this.btnWidth, this.btnHeight)
        this.select = new Button(25, 2 + 5 * this.btnHeight, 103, surface, communication, this.btnWidth, this.btnHeight)
        this.zoom = new Button(25, 2 + 6 * this.btnHeight, 104, surface, communication, this.btnWidth, this.btnHeight)

        var labelTransport = this.surface.makeLabelField(25, 13 + 0 * this.btnHeight, this.btnWidth, this.btnHeight);
        this.click = new Switch(25, 13 + 1 * this.btnHeight, 105, surface, communication, this.btnWidth, this.btnHeight, true);
        //labelTransport.relateTo(this.click.button) //todo add relates to later
        this.record = new Switch(25, 13 + 2 * this.btnHeight, 107, surface, communication, this.btnWidth, this.btnHeight, false);
        this.start = new Switch(25, 13 + 3 * this.btnHeight, 109, surface, communication, this.btnWidth, this.btnHeight, true);
        this.stop = new Switch(25, 13 + 4 * this.btnHeight, 111, surface, communication, this.btnWidth, this.btnHeight, false);

        this.pads = this.makeTriggers(36, 7, 10);
        this.knobs = this.makeKnobStrip(14, 5, 5);
    }

    private makeKnobStrip(firstKnobChanel: number, x: number, y: number): Knob[] {
        var knobStrip = new Array(5);
        var knobSize = 1.2 * this.btnWidth;

        for (var knobIdx = 0; knobIdx < 4; knobIdx++) {
            knobStrip[knobIdx + 1] = new Knob(x + knobIdx * knobSize, y, firstKnobChanel + knobIdx, this.surface, this.communication, knobSize)
        }
        return knobStrip
    }

    private makeTriggers(startCC: number, x: number, y: number): TriggerPad[] {
        var overflow = false
        var note = 0

        var labelTab = this.surface.makeLabelField(x, y - 2.5 * this.btnHeight, this.btnWidth, this.btnHeight)
        var pads = new Array(17);
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

                pads[rowIdx * 4 + colIdx + 1] = new TriggerPad(x + colIdx * this.btnWidth, y + 7 - rowIdx * this.btnWidth, note, this.surface, this.communication, this.btnWidth);
            }
        }

        labelTab.relateTo(pads[1].pad)
        return pads
    }
}
