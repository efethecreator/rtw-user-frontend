import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useVideoStore from "../stores/videoStore"; // Video store'u import edin

const VideoRecorder = ({ interviewId, userId, uploadVideo, questions }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const navigate = useNavigate();
  const { checkInterviewStatus } = useVideoStore(); // checkInterviewStatus fonksiyonunu çağırıyoruz

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const chunks = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Mülakatın süresinin dolup dolmadığını kontrol etme
    const checkStatus = async () => {
      const isActive = await checkInterviewStatus(interviewId);
      if (!isActive) {
        navigate("/404"); // Süresi dolmuşsa 404 sayfasına yönlendir
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
    <div className="flex flex-row items-start justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4 font-sans">
      {/* Video Kayıt Alanı */}
      <div className="w-2/3 bg-white rounded-xl shadow-lg p-6 mr-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
          Interview
        </h2>
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-[500px] rounded-lg mb-6 border-2 border-gray-200 shadow-sm object-cover"
        />
        <div className="flex justify-center gap-4">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 shadow-lg shadow-red-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transform transition-transform duration-200 hover:scale-105"
            >
              End Interview
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 shadow-lg shadow-green-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transform transition-transform duration-200 hover:scale-105"
            >
              Start Interview
            </button>
          )}
        </div>
      </div>

      {/* Sorular ve Kontroller Alanı */}
      <div className="w-1/3 bg-white rounded-xl shadow-lg p-6 ">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
          Questions
        </h3>
        {questions.length > 0 && isRecording ? (
          <div className="text-lg font-medium text-gray-700 mb-4">
            <p>
              <span className="text-blue-600 font-bold mr-2">
                Question {currentQuestion + 1}:
              </span>
              {questions[currentQuestion]?.question}
            </p>
            <p className="mt-2 text-gray-500">
              Remaining Time: {formatTime(currentQuestionTime)}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">
            {isRecording
              ? "No questions available."
              : "Start recording to begin questions."}
          </p>
        )}
        <div className="flex flex-col gap-4 mt-auto">
          {isRecording && currentQuestion < questions.length - 1 && (
            <button
              onClick={handleNextQuestion}
              className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 shadow-lg shadow-blue-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2 mx-auto w-48 transform transition-transform duration-200 hover:scale-105"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;
