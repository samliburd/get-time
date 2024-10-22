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
    return ` ffmpeg -ss ${timeArr[0]} -to ${timeArr[1]} -i ${filename} -c:v libx264 -crf 17 -preset fast -c:a aac -map_metadata -1 -map_chapters -1 -movflags +faststart "${output}"`;
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

// const cropBoxMenu = menu.item("Crop");
// cropBoxMenu.addSubMenuItem(
//     menu.item("Start crop", () => {
//         // input.onMouseDown(input.MOUSE, ({x, y}) => {
//         //     core.osd(`Crop ${x} ${y}`);
//         // })
//         input.onMouseDrag
//         overlay.simpleMode();
//         overlay.setContent(`<h1>Hello World</h1>`);
//         overlay.setStyle(`h1 { color: red; }`);
//         overlay.show();
//         // const startTime = getTimePos(0);
//         // core.osd(`Start time set to: ${startTime}`);
//     }, {
//         keyBinding: "Alt+Shift+S",
//     })
// );
// menu.addItem(cropBoxMenu);
function showOverlay() {
    const [videoWidth, videoHeight] = [core.status.videoWidth, core.status.videoHeight];
    let frame = core.window.frame;  // Retrieve the frame dimensions
    overlay.simpleMode();
    overlay.setContent(`<h1>Video width: ${videoWidth}, Video height: ${videoHeight}</h1>
    <h1>Frame width: ${frame.width}, Frame height: ${frame.height}</h1>
    <div>Hi</div>
`);
    // overlay.setContent(`<div>Hi</div>`);
    // overlay.setStyle(`div { background-color: red; width: 1472px; height: 828px}`);

    overlay.setStyle(`h1 { color: white;} 
    div { background-color: red; width: 400px; height: 225px; margin: 0 auto;}`);
    overlay.show();
}

let initialPos = null;
let newPos = null;
let isSettingInitial = true;  // To toggle between initial and new coordinates
const eventID = event.on("iina.window-resized", () => {
    // core.osd(`Frame size ${core.status.}`);
})
input.onKeyDown("l", () => {
    showOverlay();
    input.onMouseDown(input.MOUSE, ({x, y}) => {
        // overlay.simpleMode();
        // // overlay.setContent(`<h1>${videoWidth}, ${videoHeight}</h1>`);
        // overlay.setContent(`<div><div id="test"></div></div>`);
        // overlay.setStyle(`div { background-color: red; width: ${core.status.}px; height: 828px; position: relative;}
        // #test {background-color: blue; width: 100px; height: 200px; position: absolute; top: ${x}px; left: ${y}px}`);
        //
        // // overlay.setStyle(`h1 { color: red; }`);
        // overlay.show();
    })
    // const [videoWidth, videoHeight] = [core.status.videoWidth, core.status.videoHeight];
    // showOverlay();
    //
    // input.onMouseDown(input.MOUSE, () => {
    //     input.onMouseUp(input.MOUSE, ({ x, y }) => {
    //         const frame = core.window.frame;  // Retrieve the frame dimensions
    //         const frameContent = `
    //             <h1>Frame:</h1>
    //             <p>Width: ${frame.width}</p>
    //             <p>Height: ${frame.height}</p>
    //             <p>Left: ${frame.x}</p>
    //             <p>Top: ${frame.y}</p>
    //             <p>Video: ${videoWidth} x ${videoHeight}</p>
    //         `;
    //
    //         let circlesContent = '';
    //
    //         if (isSettingInitial) {
    //             // Update initial position with the x and y values
    //             initialPos = { x, y };
    //             circlesContent += `
    //                 <div style="position: absolute; left: ${initialPos.x - 12.5}px; top: ${initialPos.y - 12.5}px; width: 25px; height: 25px; border-radius: 50%; background-color: rgba(255, 0, 0, 0.5);"></div>
    //             `;
    //             overlay.setContent(`
    //                 ${frameContent}
    //                 <h1>Initial coords: ${initialPos.x}, ${initialPos.y}</h1>
    //                 ${circlesContent}
    //             `);
    //         } else {
    //             // Update new position with the x and y values
    //             newPos = { x, y };
    //             circlesContent += `
    //                 <div style="position: absolute; left: ${newPos.x - 12.5}px; top: ${newPos.y - 12.5}px; width: 25px; height: 25px; border-radius: 50%; background-color: rgba(0, 0, 255, 0.5);"></div>
    //             `;
    //             overlay.setContent(`
    //                 ${frameContent}
    //                 <h1>New coords: ${newPos.x}, ${newPos.y}</h1>
    //                 ${circlesContent}
    //             `);
    //         }
    //
    //         // If both positions are available, display both sets of coordinates and circles
    //         if (initialPos && newPos) {
    //             circlesContent = `
    //                 <div style="position: absolute; left: ${initialPos.x - 12.5}px; top: ${initialPos.y - 12.5}px; width: 25px; height: 25px; border-radius: 50%; background-color: rgba(255, 0, 0, 0.5);"></div>
    //                 <div style="position: absolute; left: ${newPos.x - 12.5}px; top: ${newPos.y - 12.5}px; width: 25px; height: 25px; border-radius: 50%; background-color: rgba(0, 0, 255, 0.5);"></div>
    //             `;
    //             overlay.setContent(`
    //                 ${frameContent}
    //                 <h1>Initial coords: ${initialPos.x}, ${initialPos.y}</h1>
    //                 <h1>New coords: ${newPos.x}, ${newPos.y}</h1>
    //                 ${circlesContent}
    //             `);
    //         }
    //
    //         // Toggle for next combination
    //         isSettingInitial = !isSettingInitial;
    //     });
    // });
});