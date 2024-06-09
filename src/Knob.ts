import { Communication } from "./Communication";

export class Knob {

    public readonly knob : MR_Knob;

    constructor(x: number, y: number, command: number, surface: MR_DeviceSurface, communication: Communication, knobSize: number) {
        this.knob = surface.makeKnob(x, y, knobSize, knobSize);
        communication.subscribeToMidiControlChange(this.knob, command);
    }
}