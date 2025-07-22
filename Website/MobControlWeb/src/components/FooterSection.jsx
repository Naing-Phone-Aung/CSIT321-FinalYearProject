import React from "react";
import { FaDiscord } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import logo from "../assets/website-icon.png";
import { Link } from "react-scroll";
import ActionModalTriggerComponent from "./ActionModalTriggerComponent";

const FooterSection = () => {
   
  return (
    <footer className="pt-30 font-inter text-white">
      <div className="relative z-10 mx-auto w-[85%] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-medium text-white sm:text-3xl">
            Turn your phone into a game controller — instantly!
          </h2>
          <div className="mt-8">
            <ActionModalTriggerComponent
              buttonText="Get Started for free"
              buttonClassName="rounded-md bg-violet px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-violet-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            />
          </div>
        </div>
        

        <div className="py-10 border-t border-zinc-800 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
              <Link
                to="Home"
                smooth={true}
                duration={500}
                className="flex  cursor-pointer items-center gap-2"
              >
                <span className="font-mono text-white">
                  <img src={logo} className="size-6" alt="" />
                </span>
                <span>Mob Controller</span>
              </Link>
              <nav className="flex gap-4">
                <Link
                  to="Pricing"
                  smooth={true}
                  duration={500}
                  className="text-sm cursor-pointer text-zinc-400 transition hover:text-white"
                >
                  Pricing
                </Link>
                <Link
                  to="Contact"
                  smooth={true}
                  duration={500}
                  className="text-sm cursor-pointer text-zinc-400 transition hover:text-white"
                >
                  Contact
                </Link>
              </nav>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex gap-4">
                <a href="#" className="text-white/80 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <FaGithub className="h-6 w-6" />
                </a>
                <a href="#" className="text-white/80 hover:text-white">
                  <span className="sr-only">X</span>
                  <FaDiscord className="h-6 w-6" />
                </a>
              </div>
              <p className="text-sm text-white/80">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
