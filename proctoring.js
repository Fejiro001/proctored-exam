// Global variables
let examStarted = false;
let warningIssued = false;

// Helper functions
function startWebcamAndMic() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            // Webcam and mic stream started
            console.log("Webcam and microphone started.");
        })
        .catch((err) => {
            console.error("Error accessing webcam/mic: ", err);
            terminateExam();
        });
}

function verifyIdentity() {
    // Simulate identity verification
    const idVerified = confirm("Please verify your identity with a photo ID. Click 'OK' if verified.");
    if (!idVerified) {
        terminateExam();
    }
}

function enterFullScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
    }
}

// function exitFullScreen() {
//     if (document.exitFullscreen) {
//         document.exitFullscreen();
//     } else if (document.mozCancelFullScreen) {
//         document.mozCancelFullScreen();
//     } else if (document.webkitExitFullscreen) {
//         document.webkitExitFullscreen();
//     } else if (document.msExitFullscreen) {
//         document.msExitFullscreen();
//     }
// }

function terminateExam() {
    // Hide the exam content
    document.getElementById("exam-content").style.display = "none";

    // Show the exam terminated message
    document.getElementById("exam-terminated").style.display = "block";

    // Optionally, send a termination log to the server
    console.log("Exam terminated.");
}

function issueWarning() {
    // Show a warning message
    document.getElementById("exam-notification").style.display = "block";
    setTimeout(() => {
        document.getElementById("exam-notification").style.display = "none";
    }, 3000);
}

function monitorFullScreenExit() {
    if (!document.fullscreenElement && examStarted) {
        if (warningIssued) {
            terminateExam();
        } else {
            issueWarning();
            warningIssued = true;
            enterFullScreen();
        }
    }
}

function preventContextMenu(e) {
    e.preventDefault();
}

function preventCopyPaste(e) {
    e.preventDefault();
}

// Event listeners
document.getElementById("startExamBtn").addEventListener("click", function() {
    startWebcamAndMic();
    verifyIdentity();
    enterFullScreen();

    document.getElementById("instructions").style.display = "none";
    document.getElementById("exam-content").style.display = "block";
    examStarted = true;
    warningIssued = false;
});

// Monitor tab switch
document.addEventListener("visibilitychange", function() {
    if (document.hidden && examStarted) {
        terminateExam();
    }
});

// Monitor full-screen mode
document.addEventListener("fullscreenchange", monitorFullScreenExit);

// Disable right-click
document.addEventListener("contextmenu", preventContextMenu);

// Disable copy/paste
document.addEventListener("copy", preventCopyPaste);
document.addEventListener("cut", preventCopyPaste);
document.addEventListener("paste", preventCopyPaste);

// Prevent re-entry into the exam window
window.onbeforeunload = function() {
    return "Are you sure you want to leave? Your exam will be terminated.";
};

// Disable the ability to return to the exam if exited
// window.onblur = function() {
//     if (examStarted) {
//         terminateExam();
//     }
// };
