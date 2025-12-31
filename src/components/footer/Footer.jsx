import React from "react";
import "./Footer.css";
import { useNavigate } from "react-router-dom";
import logo from "../../img//ourlogo.png";
import xIcon from "../../img/x.svg";
import instagramIcon from "../../img/instagram.svg";
import youtubeIcon from "../../img/youtube.svg";
import whatsappIcon from "../../img/whatsapp.svg";
import footerBg from "../../img/India Government-06.svg";
import digitalIndia from "../../img/digital_india.png";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0f5e59] inPhone py-8">
      <div className="flex justify-center items-center">
        <div className="flex-1 border-r-2 border-black-600">
          <div
            className="flex justify-center items-center mx-8 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} className="footerLogo" alt="" />
            <div className="ml-4">
              <h3 className="text-2xl text-white font-bold mt-4">
                Pravaah
              </h3>
              <p className="text-md font-normal text-white mt-2">
                Integrated Government Document Portal
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-16 border-r-2 border-black-600">
          <div className="flex">
            <ul className="list-none mr-24">
              <li
                className="text-lg text-white font-bold cursor-pointer"
                onClick={() => navigate("/")}
              >
                Home
              </li>
              <li className="text-lg text-white font-medium cursor-pointer">
                About Pravaah
              </li>
            </ul>
            <ul>
              <li
                className="text-lg text-white font-bold cursor-pointer"
                onClick={() => navigate("/support-center")}
              >
                Support Center
              </li>
              <li
                className="text-lg text-white font-medium cursor-pointer"
                onClick={() => navigate("help")}
              >
                Help Center
              </li>
              <li
                className="text-lg text-white font-medium cursor-pointer"
                onClick={() => navigate("/partner-dispute")}
              >
                User Support
              </li>
              <li
                className="text-lg text-white font-medium cursor-pointer"
                onClick={() => navigate("faq")}
              >
                FAQs
              </li>
            </ul>
          </div>
          <p className="text-md text-medium text-white mt-4">
            Please provide us Feedback{" "}
            <button
              onClick={() => navigate("/feedback")}
              className="text-xl underline"
            >
              HERE
            </button>
          </p>
        </div>
        <div className="flex-1 px-16 border-r-2 border-black-600 followSection">
          <h1 className="text-xl text-white font-bold mb-5">
            Follow us
          </h1>
          <div className="flex gap-3 items-center followIcons">
            <img
              className="socialIcons cursor-pointer"
              src={xIcon}
              alt="X"
            />
            <img
              className="socialIcons cursor-pointer"
              src={instagramIcon}
              alt="Instagram"
            />
            <img
              className="socialIcons cursor-pointer"
              src={youtubeIcon}
              alt="YouTube"
            />
            <img
              className="socialIcons cursor-pointer"
              src={whatsappIcon}
              alt="WhatsApp"
            />
          </div>
          <p className="text-lg text-white mt-5">
            Powered by : <strong>Tech Titans</strong>
          </p>
        </div>
        <div className="flex-1 flex mr-6 items-center">
          <div className="overflow-hidden border-r-2 border-white/20 pr-8" style={{width: '120px', height: '100px'}}>
            <img src={footerBg} className="footerBgImg" alt="" style={{objectFit: 'cover', objectPosition: 'center top'}} />
          </div>
          <div className="ml-8">
            <img src={digitalIndia} alt="Digital India" style={{height: '50px', width: 'auto'}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
