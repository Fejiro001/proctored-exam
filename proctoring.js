(function () {
  let examStarted = false; //Indicates if the exam has started
  let mediaRecorder; //MediaRecorder instance for recording video and audio
  let recordedChunks = []; //Array to store recorded video chunks
  let mediaStream; //MediaStream object for webcam and microphone access
  let idVerified = false; //Flag to indicate if user is verified

  // HELPER FUNCTIONS
  /**
   * Requests access to the user's webcam and microphone and starts recording.
   * Calls startRecording() once access is granted.
   */
  function startWebcamAndMic() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        mediaStream = stream;
        startRecording(mediaStream);
      })
      .catch((err) => {
        alert("There was an error accessing your webcam/mic");
      });
  }

  /**
   * Starts recording from the provided media stream.
   * Stores recorded video chunks and handles stopping the recording.
   */
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

      // Optionally, provide a way to download the recording
      /* const a = document.createElement("a");
    a.href = url;
    a.download = "exam_recording.mp4";
    a.click(); */
    };

    mediaRecorder.start();
  }

  /**
   * Stops the media recording and the media stream.
   */
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
  }

  /**
   * Simulates identity verification. If verification fails, terminates the exam.
   */
  function verifyIdentity() {
    const verificationMessage = confirm(
      "Please verify your identity with a photo ID. Click 'OK' if verified."
    );

    if (!verificationMessage) {
      idVerified = false;
      document.getElementById("instructions").style.display = "block";
      document.getElementById("exam-terminated").style.display = "none";

      terminateExam();
    } else idVerified = true;
  }

  /**
   * Enters full-screen mode if supported by the browser.
   */
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

  /**
   * Exits full-screen mode if currently in full-screen.
   */
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

  /**
   * Terminates the exam by stopping the recording, hiding exam content,
   * and displaying a termination message. Also exits full-screen if necessary.
   */
  function terminateExam() {
    if (document.fullscreenElement) {
      exitFullScreen();
    }
    examStarted = false;

    document.getElementById("exam-content").style.display = "none";
    hideExitDialog();
    stopRecording();
    document.getElementById("exam-terminated").style.display = "block";
  }

  /**
   * Displays the custom exit dialog asking if the user wants to exit the exam.
   */
  function showExitDialog() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("exit-dialog").style.display = "block";
  }

  /**
   * Hides the custom exit dialog.
   */
  function hideExitDialog() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("exit-dialog").style.display = "none";
  }

  /**
   * Monitors full-screen mode changes and displays the exit dialog
   * if the user exits full-screen while the exam is in progress.
   */
  function monitorFullScreenExit() {
    if (!document.fullscreenElement && examStarted) {
      showExitDialog();
    }
  }

  /**
   * Prevents the default behavior for right-click, copy, cut, and paste actions
   * to avoid copying or interacting with the exam content.
   */
  function preventContextMenu(e) {
    e.preventDefault();
  }

  /**
   * Prevents the default behavior for copy, cut, and paste actions.
   */
  function preventCopyPaste(e) {
    e.preventDefault();
  }

  /**
   * Handles key presses that could lead to unauthorized exits from the exam.
   * Displays the exit dialog if forbidden keys are pressed.
   */
  function handleForbiddenKeys(event) {
    const forbiddenKeys = ["F5", "Meta", "Control", "Alt"];
    if (
      forbiddenKeys.includes(event.key) ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    ) {
      event.preventDefault();
      showExitDialog();
    }
  }

  // EVENT LISTENERS
  document
    .getElementById("startExamBtn")
    .addEventListener("click", function () {
      startWebcamAndMic();
      verifyIdentity();

      if (idVerified) {
        document.getElementById("exam-content").style.display = "block";
        enterFullScreen();
      }
      document.getElementById("instructions").style.display = "none";

      examStarted = true;
    });

  /**
   * Checks if there is a tab switch
   */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && examStarted) {
      showExitDialog();
    }
  });

  document.getElementById("exit-exam").addEventListener("click", function () {
    terminateExam();
  });

  document
    .getElementById("continue-exam")
    .addEventListener("click", function () {
      hideExitDialog();
      enterFullScreen();
    });

  document.addEventListener("fullscreenchange", monitorFullScreenExit);

  document.addEventListener("contextmenu", preventContextMenu);
  document.addEventListener("copy", preventCopyPaste);
  document.addEventListener("cut", preventCopyPaste);
  document.addEventListener("paste", preventCopyPaste);

  document.addEventListener("keydown", handleForbiddenKeys);

  window.onbeforeunload = function (e) {
    if (examStarted) {
      e.preventDefault();
      showExitDialog();
    }
  };

  window.onblur = function () {
    if (document.fullscreenElement && examStarted) {
      showExitDialog();
    }
  };
})();
