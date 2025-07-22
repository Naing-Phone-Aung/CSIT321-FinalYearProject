import React from "react";
import Container from "./Container";
import { Ripple } from "@/components/magicui/ripple";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { FaDiscord } from "react-icons/fa";
import TitleText from "./ui/TitleText";

const CommunitySection = () => {
  const avatars = [
    {
      imageUrl: "https://avatars.githubusercontent.com/u/16860528",
      profileUrl: "https://github.com/dillionverma",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/20110627",
      profileUrl: "https://github.com/tomonarifeehan",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/106103625",
      profileUrl: "https://github.com/BankkRoll",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/59228569",
      profileUrl: "https://github.com/safethecode",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/59442788",
      profileUrl: "https://github.com/sanjay-mali",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/89768406",
      profileUrl: "https://github.com/itsarghyadas",
    },
  ];

  return (
    <section className="pt-30">
      <Container>
        <div className="flex flex-col justify-center items-center">
          <TitleText
            title={"Join Our Community"}
            text={
              "Connect with fellow gamers, developers, and enthusiasts. Share your experiences, get support, and contribute to the MobController project."
            }
          />
        </div>

        <div className="relative flex h-[300px] mt-10 w-full flex-col items-center justify-center overflow-hidden  border border-white/10 bg-ink ">
          <div className="flex flex-col items-center justify-center space-y-5">
            <p className="font-medium text-white/70 w-lg text-center">
              We're grateful for the amazing open-source community that helps
              make our project better every day.
            </p>
            <AvatarCircles avatarUrls={avatars} />

            <a
              href="https://discord.gg/FbVbF229FV"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 hover:bg-zinc-100/20 transition-colors rounded-md bg-zinc-200/10 text-white px-5 py-2.5 text-sm font-medium "
            >
              <FaDiscord size={20} />
              <span>Become a Contributor</span>
            </a>
            
          </div>
          <Ripple />
        </div>
      </Container>
    </section>
  );
};

export default CommunitySection;