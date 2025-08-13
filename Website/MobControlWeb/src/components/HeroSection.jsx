import React, { useState } from "react"; // 1. Import useState
import { Particles } from "@/components/magicui/particles";
import { ShinyButton } from "@/components/magicui/shiny-button";
import { ArrowRight, PlayCircle } from "lucide-react"; // 2. Import PlayCircle icon
import { BorderBeam } from "@/components/magicui/border-beam";
import ActionModalTriggerComponent from "./ActionModalTriggerComponent";

import videoThumbnail from "../assets/image.png";

const HeroSection = () => {
  const [showVideo, setShowVideo] = useState(false);

  const youtubeVideoId = "8O2Jz-m1RYo";
  const embedUrl = `https://www.youtube.com/embed/${youtubeVideoId}`;

  return (
    <div id="Home" className="pt-30 font-inter text-white">
      <div className="relative w-full bg-gradient-to-t from-0% via-[#BE63FF]/20  to-[#18181B] overflow-hidden ">
        <Particles
          className="absolute inset-0 z-0"
          ease={80}
          color="#ffffff"
          refresh
        />

        <div className="relative z-10 flex  flex-col items-center justify-center gap-5 text-center">
          <ShinyButton>
            <div className="flex items-center gap-1">
              ✨ Introducing Our Mob Controller
              <ArrowRight strokeWidth={1.2} size={18} />
            </div>
          </ShinyButton>

          <h1 className="font-inter-tight w-lg md:w-5xl py-2 font-medium text-balance text-3xl md:text-6xl text-white">
            The future of Game Control is in your Pocket
          </h1>

          <p className="md:w-2xl w-lg max-md:w-[85%] text-lg text-white/90 font-normal">
            Seamlessly play PC games using your mobile device, no extra hardware
            needed. Instant connection. Total control. Free to start.
          </p>
          <ActionModalTriggerComponent
            buttonText="Get Started for free"
            buttonClassName="mt-4 flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-base text-ink"
          />
        </div>

        <div className="w-[85%] mx-auto pt-30">
          <div className="relative aspect-video w-full rounded-xl border-[1.5px] border-white/20 overflow-hidden [mask-image:linear-gradient(to_bottom,black_40%,transparent_80%)]">
            {!showVideo ? (
              <>
                <img
                  src={videoThumbnail}
                  alt="Mob Controller Promo Thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <button
                    onClick={() => setShowVideo(true)}
                    className="flex items-center gap-3 text-white transition-transform hover:scale-105"
                    aria-label="Play video"
                  >
                    <PlayCircle size={64} strokeWidth={1} />
                    <span className="text-xl font-medium">Watch Demo</span>
                  </button>
                  <a
                    href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-sm text-white/80 underline transition-colors hover:text-white"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </>
            ) : (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            )}

            <BorderBeam
              colorFrom="#D5C1FF"
              colorTo="#AD87FF"
              duration={5}
              size={300}
              borderWidth={1.5}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;