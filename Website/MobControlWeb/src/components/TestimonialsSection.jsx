import React from "react";
import Container from "./Container";
import TitleText from "./ui/TitleText";
import { FlickeringGrid } from "./magicui/flickering-grid";

const TestimonialsSection = () => {
  const testimonialsData = [
    {
      name: "Melissa Tan",
      company: "Indie Game Developer",
      imageSrc: "https://randomuser.me/api/portraits/women/44.jpg",
      quote:
        "I often demo small games at meetups, but I don’t have enough controllers. With MobController, anyone with a phone can join in. It's a genius idea for local testing and fast prototyping!",
    },
    {
      name: "Jason Miller",
      company: "IT Student",
      imageSrc: "https://randomuser.me/api/portraits/men/32.jpg",
      quote:
        "MobController is a lifesaver during group projects and game jams. We don’t need to carry extra controllers — just connect our phones and test multiplayer games on the spot.",
    },
    {
      name: "Chris Thompson",
      company: "Streamer & Content Creator",
      imageSrc: "https://randomuser.me/api/portraits/men/46.jpg",
      quote:
        "This app is perfect for party games on stream. Viewers and friends can jump in using their phones — no cables or hassle. It’s added a whole new level of interactivity to my content.",
    },
    {
      name: "Natalie Brooks",
      company: "Casual Gamer",
      imageSrc: "https://randomuser.me/api/portraits/women/68.jpg",
      quote:
        "I’m not a hardcore gamer, but I love hosting game nights. MobController made it super easy for everyone to join in — even those without a controller. Setup took less than a minute!",
    },
    {
      name: "Liam Scott",
      company: "Multiplayer Game Developer",
      imageSrc: "https://randomuser.me/api/portraits/men/75.jpg",
      quote:
        "Getting people to test your local multiplayer game is hard when they need controllers. MobController completely solved that problem for me. It’s fast, flexible, and just works.",
    },
    {
      name: "Chloe Adams",
      company: "Family Gamer",
      imageSrc: "https://randomuser.me/api/portraits/women/79.jpg",
      quote:
        "We used MobController during a family gathering, and even my parents could join in on the fun using their phones. No need to buy extra controllers anymore.",
    },
    {
      name: "Charlie Davis",
      company: "Tech Club Organizer",
      imageSrc: "https://randomuser.me/api/portraits/men/86.jpg",
      quote:
        "We used MobController for our university’s game dev showcase. It made it so easy for visitors to try out student-made games using just their phones. Setup was fast and smooth.",
    },
    {
      name: "Fiona Grant",
      company: "UX Design Student",
      imageSrc: "https://randomuser.me/api/portraits/women/26.jpg",
      quote:
        "MobController impressed me not just technically, but in how user-friendly the interface is. Even non-techy friends figured it out instantly at our party game session.",
    },
    {
      name: "Ian Johnson",
      company: "Unity Game Developer",
      imageSrc: "https://randomuser.me/api/portraits/men/9.jpg",
      quote:
        "MobController fits perfectly into my Unity prototyping workflow. It’s like having multiple controllers in your pocket — ideal for user testing and demos.",
    },
  ];

  return (
    <section className="pt-30">
      <Container>
        <div className="flex flex-col items-center justify-center text-center">
          <TitleText
            title="Empower Your Gameplay with MobController"
            text="Hear from gamers and developers who’ve transformed their experience using MobController from real-time control and multiplayer fun to seamless setup and customization."
          />
        </div>
        <div className="grid grid-cols-1 border-l border-t mt-10 border-zinc-800 md:grid-cols-2 lg:grid-cols-3">
          {testimonialsData.map((testimonial, index) => (
            <div
              key={index}
              className="border-b border-r transition-colors hover:bg-zinc-700/10 border-zinc-800 p-8"
            >
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.imageSrc}
                  alt={`Photo of ${testimonial.name}`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-white">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-white/60">{testimonial.company}</p>
                </div>
              </div>
              <p className="mt-6 text-white leading-relaxed">
                {testimonial.quote}
              </p>
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

export default TestimonialsSection;