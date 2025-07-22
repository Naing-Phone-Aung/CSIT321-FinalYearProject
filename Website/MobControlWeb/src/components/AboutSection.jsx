import React from "react";
import Container from "./Container";
import TitleText from "./ui/TitleText";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Plus } from "lucide-react";
import { FlickeringGrid } from "./magicui/flickering-grid";

const AboutSection = () => {
  const statsData = [
    { value: 100, line1: "Global", line2: "Customers" },
    { value: 20, line1: "Game", line2: "Features" },
    { value: 400, line1: "Hours", line2: "Invested" },
  ];

  const aboutMobController = [
    {
      title: "From Concept to Controller",
      description:
        "We’ve built MobController from the ground up—handling everything from ideation and UX design to development and real-time testing. Every feature, from secure pairing to customizable layouts, is carefully crafted to deliver a smooth, immersive gaming experience.",
    },
    {
      title: "Solo or Team-Driven",
      description:
        "MobController is the result of both individual expertise and strong team collaboration. Whether fine-tuning code or testing multiplayer support, we adapt to every challenge—working independently or as a unit to bring the best out of every line of code and every user interaction.",
    },
  ];

  const StatCard = ({ value, line1, line2 }) => (
    <div className="flex flex-col col-span-1 items-center justify-center gap-3  border border-white/10 p-10">
      <div className="flex items-baseline justify-center">
        <Plus
          strokeWidth={3}
          strokeLinecap="square"
          size={42}
          className="stroke-violet-500 mr-1"
        />
        <NumberTicker
          value={value}
          className="text-7xl font-semibold tracking-tighter text-white"
        />
      </div>
      <div className="text-start text-lg text-white/70">
        <p>{line1}</p>
        <p>{line2}</p>
      </div>
    </div>
  );
  return (
    <section id="About" className="pt-30">
      <Container>
        <div className="flex flex-col justify-center items-center ">
          <TitleText
            title="Innovating the Future of Gaming"
            text=" MobController is a mobile-first application that turns your smartphone
        or tablet into a fully functional game controller for your PC. Designed
        for flexibility, accessibility, and ease of use."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 pt-10">
          {statsData.map((stat) => (
            <StatCard
              key={stat.line1}
              value={stat.value}
              line1={stat.line1}
              line2={stat.line2}
            />
          ))}
        </div>
        <div className="mt-20">
          {aboutMobController.map((el, index) => (
            <div
              key={index}
              className="grid grid-cols-2 border-b py-10 border-white/10 "
            >
              <div className="col-span-1">
                <h4 className="text-xl">{el.title}</h4>
              </div>
              <div className="col-span-1 text-white/90 ">
                <p>{el.description}</p>
              </div>
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
      </Container>
    </section>
  );
};

export default AboutSection;
