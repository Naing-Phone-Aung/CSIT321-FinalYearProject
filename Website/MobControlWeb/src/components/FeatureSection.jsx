import React from "react";
import Container from "./Container";
import TitleText from "./ui/TitleText";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import {
  Gamepad2,
  Settings2,
  Touchpad,
  Users,
  Vibrate,
  Keyboard,
  ChevronRight,
} from "lucide-react";

const FeatureSection = () => {
  const featuresData = [
    {
      icon: Gamepad2,
      title: "Seamless Experience",
      description:
        "Use mobile devices as game controllers, without the need for additional hardware.",
    },
    {
      icon: Settings2,
      title: "Game Control Customization",
      description:
        "Customizable controller layout to match individual gaming preferences.",
    },
    {
      icon: Touchpad,
      title: "Multi-Touch Support",
      description:
        "Supports multiple simultaneous touch inputs for complex game actions.",
    },
    {
      icon: Users,
      title: "Multiplayer Support",
      description:
        "Supports connection of multiple controller devices for local multiplayer.",
    },
    {
      icon: Vibrate,
      title: "Haptic Feedback",
      description:
        "Provides vibration feedback when inputs are given to the controller.",
    },
    {
      icon: Keyboard,
      title: "Keyboard Support",
      description:
        "Use mobile device’s keyboard to send text-based inputs directly to the game.",
    },
  ];
  return (
    <Container>
      <div id="Features" className="flex flex-col justify-center items-center pt-30">
        <TitleText
          title="Simple. Seamless. Smart."
          text="See How MobController Turns Your Touch Into Game Control — in Just Four Simple Steps."
        />
      </div>
      <div className="pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col hover:bg-zinc-700/10 transition-colors space-y-3 border border-white/10 items-center px-10 py-8 text-center"
              >
   
                <div className="flex items-center justify-center rounded-lg bg-transparent bg-gradient-to-b from-violet to-violet-800 p-2">
                  <feature.icon
                    className="size-7 text-white/90"
                    strokeWidth={1.7}
                  />
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>

          
                <p className=" text-white/60 text-sm">{feature.description}</p>

               
                <a
                  href="#"
                  className="inline-flex mt-auto text-sm items-center gap-1  text-violet-400 hover:text-violet-300"
                >
                  Learn more
                  <ChevronRight size={15} />
                </a>
              </div>
            ))}
          </div>
          <div className="relative h-[100px] w-full overflow-hidden">
            <FlickeringGrid
              className="absolute inset-0 z-0 size-full bg-ink [mask-image:linear-gradient(to_bottom,black_40%,transparent_80%)]"
              squareSize={4}
              gridGap={6}
              color="white"
              maxOpacity={0.1}
              flickerChance={0.2}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default FeatureSection;
