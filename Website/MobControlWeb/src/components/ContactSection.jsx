import React, { useState } from "react";
import TitleText from "./ui/TitleText";
import Container from "./Container";
import { FaCheckCircle } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";
import { FiXCircle } from "react-icons/fi";
import { IoClose } from "react-icons/io5"; 

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("idle"); 

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    const formUrl =
      "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeuZE34C1GA4dhujKuUyMDLuMv0wIgbnZbDR8HfH2c-2B3LAw/formResponse";

    const formBody = new URLSearchParams();
    formBody.append("entry.731699683", formData.name);
    formBody.append("entry.1072952315", formData.email); 
    formBody.append("entry.1465152359", formData.message); 

    try {
      await fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody.toString(),
      });

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });

      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <section id="Contact" className="pt-30">
      <Container>
        <div className="flex flex-col items-center justify-center text-center">
          <TitleText
            title="Contact Us"
            text="Have a question or need help? We’re here for you! Our support team is ready to assist with any issue or inquiry—big or small."
          />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-16 mb-20">
          <div className="col-span-1 space-y-5 border border-white/10 p-8 rounded-xs">
            <div className="flex flex-col space-y-2 border-b border-white/10 pb-5">
              <div className="flex flex-col">
                <p>Chat with us</p>
                <p className="text-sm text-white/80">
                  Connect with us for personalized support.
                </p>
              </div>
              <p className="text-violet">support@mobcontrol.com</p>
            </div>

            <div className="flex flex-col space-y-2 border-b border-white/10 pb-5">
              <div className="flex flex-col">
                <p>Call us</p>
                <p className="text-sm text-white/80">Need Help? Call Us Now!</p>
              </div>
              <p className="text-violet underline">+6512345678</p>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex flex-col">
                <p>Visit us</p>
                <p className="text-sm text-white/80">
                  We're Waiting to Welcome You!
                </p>
              </div>
              <p className="text-violet w-2/3">
                461 Clementi Rd, Singapore 599491
              </p>
            </div>
          </div>

          <div className="col-span-1 flex flex-col justify-center space-y-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div>
                <label htmlFor="name" className="block mb-3 text-white">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-ink border border-white/10 text-white text-sm rounded-xs block w-full p-2.5"
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-3 text-white">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-ink border border-white/10 text-white text-sm rounded-xs block w-full p-2.5"
                />
              </div>

              <div>
                <label htmlFor="message" className="block mb-3 text-white">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="bg-ink border border-white/10 text-white text-sm rounded-xs block w-full p-2.5"
                ></textarea>
              </div>

              <button type="submit" disabled={status === "loading"}>
                <div className="flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xs bg-cyan hover:bg-opacity-80 duration-200 h-10">
                  {status === "loading" ? (
                    <ImSpinner8 className="animate-spin" />
                  ) : status === "success" ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <FaCheckCircle /> Sent!
                    </div>
                  ) : (
                    "Submit"
                  )}
                </div>
              </button>
            </form>

            {status === "error" && (
              <div
                className="flex items-center justify-between p-4 text-sm text-red-400 bg-red-900/10 border border-red-500/20 rounded-xs animate-fade-in"
                role="alert"
              >
                <div className="flex items-center gap-3">
                  <FiXCircle className="text-lg" />
                  <span>Something went wrong. Try again!</span>
                </div>
                <button
                  onClick={() => setStatus("idle")}
                  className="p-1 rounded-full hover:bg-red-500/20"
                  aria-label="Dismiss"
                >
                  <IoClose />
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ContactSection;