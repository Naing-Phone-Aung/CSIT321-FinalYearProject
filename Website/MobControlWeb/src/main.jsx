import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.jsx";
import { HeroUIProvider } from "@heroui/react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HeroUIProvider>
    <RouterProvider  router={router} />
  </HeroUIProvider>
);
