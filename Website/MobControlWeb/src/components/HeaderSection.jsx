import React, { useState } from "react";
import logo from "../assets/website-icon.png";
import { Link } from "react-scroll";

const HeaderSection = () => {
  const [navList, setNavList] = useState([
    { name: "Home", current: true },
    { name: "About", current: false },
    { name: "Features", current: false },
    { name: "Pricing", current: false },
    { name: "Contact", current: false },
  ]);

  const handleNavClick = (name) => {
    
    setNavList(
      navList.map((item) => ({
        ...item,
        current: item.name === name,
      }))
    );
  };
  return (
    <div className="font-inter z-50">
      <header className="fixed top-0 left-0 w-full z-50 font-inter">
        <nav className="bg-transparent backdrop-blur-sm border-b border-zinc-800 py-3">
          <div className="mx-auto w-[85%]  flex justify-between items-center">
            <a href="#" className="flex justify-center items-center text-white">
              <img src={logo} className="h-6 w-6" alt="MobController Logo" />
              <p className="ml-2">Mob Controller</p>
            </a>
            <div className="hidden lg:flex lg:items-center text-[15px] lg:space-x-3">
              {navList.map((item) => (
                <Link
                  to={item.name}
                  smooth={true}
                  duration={500}
                  key={item.name}
                  onClick={() => handleNavClick(item.name)}
                  className={`px-3 py-2 transition-colors cursor-pointer
                  ${
                    item.current
                      ? "text-white"
                      : "text-zinc-400 hover:text-white"
                  }
                `}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default HeaderSection;
