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

**MobControl** empowers users to turn their mobile devices into game controllers, bridging the gap between smartphones and gaming experiences on PCs. Designed to work seamlessly across platforms, MobControl offers:

* Intuitive control via mobile
* Real-time interaction with desktop environments
* Smooth connectivity for enhanced gaming immersion

---

## Features

* **Real-time input mapping**: Touch inputs on mobile get transmitted to your PC instantly.
* **Cross-platform compatibility**: Works across Android and desktop environments.
* **Web-based dashboard**: Monitor connection status and configure control schemes dynamically.

---

## Architecture & Structure

The repository is organized into key folders:

* **.expo** – Expo project setup and configuration files
* **DesktopApp** – Desktop application (likely built with C#) for receiving and interpreting control signals
* **MobileApp** – The client-side application for mobile devices
* **Website** – Web dashboard for connection management, settings, and monitoring

---

## Design Prototype

Explore the app’s UI and user flow via the Figma wireframe prototype:
[Design Prototype (Figma)](https://www.figma.com)

---

## Installation & Setup

### Prerequisites

* Node.js (Recommended: v16 or higher)
* .NET SDK (if desktop app uses C#)
* Android SDK (if building for Android)

### Clone the Repository

```bash
git clone https://github.com/Naing-Phone-Aung/CSIT321-FinalYearProject.git
cd CSIT321-FinalYearProject
```

### Launch the Mobile App

```bash
cd MobileApp
npm install
npm start
```

### Launch the Desktop App

```bash
cd DesktopApp
# Build and run using .NET commands or IDE
```

### Launch the Website

```bash
cd Website
npm install
npm run dev
```

---

## Usage

1. Launch the **Desktop App** to prepare for incoming controller input.
2. Open the **Mobile App**, connect to the desktop via QR code, tap-to-connect, or Wi-Fi.
3. Use the **Website** dashboard to customize controls or check connection status.
4. Start your game and enjoy controlling it with your mobile device.

---

## Release

* **Latest Release**: MobControl (Android/PC setup) – August 9, 2025

---

## Contributors

Developed by Group FYP‑25‑S2‑32:

* \[Contributor 1]
* \[Contributor 2]
* \[Contributor 3]
* \[Contributor 4]

---

## Technologies

| Language / Framework | Usage                    |
| -------------------- | ------------------------ |
| JavaScript           | MobileApp & Website      |
| TypeScript           | Web or Mobile components |
| C#                   | Desktop application      |
| CSS & HTML           | Web dashboard UI         |

---

## Contact

For questions, feedback, or collaboration opportunities, please reach out via GitHub Issues or your preferred contact channel.
