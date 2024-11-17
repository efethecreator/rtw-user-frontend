import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VideoRecorderPage from "./pages/VideoRecorderPage"; // VideoRecorderPage bileşenini dahil edin
import InterviewCompleted from "./pages/InterviewCompleted";
import NotFound from "./pages/NotFound"; // NotFound bileşenini ekleyin

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Video kaydedici sayfası */}
        <Route path="/:id" element={<VideoRecorderPage />} />

        {/* Mülakat tamamlandı sayfası */}
        <Route path="/interview-completed" element={<InterviewCompleted />} />

        {/* 404 Not Found sayfası */}
        <Route path="/404" element={<NotFound />} />

        {/* Tüm diğer geçersiz rotalar için 404 yönlendirme */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
