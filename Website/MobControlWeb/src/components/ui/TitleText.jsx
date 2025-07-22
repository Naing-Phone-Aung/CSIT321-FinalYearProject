import React from "react";

const TitleText = ({title, text}) => {
  return (
    <>
      <h2 className="md:text-4xl text-2xl max-md:w-[85%] font-inter-tight font-medium w-md md:w-3xl text-center">
       {title}
      </h2>
      <p className=" text-center w-md max-md:w-[85%] text-base md:w-3xl mt-5 text-white/90">
       {text}
      </p>
    </>
  );
};

export default TitleText;
