import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useVideoStore from "../stores/videoStore";

const VideoRecorder = ({ interviewId, userId, uploadVideo, questions }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const navigate = useNavigate();
  const { checkInterviewStatus } = useVideoStore();

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const chunks = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const checkStatus = async () => {
      const isActive = await checkInterviewStatus(interviewId);
      if (!isActive) {
        navigate("/404");
      }
    };
    checkStatus();
  }, [interviewId, checkInterviewStatus, navigate]);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Kamera veya mikrofona erişim sağlanamadı:", error);
      }
    };
    initCamera();
  }, []);

  const startRecording = () => {
    const stream = videoRef.current.srcObject;
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: "video/webm" });
      uploadVideo(blob, interviewId, userId);
      chunks.current = [];
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
    startQuestionTimer();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(intervalRef.current);
      setTimerRunning(false);
    }
  };

  const startQuestionTimer = () => {
    clearInterval(intervalRef.current);
    setCurrentQuestionTime(questions[currentQuestion]?.time * 60 || 60);
    setTimerRunning(true);

    intervalRef.current = setInterval(() => {
      setCurrentQuestionTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current);
          handleNextQuestion();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      startQuestionTimer();
    } else {
      alert("Tüm sorular tamamlandı.");
      setIsRecording(false);
      clearInterval(intervalRef.current);
      setTimerRunning(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-black">
      {/* Video Görüntüsü */}
      <video
        ref={videoRef}
        autoPlay
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      {/* Sorular ve Butonlar */}
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black via-transparent to-transparent">
        <div className="mb-4 text-center text-white">
          {isRecording && questions.length > 0 ? (
            <>
              <p className="text-lg font-bold">
                Question {currentQuestion + 1}: {questions[currentQuestion]?.question}
              </p>
              <p className="text-sm text-gray-300">
                Remaining Time: {formatTime(currentQuestionTime)}
              </p>
            </>
          ) : (
            <p className="text-gray-300">
              {isRecording
                ? "No questions available."
                : "Start recording to begin questions."}
            </p>
          )}
        </div>
        <div className="flex justify-center gap-4">
          {isRecording ? (
            <>
              <button
                onClick={stopRecording}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Stop
              </button>
              {currentQuestion < questions.length - 1 && (
                <button
                  onClick={handleNextQuestion}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </>
          ) : (
            <button
              onClick={startRecording}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;