(function () {
  let examStarted = false; //Indicates if the exam has started
  let mediaRecorder; //MediaRecorder instance for recording video and audio
  let recordedChunks = []; //Array to store recorded video chunks
  let mediaStream; //MediaStream object for webcam and microphone access
  let idVerification = false; //Flag to indicate if user is verified
  let examContent = document.getElementById("exam-content");
  let countdownTime = 10; // 10 seconds countdown
  let countdownInterval;
  let countdownTimeout;
  let warningIssued = false;

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
      idVerification = false;
      terminateExam();

      // document.getElementById("exam-terminated").style.display = "none";
      document.getElementById("instructions").style.display = "block";
    } else idVerification = true;
  }

  function startExamTimer() {
    const timerElement = document.getElementById("timer");

    function updateTimer() {
      const minutes = Math.floor(examDuration / 60);
      const seconds = examDuration % 60;
      const hours = Math.floor(minutes / 60);

      // Format time as HH:MM:SS
      const formattedTime = `${String(hours).padStart(2, "0")}:${String(
        minutes % 60
      ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      timerElement.textContent = formattedTime;

      if (examDuration > 0) {
        examDuration--;
      } else {
        clearInterval(timerInterval);
        // Call your exam termination function here
        terminateExam();
      }
    }

    timerInterval = setInterval(updateTimer, 1000);
    updateTimer(); // Initialize timer immediately
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

    examContent.style.display = "none";
    hideExitDialog();
    stopRecording();
    document.getElementById("exam-terminated").style.display = "block";
  }

  /**
   * Terminates the exam after 10 seconds has elapsed
   */
  function startCountdown() {
    if (examStarted) {
      // document.getElementById("overlay").style.display = "block";
      document.getElementById("countdown-popup").style.display = "block";

      const countdownElement = document.getElementById("countdown");
      countdownElement.textContent = countdownTime;

      countdownInterval = setInterval(() => {
        countdownTime--;
        countdownElement.textContent = countdownTime;

        if (countdownTime <= 0) {
          clearInterval(countdownInterval);
          terminateExam();
          document.getElementById("countdown-popup").style.display = "none";
          terminateExam();
        }
      }, 1000);

      countdownTimeout = setTimeout(() => {
        clearInterval(countdownInterval);
        document.getElementById("countdown-popup").style.display = "none";
        terminateExam();
      }, 10000);
    }
  }

  /**
   * Resets the counter
   */
  function resetCountdown() {
    clearInterval(countdownInterval);
    clearTimeout(countdownTimeout);
    countdownTime = 10; // Reset countdown to 10 seconds
    document.getElementById("countdown-popup").style.display = "none";
  }

  /**
   * Issues a warning the first time you leave to another application
   */
  const warningPopup = document.getElementById("warning-popup");
  const closeWarning = document.getElementById("close-warning");

  function issueWarning() {
    if (warningIssued) return;

    warningIssued = true;

    warningPopup.style.display = "block";
    // setTimeout(() => {
    //   warningPopup.style.display = "none";
    // }, 2000);
  }
  closeWarning.addEventListener("click", function () {
    warningPopup.style.display = "none";
  });

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
   * Shows the user a message when trying to copy/paste
   */
  function copyPasteMessage() {
    const copyPastePopup = document.getElementById("copy-paste-popup");

    if (examStarted) {
      copyPastePopup.style.display = "block";
      countdownTimeout = setTimeout(() => {
        copyPastePopup.style.display = "none";
      }, 1500);
    }
  }

  /**
   * Prevents the default behavior for right-click, copy, cut, and paste actions
   * to avoid copying or interacting with the exam content.
   */
  function preventContextMenu(e) {
    e.preventDefault();
    copyPasteMessage();
  }

  /**
   * Prevents the default behavior for copy, cut, and paste actions.
   */
  function preventCopyPaste(e) {
    e.preventDefault();
    copyPasteMessage();
  }

  /**
   * Handles key presses that could lead to unauthorized exits from the exam.
   * Displays the exit dialog if forbidden keys are pressed.
   */
  function handleForbiddenKeys(event) {
    const forbiddenKeys = ["F5"];
    if (forbiddenKeys.includes(event.key) && examStarted) {
      event.preventDefault();
      showExitDialog();
    } else if (
      event.key === "Meta" ||
      ((event.altKey ||
        event.code === "AltRight" ||
        event.code === "AltLeft") &&
        event.key === "Tab")
    ) {
      if (warningIssued) {
        startCountdown();
      } else {
        issueWarning();
      }
    }
  }

  // EVENT LISTENERS
  document
    .getElementById("startExamBtn")
    .addEventListener("click", function () {
      verifyIdentity();

      if (idVerification) {
        startWebcamAndMic();
        examContent.style.display = "flex";
        enterFullScreen();
        startExamTimer();
      }
      document.getElementById("instructions").style.display = "none";

      examStarted = true;
    });

  /**
   * Checks if there is a tab switch
   */
  document.addEventListener("visibilitychange", function () {
    if (!examStarted) return;

    if (!warningIssued) {
      issueWarning();
    } else if (warningIssued && document.hidden) {
      startCountdown();
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
      issueWarning();
    }
  };
})();
