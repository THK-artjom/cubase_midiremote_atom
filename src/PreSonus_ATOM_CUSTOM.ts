import { AtomControl } from './AtomControl';
import { Communication } from './Communication';

//----------------------------------------------------------------------------------------------------------------------
// 1. DRIVER SETUP - create driver object, midi ports and detection information
//----------------------------------------------------------------------------------------------------------------------

const midiremote_api = require('midiremote_api_v1');
var deviceDriver = midiremote_api.makeDeviceDriver('PreSonus', 'ATOM_CUSTOM', 'Ath0m S.');

deviceDriver.setUserGuide('ATOM_Owners_Manual_V4_EN_050120221.pdf')

var midiInput = deviceDriver.mPorts.makeMidiInput();
var midiOutput = deviceDriver.mPorts.makeMidiOutput();

var state = { activeMapping: undefined }

deviceDriver.makeDetectionUnit().detectPortPair(midiInput, midiOutput)
    .expectInputNameEquals('ATOM')
    .expectOutputNameEquals('ATOM')

var surface = deviceDriver.mSurface

var communication = new Communication(midiOutput);

function toggleStartButton(state: number, activeDevice: MR_ActiveDevice) {
    if (state)
        communication.sendMidiControlChange(1, 109, 127, activeDevice)
    else
        communication.sendMidiControlChange(1, 109, 0, activeDevice)
}

function toggleStopButton(state: number, activeDevice: MR_ActiveDevice) {
    if (state)
        communication.sendMidiControlChange(1, 111, 127, activeDevice)
    else
        communication.sendMidiControlChange(1, 111, 0, activeDevice)
}

//----------------------------------------------------------------------------------------------------------------------
// 2. SURFACE LAYOUT - create control elements and midi bindings
//----------------------------------------------------------------------------------------------------------------------

var btnWidth = 3
var btnHeight = 1.5

function makeKnobStrip(firstKnobChanel: number, x: number, y: number) {
    var knobStrip = []
    var knobSize = 1.2 * btnWidth

    for (var knobIdx = 0; knobIdx < 4; knobIdx++) {
        knobStrip[knobIdx + 1] = surface.makeKnob(x + knobIdx * knobSize, y, knobSize, knobSize)
        knobStrip[knobIdx + 1].mSurfaceValue.mMidiBinding
            .setInputPort(midiInput)
            .bindToControlChange(0, firstKnobChanel + knobIdx)
    }
    return knobStrip
}

var atom = new AtomControl(surface, midiInput, communication, btnHeight, btnWidth);


function makeSurfaceElements() {
    var surfaceElements = {}
    surfaceElements.knobs = makeKnobStrip(14, 5, 5)
    return surfaceElements
}

var surfaceElements = makeSurfaceElements()

//----------------------------------------------------------------------------------------------------------------------
// 3. HOST MAPPING - create mapping pages and host bindings
//----------------------------------------------------------------------------------------------------------------------

function subscribeTransportFunctions(page: MR_FactoryMappingPage) {

    /* feedback cubase -> btn colors */
    page.makeValueBinding(atom.start.stateVariable, page.mHostAccess.mTransport.mValue.mStart)
    page.makeValueBinding(atom.record.stateVariable, page.mHostAccess.mTransport.mValue.mRecord)
    page.makeValueBinding(atom.click.stateVariable, page.mHostAccess.mTransport.mValue.mMetronomeActive)

    /* command binding atom -> cubase */
    page.makeCommandBinding(atom.stop.stateVariable, 'Transport', 'Stop')
    page.makeCommandBinding(atom.start.shiftVariable, 'Transport', 'Cycle')
    page.makeCommandBinding(atom.stop.shiftVariable, 'Edit', 'Undo')
    page.makeCommandBinding(atom.record.shiftVariable, 'File', 'Save')
    /*
        atom.start.stateVariable.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
            console.log("start:" + value)
            if (value) {
                toggleStopButton(true, activeDevice)
                toggleStartButton(false, activeDevice)
            }
            else {
                toggleStopButton(false, activeDevice)
                toggleStartButton(true, activeDevice)
            }
        }.bind({})
    
        atom.start.button.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
            console.log("btnStart: " + value)
    
            if (value == false)
                return
    
            if (surfaceElements.shiftActive.getProcessValue(activeDevice)) {
                surfaceElements.transport.cycle.setProcessValue(activeDevice, value)
                return
            }
    
            surfaceElements.transport.start.setProcessValue(activeDevice, 127)
        }.bind({});
    
        surfaceElements.transport.btnStop.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
            console.log("btnStop: " + value)
    
            if (value == false)
                return
    
            if (surfaceElements.shiftActive.getProcessValue(activeDevice)) {
                surfaceElements.transport.undo.setProcessValue(activeDevice, value)
                return
            }
    
            surfaceElements.transport.stop.setProcessValue(activeDevice, 127)
        }.bind({});
    */
}

function subscribeNavigationFunctions(page: MR_FactoryMappingPage) {
    page.makeCommandBinding(atom.left.stateVariable, 'Navigate', 'Left')
    page.makeCommandBinding(atom.right.stateVariable, 'Navigate', 'Right')
    page.makeCommandBinding(atom.down.stateVariable, 'Navigate', 'Down')
    page.makeCommandBinding(atom.up.stateVariable, 'Navigate', 'Up')
    /* page.makeCommandBinding(atom.ZoomIn, 'Zoom', 'Zoom In')
     page.makeCommandBinding(atom.ZoomOut, 'Zoom', 'Zoom Out')*/
    //page.makeCommandBinding(atom.select.stateVariable, 'Navigate', 'Toggle Selection')

    /*surfaceElements.nav.btnUp.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
        if (value == false)
            return;

        if (surfaceElements.event.nudgeOn.getProcessValue(activeDevice) == 0)
            surfaceElements.event.nudgeUp.setProcessValue(activeDevice, 127);
        else
            surfaceElements.nav.Up.setProcessValue(activeDevice, 127)
    }.bind({});

    surfaceElements.nav.btnDown.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value): number {
        if (value == false)
            return;

        if (surfaceElements.event.nudgeOn.getProcessValue(activeDevice) == 1)
            surfaceElements.event.nudgeDown.setProcessValue(activeDevice, 127);
        else
            surfaceElements.nav.Down.setProcessValue(activeDevice, 127)
    }.bind({});

    surfaceElements.nav.btnLeft.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
        if (value == false)
            return;

        if (surfaceElements.event.nudgeOn.getProcessValue(activeDevice) == 1)
            surfaceElements.event.nudgeLeft.setProcessValue(activeDevice, 127);
        else
            surfaceElements.nav.Left.setProcessValue(activeDevice, 127)
    }.bind({});

    surfaceElements.nav.btnRight.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
        if (value == false)
            return;

        if (surfaceElements.event.nudgeOn.getProcessValue(activeDevice) == 1)
            surfaceElements.event.nudgeRight.setProcessValue(activeDevice, 127);
        else
            surfaceElements.nav.Right.setProcessValue(activeDevice, 127)
    }.bind({});

    surfaceElements.knobs[4].mSurfaceValue.mOnProcessValueChange = function (activeDevice, value, diff) {
        console.log("knob4 value: " + value + " diff: " + diff)

        if (surfaceElements.nav.ZoomOn.getProcessValue(activeDevice)
            && value < 0.5) {
            surfaceElements.nav.ZoomIn.setProcessValue(activeDevice, 127)
        }
        else if (surfaceElements.nav.ZoomOn.getProcessValue(activeDevice)
            && value > 0.5) {
            surfaceElements.nav.ZoomOut.setProcessValue(activeDevice, 127)
        }
    }*/
}

/**
 * @param {MR_FactoryMappingPage} page
 */
function subscribeTrackSetup(page: MR_FactoryMappingPage) {
    /* page.makeCommandBinding(atom.pads[0].tapTempo, 'Project', 'Tap Tempo') //doesnt work
     page.makeCommandBinding(surfaceElements.song.tempo, 'Transport', 'Input Tempo') //doesnt work
     page.makeCommandBinding(surfaceElements.song.delete, 'Edit', 'Delete') //doesnt work
     page.makeCommandBinding(surfaceElements.song.duplicate, 'Edit', 'Dupicate') //doesnt work
     page.makeCommandBinding(surfaceElements.song.moveLoopLeft, 'Nudge', 'Loop Range Left')
     page.makeCommandBinding(surfaceElements.song.moveLoopRight, 'Nudge', 'Loop Range Right')
 
     surfaceElements.knobs[2].mSurfaceValue.mOnProcessValueChange = function (activeDevice, value, diff) {
         if (surfaceElements.song.trackSetupOn.getProcessValue(activeDevice)) {
             var tempo = surfaceElements.song.tempo.getProcessValue(activeDevice)
             if (diff > 0)
                 tempo++
             else if (diff < 0)
                 tempo--
             surfaceElements.song.tempo.setProcessValue(activeDevice, tempo)
         }
     }*/

    /* *************  */

    /*surfaceElements.triggers[13].state.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number, diff: number) {
        console.log("Pad [13]" + value)
        if (surfaceElements.song.trackSetupOn.getProcessValue(activeDevice))
            surfaceElements.song.browser.setProcessValue(activeDevice, 127)
    }

    surfaceElements.triggers[14].state.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
        if (surfaceElements.song.trackSetupOn.getProcessValue(activeDevice))
            surfaceElements.song.tempo.setProcessValue(activeDevice, 1)
    }

    surfaceElements.triggers[15].state.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
        if (surfaceElements.song.setLoop.getProcessValue(activeDevice))
            surfaceElements.song.moveLoopLeft.setProcessValue(activeDevice, 127)
    }

    surfaceElements.triggers[16].state.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
        if (surfaceElements.song.setLoop.getProcessValue(activeDevice))
            surfaceElements.song.moveLoopRight.setProcessValue(activeDevice, 127)
    }*/

    /* *************  */
    /*surfaceElements.triggers[9].state.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
        if (surfaceElements.song.trackSetupOn.getProcessValue(activeDevice))
            surfaceElements.song.duplicate.setProcessValue(activeDevice, 127)
    }

    surfaceElements.triggers[10].state.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
        if (surfaceElements.song.trackSetupOn.getProcessValue(activeDevice))
            surfaceElements.song.delete.setProcessValue(activeDevice, 127)
    }

    surfaceElements.triggers[11].state.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
        if (surfaceElements.song.trackSetupOn.getProcessValue(activeDevice))
            surfaceElements.song.velocityMinus.setProcessValue(activeDevice, 127)
    }

    surfaceElements.triggers[12].state.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number) {
        if (surfaceElements.song.trackSetupOn.getProcessValue(activeDevice))
            surfaceElements.song.velocityPlus.setProcessValue(activeDevice, 127)
    }*/

    /* *************  */
}

function makePageWithDefaults(name: string) {
    var page = deviceDriver.mMapping.makePage(name)
    subscribeNavigationFunctions(page)
    subscribeTransportFunctions(page)
    subscribeTrackSetup(page)
    /*
        page.makeCommandBinding(surfaceElements.event.nudgeLeft, 'Nudge', 'Left')
        page.makeCommandBinding(surfaceElements.event.nudgeRight, 'Nudge', 'Right')
        page.makeCommandBinding(surfaceElements.event.nudgeDown, 'Nudge', 'Down')
        page.makeCommandBinding(surfaceElements.event.nudgeUp, 'Nudge', 'Up')
    */
    return page
}

function makePageMixer() {
    var page = makePageWithDefaults('Mixer')
    return page
}

//----------------------------------------------------------------------------------------------------------------------
// Switch nanoKONTROL to expected mode
//----------------------------------------------------------------------------------------------------------------------

function setNativeMidiMode(activeDevice: MR_ActiveDevice) {
    console.log("ATOM activate native Midi Mode")
    communication.sendMidiNoteOff(16, 0, 127, activeDevice)
    //TODO trigger pad chanel is now 0
}


function setDefaultMidiMode(activeDevice: MR_ActiveDevice) {
    console.log("ATOM activate default Midi Mode")
    communication.sendMidiNoteOff(16, 0, 0, activeDevice)
    //TODO trigger pad chanel is now 10 (id:9)
}

deviceDriver.mOnActivate = function (activeDevice: MR_ActiveDevice) {
    console.log('Your PreSonus ATOM has been detected.')
    setNativeMidiMode(activeDevice)
}

//----------------------------------------------------------------------------------------------------------------------
// Construct Pages
//----------------------------------------------------------------------------------------------------------------------

midiInput.mOnSysex = function (activeDevice: MR_ActiveDevice, message: any) {
    console.log('received sysex response for Presonus Atom.')
    if (state.activeMapping == undefined)
        return;
    //var msgStr = arrayToString(message)
    //console.log('sysex response for Presonus Atom:' + msgStr)
}.bind({ state })

var pageMixer = makePageMixer()

pageMixer.mOnActivate = function (activeDevice: MR_ActiveDevice, activeMapping: MR_ActiveMapping) {
    state.activeMapping = activeMapping
    console.log('from script: PreSonus ATOM "Mixer" page activated')
    midiOutput.sendMidi(activeDevice, [0xf0, 0x7e, 0, 6, 1, 0xf7])
}