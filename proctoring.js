(function () {
  // Global variables
  let examStarted = false;
  // let warningIssued = false;
  let mediaRecorder;
  let recordedChunks = [];
  let mediaStream;

  // HELPER FUNCTIONS
  function startWebcamAndMic() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Webcam and mic stream has started
        mediaStream = stream;

        // Start recording
        startRecording(mediaStream);

        // Make window full-screen
        enterFullScreen();
      })
      .catch((err) => {
        console.error("Error accessing webcam/mic: ", err);
        terminateExam();
      });
  }

  function startRecording(stream) {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = function (event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = function () {
      const blob = new Blob(recordedChunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      // Download the recording (optional)
      /* const a = document.createElement("a");
    a.href = url;
    a.download = "exam_recording.mp4";
    a.click(); */
    };

    mediaRecorder.start();
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
  }

  function verifyIdentity() {
    // Simulate identity verification
    const idVerified = confirm(
      "Please verify your identity with a photo ID. Click 'OK' if verified."
    );
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

  function exitFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  // function issueWarning() {
  //   // Show a warning message
  //   document.getElementById("exam-notification").style.display = "block";
  //   setTimeout(() => {
  //     document.getElementById("exam-notification").style.display = "none";
  //   }, 3000);
  // }

  function terminateExam() {
    // Stop the webcam and microphone
    stopRecording();
    // Hide the exam content
    document.getElementById("exam-content").style.display = "none";

    // Show the exam terminated message
    document.getElementById("exam-terminated").style.display = "block";

    examStarted = false;
  }

  function monitorFullScreenExit() {
    if (!document.fullscreenElement && examStarted) {
      // if (warningIssued) {
      terminateExam();
      // } else {
      //   issueWarning();
      //   warningIssued = true;
      //   enterFullScreen();
      // }
    }
  }

  function preventContextMenu(e) {
    e.preventDefault();
  }

  function preventCopyPaste(e) {
    e.preventDefault();
  }

  function preventReloading(e) {
    // Prevent Ctrl+R (refresh)
    if (e.ctrlKey && e.key === "r") {
      e.preventDefault();
    }

    // Prevent F5 (refresh)
    if (e.key === "F5") {
      e.preventDefault();
    }

    // Prevent Ctrl+F5 (hard refresh)
    if (e.ctrlKey && e.key === "F5") {
      e.preventDefault();
    }

    // Prevent Ctrl+Shift+R (hard refresh)
    if (e.ctrlKey && e.shiftKey && e.key === "r") {
      e.preventDefault();
    }
  }

  // EVENT LISTENERS
  document
    .getElementById("startExamBtn")
    .addEventListener("click", function () {
      startWebcamAndMic();
      verifyIdentity();
      //   enterFullScreen();

      document.getElementById("instructions").style.display = "none";
      document.getElementById("exam-content").style.display = "block";
      examStarted = true;
      //   warningIssued = false;
    });

  // Monitor tab switch
  document.addEventListener("visibilitychange", function () {
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

  // Prevent reloading when certain keys are pressed
  document.addEventListener("keydown", preventReloading);

  // Prevent re-entry into the exam window
  window.onbeforeunload = function (e) {
    e.preventDefault();
  };

  // End exam if exam window has lost focus
  window.onblur = function () {
    if (document.fullscreenElement && examStarted) {
      terminateExam();
      exitFullScreen();
    }
  };
})();
