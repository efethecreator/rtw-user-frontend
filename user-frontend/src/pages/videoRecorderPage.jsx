import React, { useEffect, useState } from "react";
import UserInformation from "../components/UserInformation";
import VideoRecorder from "../components/VideoRecorder";
import useUserStore from "../stores/userStore";
import useVideoStore from "../stores/videoStore";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VideoRecorderPage = () => {
  const { id: interviewId } = useParams();
  const userId = useUserStore((state) => state.userId);
  const uploadVideo = useVideoStore((state) => state.uploadVideo);
  const [questions, setQuestions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async (id) => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/interview/${id}/questions`,
          { withCredentials: true } // Ensure cookies are sent with the request
        );
        setQuestions(response.data.questions || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    if (interviewId) {
      fetchQuestions(interviewId);
    }
  }, [interviewId]);

  const handleUploadVideo = async (videoBlob) => {
    setIsUploading(true); // Start the upload indicator

    try {
      const response = await uploadVideo(videoBlob, interviewId, userId);
      console.log("Video uploaded successfully:", response);
      setIsUploading(false); // Stop the upload indicator
      navigate("/interview-completed"); // Navigate to the completion page
    } catch (error) {
      console.error("Error uploading video:", error);
      setIsUploading(false); // Handle upload error
    }
  };

  return (
    <div className="relative">
      <UserInformation isOpen={!userId} />
      <div className="absolute inset-0">
        <VideoRecorder
          interviewId={interviewId}
          userId={userId}
          uploadVideo={handleUploadVideo}
          questions={questions}
        />
      </div>

      {/* Upload Popup Indicator */}
      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold text-gray-700">
              Mülakatınız kaydediliyor...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoRecorderPage;
