'use client';

import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

let faceLandmarker;
let runningMode = "VIDEO";
let video, canvas, ctx;

let webcamStream;
let tracking = false;
let landmarkHistory = [];

// -------------------------
// Load FaceLandmarker
// -------------------------
async function loadModel() {
  const resolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(resolver, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1,
  });
}

loadModel();

// -----------------------------
// Webcam Tracking Logic
// -----------------------------
async function startWebcamTracking() {
  video = document.getElementById("webcam");
  canvas = document.getElementById("output_canvas");
  ctx = canvas.getContext("2d");

  landmarkHistory = [];
  tracking = true;

  webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = webcamStream;

  video.onloadeddata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    requestAnimationFrame(predictLoop);
  };
}

async function stopWebcamTracking() {
  tracking = false;

  if (webcamStream) {
    webcamStream.getTracks().forEach((t) => t.stop());
  }

  const eyeContactScore = computeEyeContact(landmarkHistory);
  const expressionScore = computeExpression(landmarkHistory);
  const feedback = generateFeedback(eyeContactScore, expressionScore);

  return {
    eyeContactScore,
    expressionScore,
    feedback,
  };
}

// -----------------------------
// MAIN PREDICTION LOOP
// -----------------------------
async function predictLoop() {
  if (!tracking || !faceLandmarker) return;

  const nowMs = performance.now();
  const result = faceLandmarker.detectForVideo(video, nowMs);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (result.faceLandmarks && result.faceBlendshapes) {
    const categories = result.faceBlendshapes[0].categories;

    // Compute eye contact (centered eyes)
    const centered = eyesAreCentered(categories);

    // Compute smile score
    const leftSmile = categories.find(c => c.categoryName === "mouthSmileLeft")?.score || 0;
    const rightSmile = categories.find(c => c.categoryName === "mouthSmileRight")?.score || 0;
    const smiling = (leftSmile + rightSmile) / 2 > 0.2;

    // push frame data
    landmarkHistory.push({
      timestamp: nowMs,
      centered,
      smiling
    });
  }

  requestAnimationFrame(predictLoop);
}

// --------------------------------------------------
// eye contact check
// --------------------------------------------------
function eyesAreCentered(categories, thresholdUpDown = 0.6, thresholdLeftRight = 0.4) {
  const scores = {};
  categories.forEach(s => (scores[s.categoryName] = s.score));

  return (
    scores.eyeLookDownLeft < thresholdUpDown &&
    scores.eyeLookDownRight < thresholdUpDown &&
    scores.eyeLookInLeft < thresholdLeftRight &&
    scores.eyeLookInRight < thresholdLeftRight &&
    scores.eyeLookOutLeft < thresholdLeftRight &&
    scores.eyeLookOutRight < thresholdLeftRight &&
    scores.eyeLookUpLeft < thresholdUpDown &&
    scores.eyeLookUpRight < thresholdUpDown
  );
}

// -------------------------
// Placeholder scoring
// -------------------------
function computeEyeContact(history) {
  // We will refine using iris center and camera direction

  if (history.length === 0) return 0;

  const centered = history.filter(f => f.centered).length;
  return Math.round((centered / history.length) * 100);
}

function computeExpression(history) {
  // Will refine using blendshapes (“happy”, “brow raise”, etc)
  // for now, just use smile detection as a proxy based on mouthSmileLeft and mouthSmileRight

  if (history.length === 0) return 0;

  const smiling = history.filter(f => f.smiling).length;
  return Math.round((smiling / history.length) * 100);
}

// -------------------------
// Feedback Generation
// -------------------------
function generateFeedback(eyeScore, smileScore) {
  let feedback = "";

  // Eye Contact feedback
  if (eyeScore < 40) {
    feedback += "Try to maintain more consistent eye contact with the camera. ";
  } else if (eyeScore < 70) {
    feedback += "Your eye contact was decent, but keeping focus slightly more on the camera will help. ";
  } else {
    feedback += "Great eye contact — very engaging! ";
  }

  // Expression feedback
  if (smileScore < 20) {
    feedback += "Consider smiling a bit more to appear warmer and more confident. ";
  } else if (smileScore < 50) {
    feedback += "Good expression — adding occasional smiles can improve rapport. ";
  } else {
    feedback += "Excellent expression and positivity! ";
  }

  return feedback.trim();
}

// Make functions globally accessible
window.startWebcamTracking = startWebcamTracking;
window.stopWebcamTracking = stopWebcamTracking;