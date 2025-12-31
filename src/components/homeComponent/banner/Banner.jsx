import React, { useState, useEffect } from "react";
import "./Banner.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import home_bg0 from "../../../img/bg_1.webp";
import home_bg1 from "../../../img/home_bg_order2.jpg";
import home_bg2 from "../../../img/home_bg_order3.jpg";
import home_bg3 from "../../../img/home_bg_order4.jpg";
import home_bg4 from "../../../img/home_bg_order5.jpg";
import { useNavigate, Navigate } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition
} from "react-speech-recognition";

const Banner = () => {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const backgroundImages = [home_bg0, home_bg1, home_bg2, home_bg3, home_bg4];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5500); // Change every 5.5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const commands = [
    {
      command: ["Go to * page", "Go to *", "Open * page", "Open *"],
      callback: (redirectPage) => setRedirectUrl(redirectPage)
    }
  ];

  const { transcript } = useSpeechRecognition({ commands });
  const [redirectUrl, setRedirectUrl] = useState("");
  const pages = [
    "home",
    "dashboard",
    "booking",
    "contact",
    "profile",
    "feedback",
    "login",
    "register",
    "booking history",
    "partner dispute",
    "cancellation policy"
  ];
  const urls = {
    home: "/",
    dashboard: "/dashboard",
    booking: "/booking",
    contact: "/contact",
    feedback: "/feedback",
    login: "/login",
    register: "/register",
    "booking history": "/booking-history",
    "partner dispute": "/partner-dispute",
    "cancellation policy": "/policy"
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null;
  }
  console.log(redirectUrl, "redirect url");

  let redirect = "";

  if (redirectUrl) {
    if (pages.includes(redirectUrl)) {
      redirect = <Navigate replace to={urls[redirectUrl]} />;
      // setRedirectUrl('');
    } else {
      redirect = <p>Could not find page: {redirectUrl}</p>;
      // setRedirectUrl('');
    }
  }
  return (
    <>
      {redirect}
      <div className="relative banner-container">
        <div className="absolute w-full h-full bg-black/40 z-20" />
        {backgroundImages.map((img, index) => (
          <img
            key={index}
            src={img}
            className={`home1Img ${index === currentBgIndex ? 'active' : ''}`}
            alt={`Pravaah Banner ${index + 1}`}
            style={{
              opacity: index === currentBgIndex ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out'
            }}
          />
        ))}
        <div className="absolute w-full h-full flex items-center justify-center z-30 top-0">
          <div className="flex flex-col justify-center items-center text-center px-6 max-w-4xl mx-auto">
            <p className="text-2xl font-normal text-white mb-4">
              Welcome to Pravaah.
            </p>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              <span className="text-[#00ff88]">Integrated Government Document Portal</span> for
              seamless and secure document management.
            </h1>
            <p className="text-xl font-normal mt-2 mb-6 text-white">
              Digital. Secure. Efficient.
            </p>
            <div className="flex justify-center items-center mx-auto">
              <button
                onClick={() => navigate("/dashboard")}
                className="shadow-md mr-3 tooltip bg-[#0f5e59] hover:bg-[#0d5a4d] text-white font-semibold text-lg w-[200px] py-3 px-4 rounded"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Banner;
