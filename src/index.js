const {
    console,
    menu,
    core,
    input,
    utils,
    overlay,
    event,

} = iina;
const regex = /\s/g
const filename = core.status.url.replace("file://", "").replace(regex, "\\ ");
const timeArr = [];
const thisTrack = {video: core.video.currentTrack, audio: core.audio.currentTrack}

function getTimePos(option) {
    const timePos = core.status.position;
    timeArr[option] = new Date(timePos * 1000).toISOString().substring(11, 23);
    return timeArr[option];
}

let outputFilename = ""; // Store the output filename globally

function promptOutputFilename() {
    const fn = utils.prompt("Please enter the file name");
    outputFilename = `${fn}.mp4`;
    return outputFilename;
}

function ffmpegCommand() {
    const output = outputFilename;
    return ` ffmpeg -ss ${timeArr[0]} -to ${timeArr[1]} -i ${filename} -c:v libx264 -crf 17 -preset fast -ac 2 -c:a aac -map_metadata -1 -map_chapters -1 -movflags +faststart -pix_fmt yuv420p "${output}"`;
}
async function findFfmpegPath() {
    try {
        // Get the system PATH
        const path = process.env.PATH;
        const delimiter = process.platform === 'win32' ? ';' : ':';
        const paths = path.split(delimiter);

        let ffmpegPath = null;

        // Iterate over each directory in the PATH to check if ffmpeg exists
        for (let dir of paths) {
            const potentialPath = `${dir}/ffmpeg`;

            // Check if the file exists at the given path
            if (await utils.fileInPath(potentialPath)) {
                ffmpegPath = potentialPath;
                break;
            }
        }

        // Return the found path or null if not found
        if (ffmpegPath) {
            return ffmpegPath
        } else {
            return "ffmpeg not found in PATH.";
        }
    } catch (error) {
        return "Error occurred: " + error.message;
    }
}

async function runFfmpeg() {
    try {
        const {status, stdout, stderr} = await utils.exec("ffmpeg", [
            "-i", `/Users/samliburd/transformersblackmail.mp4`,
            "-vf", "scale=1280:720",
            "/Users/samliburd/output.mp4",
        ]);
    } catch (error) {
        core.osd(`Error: ${error.message}`);
    }
}
const subTracksMenu = menu.item("Time");
subTracksMenu.addSubMenuItem(
    menu.item("Set start time", () => {
        const startTime = getTimePos(0);
        core.osd(`Start time set to: ${startTime}`);
    }, {
        keyBinding: "Alt+u",
    })
);
subTracksMenu.addSubMenuItem(
    menu.item("Set end time", () => {
        const endTime = getTimePos(1);
        core.osd(`End time set to: ${endTime}`);
    }, {
        keyBinding: "Alt+Shift+U",
    })
);
subTracksMenu.addSubMenuItem(
    menu.item("Run ffmpeg", () => {
        runFfmpeg().then(core.osd("Running ffmpeg"))
    }, {
        keyBinding: "Alt+Shift+R",
    })
);
//TEMP


//TEMP
subTracksMenu.addSubMenuItem(
    menu.item("Copy", async () => {
        const output = promptOutputFilename(); // Prompt for the filename once
        const command = ffmpegCommand() + `&& echo "${output}"`;
        const {status, stdout, stderr} = await utils.exec('/bin/bash', ['-c', `echo "${command}" | pbcopy`]);
        if (status === 0) {
            core.osd("Command copied to clipboard");
        } else {
            core.osd(`Failed to copy to clipboard: ${stderr}`);
        }
    }, {
        keyBinding: "Alt+Shift+P",
    })
);
menu.addItem(subTracksMenu);

function oldCoords() {
    function showOverlay(x, y, width = "100px", height = "100px") {
        const [videoWidth, videoHeight] = [core.status.videoWidth, core.status.videoHeight];
        let frame = core.window.frame;  // Retrieve the frame dimensions
        overlay.simpleMode();
        overlay.setContent(`<div id="rect"></div>
`);
        overlay.setStyle(`h1 { color: white;}
    body { margin: 0; background-color: none; height: 100%; width: 100%; position: relative;}
    #rect { position: absolute; left: ${x}px; top: ${y}px; background-color: blue; width: ${width}px; height: ${height}px; margin: 0 auto;}`);
        overlay.show();
    }

    let initialPos = null;
    let newPos = null;
    let boxWidth = null;
    let boxHeight = null;
    let isSettingInitial = true;  // To toggle between initial and new coordinates

    function getActual() {
        const [videoWidth, videoHeight] = [core.status.videoWidth, core.status.videoHeight];
        let frame = core.window.frame;
        return videoWidth / frame.width;
    }

    input.onMouseDown(input.MOUSE, ({x, y}) => {
        let frame = core.window.frame;
        const [videoWidth, videoHeight] = [core.status.videoWidth, core.status.videoHeight];

        const scale = getActual();

        if (isSettingInitial) {
            initialPos = {x, y: frame.height - y};
        } else {
            newPos = {x, y: frame.height - y};
            boxWidth = x - initialPos.x;
            boxHeight = y - initialPos.y;
            showOverlay(`${initialPos.x}px`, `${initialPos.y}px`, boxWidth, boxHeight);
        }

        core.osd(`Initial Pos: ${initialPos ? `(${initialPos.x}, ${initialPos.y})` : 'Not set'}, New Pos: ${newPos ? `(${newPos.x}, ${newPos.y})` : 'Not set'}`);


        isSettingInitial = !isSettingInitial;
    });

// input.onKeyDown("l", () => {
//     showOverlay("200px", "100px");
// });


    input.onKeyDown("k", () => {
        const {xScale, yScale} = getActual();
        core.osd(`${xScale}`);
    });

    function setHTML(track) {
        const html = []

        for (const [key, value] of Object.entries(track)) {
            html.push(`<p>${key}:</p><pre>${JSON.stringify(value, null, 2)}</pre>`); // Using <pre> to preserve formatting
        }
        return html.join("");
    }

    function showInfo() {
        overlay.simpleMode();
        overlay.setContent(`<div>${setHTML(thisTrack)}</div>`);
        overlay.setStyle(`h1 { color: white;}
    body { margin: 0; background-color: none; height: 100%; width: 100%; position: relative;}
    div { position: absolute; left: 0px; top: 0px; margin: 0 auto;}`);
        overlay.show();
    }

    input.onKeyDown("l", () => {
        showInfo()
    });
}