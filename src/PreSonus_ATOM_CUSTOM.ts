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

var communication = new Communication(midiOutput, midiInput);

//----------------------------------------------------------------------------------------------------------------------
// 2. SURFACE LAYOUT - create control elements and midi bindings
//----------------------------------------------------------------------------------------------------------------------

var btnWidth = 3
var btnHeight = 1.5

var atom = new AtomControl(surface, communication, btnHeight, btnWidth);

function makeHelperVariables() {
    var variables = {}
    variables.zoomIn = surface.makeCustomValueVariable("zomm in")
    variables.zoomOut = surface.makeCustomValueVariable("zomm out")
    variables.jogLeft = surface.makeCustomValueVariable("zomm in")
    variables.jogRight = surface.makeCustomValueVariable("zomm out")
    variables.zoomOn = surface.makeCustomValueVariable("zomm on")
    return variables;
}

var helperVariables = makeHelperVariables();
//----------------------------------------------------------------------------------------------------------------------
// 3. HOST MAPPING - create mapping pages and host bindings
//----------------------------------------------------------------------------------------------------------------------

function subscribeTransportFunctions(page: MR_FactoryMappingPage, mainPage: MR_SubPage, shiftPage: MR_SubPage) {

    /* feedback cubase -> btn colors */
    page.makeCommandBinding(atom.click.click, 'Transport', 'Metronome On');
    page.makeValueBinding(atom.click.clickState, page.mHostAccess.mTransport.mValue.mMetronomeActive);

    page.makeCommandBinding(atom.record.click, 'Transport', 'Record');
    page.makeValueBinding(atom.record.clickState, page.mHostAccess.mTransport.mValue.mRecord);

    page.makeCommandBinding(atom.start.click, 'Transport', 'Start');
    page.makeValueBinding(atom.start.clickState, page.mHostAccess.mTransport.mValue.mStart);

    page.makeCommandBinding(atom.stop.click, 'Transport', 'Stop');
    page.makeValueBinding(atom.stop.clickState, page.mHostAccess.mTransport.mValue.mStop);

    /* command binding atom -> cubase */
    page.makeCommandBinding(atom.click.shiftClick, 'Transport', 'Precount On').setSubPage(shiftPage);

    page.makeCommandBinding(atom.start.shiftClick, 'Transport', 'Cycle').setSubPage(shiftPage);
    page.makeValueBinding(atom.start.shiftState, page.mHostAccess.mTransport.mValue.mCycleActive);

    page.makeCommandBinding(atom.stop.shiftClick, 'Edit', 'Undo').setSubPage(shiftPage);
    page.makeCommandBinding(atom.record.shiftClick, 'File', 'Save').setSubPage(shiftPage);

    page.makeCommandBinding(helperVariables.jogLeft, 'Transport', 'Nudge -1 Frame');
    page.makeCommandBinding(helperVariables.jogRight, 'Transport', 'Nudge +1 Frame');

    /*page.mHostAccess.mTransport.mValue.mStart.onProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number, diff: number) {
        console.log("Cubase stared playing: " + value);

        if (value) {
            atom.start.buttonLampOff(activeDevice);
        }
        else {
            atom.start.buttonLampOn(activeDevice);
        }
    }

    page.mHostAccess.mTransport.mValue.mStop.onProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number, diff: number) {
        console.log("Cubase stopped playing: " + value);

        if (value) {
            atom.stop.buttonLampOn(activeDevice);
        }
        else {
            atom.stop.buttonLampOff(activeDevice);
        }
    }*/
}

function subscribeNavigationFunctions(page: MR_FactoryMappingPage, mainPage: MR_SubPage, nudgePage: MR_SubPage) {
    page.makeCommandBinding(atom.left.button.mSurfaceValue, 'Navigate', 'Left').setSubPage(mainPage);
    page.makeCommandBinding(atom.right.button.mSurfaceValue, 'Navigate', 'Right').setSubPage(mainPage);
    page.makeCommandBinding(atom.down.button.mSurfaceValue, 'Navigate', 'Down').setSubPage(mainPage);
    page.makeCommandBinding(atom.up.button.mSurfaceValue, 'Navigate', 'Up').setSubPage(mainPage);
    page.makeCommandBinding(atom.select.button.mSurfaceValue, 'Navigate', 'Toggle Selection').setSubPage(mainPage);

    page.makeCommandBinding(atom.left.button.mSurfaceValue, 'Nudge', 'Left').setSubPage(nudgePage);
    page.makeCommandBinding(atom.left.button.mSurfaceValue, 'Nudge', 'Right').setSubPage(nudgePage);
    page.makeCommandBinding(atom.left.button.mSurfaceValue, 'Nudge', 'Down').setSubPage(nudgePage);
    page.makeCommandBinding(atom.left.button.mSurfaceValue, 'Nudge', 'Up').setSubPage(nudgePage);

    page.makeCommandBinding(helperVariables.zoomIn, 'Zoom', 'Zoom In');
    page.makeCommandBinding(helperVariables.zoomOut, 'Zoom', 'Zoom Out');

    atom.zoom.button.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number, diff: number) {
        console.log("zoom btn value: " + value + " diff: " + diff);
        if (value <= 0)
            return;

        if (helperVariables.zoomOn.getProcessValue(activeDevice)) {
            atom.zoom.buttonLampOff(activeDevice);
            helperVariables.zoomOn.setProcessValue(activeDevice, 0);
        }
        else {
            atom.zoom.buttonLampOn(activeDevice);
            helperVariables.zoomOn.setProcessValue(activeDevice, 1);
        }

    }

    atom.knobs[4].knob.mSurfaceValue.mOnProcessValueChange = function (activeDevice: MR_ActiveDevice, value: number, diff: number) {
        value *= 100;
        console.log("knob4 value: " + value + " diff: " + diff);

        if (helperVariables.zoomOn.getProcessValue(activeDevice)) {
            if (value < 1) {
                helperVariables.zoomIn.setProcessValue(activeDevice, 127);
            }
            else if (value > 50) {
                helperVariables.zoomOut.setProcessValue(activeDevice, 127);
            }
        }
        else {
            if (value < 1) {
                helperVariables.jogRight.setProcessValue(activeDevice, 127);
            }
            else if (value > 50) {
                helperVariables.jogLeft.setProcessValue(activeDevice, 127);
            }
        }
    }
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
    var page = deviceDriver.mMapping.makePage(name);
    var subPageArea = page.makeSubPageArea('subPages');
    var shiftPage = subPageArea.makeSubPage('shiftPage');
    var mainPage = subPageArea.makeSubPage('mainPage');
    var songPage = subPageArea.makeSubPage('songPage');
    var nudgePage = subPageArea.makeSubPage('nudgePage');

    shiftPage.mOnActivate = function (activeDevice: ActiveDevice, activeMapping: ActiveMapping) {
        console.log("shift page activated");
        atom.shift.buttonLampOn(activeDevice);

        atom.click.shift(activeDevice);
        atom.record.shift(activeDevice);
        atom.start.shift(activeDevice);
        atom.stop.shift(activeDevice);
    }

    mainPage.mOnActivate = function (activeDevice: ActiveDevice, activeMapping: ActiveMapping) {
        console.log("main page activated");
        atom.shift.buttonLampOff(activeDevice);

        atom.click.unShift(activeDevice);
        atom.record.unShift(activeDevice);
        atom.start.unShift(activeDevice);
        atom.stop.unShift(activeDevice);
    }

    page.makeActionBinding(atom.shift.button.mSurfaceValue, shiftPage.mAction.mActivate).setSubPage(mainPage);
    page.makeActionBinding(atom.shift.button.mSurfaceValue, mainPage.mAction.mActivate).setSubPage(shiftPage);
    page.makeActionBinding(atom.setup.button.mSurfaceValue, songPage.mAction.mActivate).setSubPage(mainPage);
    page.makeActionBinding(atom.nudge.button.mSurfaceValue, nudgePage.mAction.mActivate).setSubPage(mainPage);

    subscribeNavigationFunctions(page, mainPage, nudgePage)
    subscribeTransportFunctions(page, mainPage, shiftPage)

    subscribeTrackSetup(page);
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