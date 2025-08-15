# CSIT321 Final Year Project – MobControl

**MobControl: Transforming Mobile Devices into Game Controllers**
*Group: FYP‑25‑S2‑32*

---

## Table of Contents

* [Project Overview](#project-overview)
* [Features](#features)
* [Architecture & Structure](#architecture--structure)

  * Mobile App
  * Desktop App
  * Website
* [Design Prototype](#design-prototype)
* [Installation & Setup](#installation--setup)
* [Usage](#usage)
* [Release](#release)
* [Contributors](#contributors)
* [Technologies](#technologies)
* [Contact](#contact)

---

## Project Overview

**MobControl** allows users to transform their smartphones into fully functional game controllers, bridging mobile devices and PC gaming. Designed for seamless, cross-platform operation, MobControl delivers:

* Intuitive and customizable mobile controls
* Low-latency, real-time interaction with PC applications
* Easy connectivity through QR code scanning, tap-to-connect, or Wi-Fi

---

## Features

* **Real-time input mapping** – Mobile touch inputs are instantly transmitted to your PC.
* **Cross-platform support** – Compatible with Android devices and desktop systems.
* **Web dashboard** – View connection status, configure control layouts, and manage devices.
* **Multiple connection modes** – Scan QR, tap-to-connect, or connect via network.

---

## Architecture & Structure

The repository is organized as follows:

* **.expo** – Expo project configuration and cache
* **DesktopApp** – C# desktop application handling input reception and integration with games
* **MobileApp** – React Native/Expo mobile client for sending control inputs
* **Website** – Web dashboard for control customization and connection management

---

## Design Prototype

Visualize the UI and user flow with our Figma prototype:
[View Prototype](https://www.figma.com/design/j6X1HD2Ga7WKuDWk2K6miD/Prototype-for-MobController?node-id=0-1&t=K77M20p63bp0sRZW-1)

---

## Installation & Setup

### Prerequisites

* Node.js v16 or higher
* .NET SDK (for the desktop app)
* Android SDK (for Android builds)

### Clone the Repository

```bash
git clone https://github.com/Naing-Phone-Aung/CSIT321-FinalYearProject.git
cd CSIT321-FinalYearProject
```

### Mobile App (Standard Launch)

```bash
cd MobileApp
npm install
npx expo start
```

### Mobile App (WebSocket Development)

```bash
npx expo run:android
```

### Desktop App

```bash
cd DesktopApp
dotnet restore
dotnet build
```

### Website

```bash
cd Website
npm install
npm run build
```

---

## Usage

1. Start the **Desktop App** to listen for controller input.
2. Launch the **Mobile App** and connect via QR scan, tap-to-connect, or Wi-Fi.
3. Use the **Website** dashboard to customize layouts or monitor connections.
4. Launch your game and enjoy controlling it with your mobile device.

---

## Release

* **Latest Release**: MobControl (Android/PC) – *August 9, 2025*

---

## Contributors

Developed by Group FYP‑25‑S2‑32:

* Naing Phone Aung
* Muhammad Naim Hazeret Bin Zainal
* Nathalee Tjoe
* Richard Angelo
* Ryan Chong Hao Ran

---

## Technologies

| Language / Framework | Usage                 |
| -------------------- | --------------------- |
| JavaScript           | MobileApp & Website   |
| JavaScript           | Web/Mobile components |
| C#                   | DesktopApp            |
| CSS & React          | Website UI            |

---

## Contact

For inquiries, suggestions, or collaboration requests, please reach out via GitHub Issues or your preferred communication channel.
