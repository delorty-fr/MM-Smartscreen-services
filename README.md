# MM Smartscreen Services

A collection of services that integrate with [MM-SmartScreen](https://github.com/delorty-fr/MM-SmartScreen).

## Overview

This repository contains two main services:

### 1. **Sonos Service** (`sonos-service/`)
An HTTP-based API for controlling your Sonos audio system. Control speakers, manage playlists, adjust volume, and integrate with various music streaming services.

- **Port**: 5005 (HTTP), 5006 (HTTPS)
- **Runtime**: Node.js 4.0.0+
- **Key Features**:
  - Zone management
  - Playback control (play, pause, skip, seek)
  - Volume and mute control
  - Playlist and favorite management
  - Text-to-speech announcements
  - Multiple music service integration (Spotify, Apple Music, Pandora, TuneIn, etc.)
  - WebSocket events for real-time state updates

### 2. **Tractive Service** (`tractive-service/`)
An unofficial REST API wrapper for Tractive pet GPS tracking devices. Access location data, track history, and manage pet tracker information.

- **Port**: 3002
- **Runtime**: Node.js 11.0+
- **Framework**: NestJS
- **Key Features**:
  - Real-time pet location tracking
  - Location history
  - Activity monitoring
  - Account management
  - Swagger API documentation

## Prerequisites

- **Node.js** v11.0.0 or higher
- **npm** v5.0.0 or higher
- Network connectivity to respective services (Sonos network for sonos-service, Tractive API for tractive-service)

## Quick Start

### Clone the Repository

```bash
git clone <repository-url>
cd MM-Smartscreen-services
```

### Install Dependencies

Install dependencies for both services:

```bash
# Sonos Service
cd sonos-service
npm install --production

# Tractive Service
cd ../tractive-service
npm install
```

### Configure Environment Variables

#### Sonos Service
Configuration is managed through `sonos-service/settings.json`. See `sonos-service/README.md` for detailed configuration options for music services and TTS providers.

#### Tractive Service
Create a `.env` file from the template:

```bash
cd tractive-service
cp .env.example .env
```

Edit `.env` with your Tractive credentials:
```
TRACTIVE_EMAIL=your@email.com
TRACTIVE_PASSWORD=your_password
```

### Start the Services

**Option 1: Individual Services**

```bash
# Terminal 1 - Sonos Service
cd sonos-service
npm start
# Service running at http://localhost:5005

# Terminal 2 - Tractive Service
cd tractive-service
npm run start
# Service running at http://localhost:3002
```

**Option 2: Using Run Scripts**

```bash
# Sonos Service
cd sonos-service
.\run.cmd

# Tractive Service
cd tractive-service
.\run.cmd
```

## Service Documentation

For detailed documentation on each service, see:

- **[Sonos Service README](sonos-service/README.md)** - Comprehensive API documentation, endpoints, and configuration
- **[Tractive Service README](tractive-service/README.md)** - API usage, feature highlights, and Swagger documentation

## Available Commands

### Sonos Service
```bash
npm start              # Start the server
npm run lint          # Run ESLint
npm install --production  # Install production dependencies only
```

### Tractive Service
```bash
npm start             # Start the server
npm run start:dev     # Start with hot reload
npm run start:debug   # Start with debugging enabled
npm run start:prod    # Production build and start
npm run lint          # Fix linting issues
npm test              # Run unit tests
npm run test:watch    # Watch mode for tests
npm run test:cov      # Generate coverage report
npm run test:e2e      # Run end-to-end tests
npm run build         # Build for production
```

## Enhancement Ideas

### Tractive Service Future Enhancements

Potential features and improvements for future versions:

- **Bluetooth Integration**
  - Direct Bluetooth connection to Tractive devices to send commands (ligh/sound) even if device is in power saving zone (see https://github.com/drrobotk/PyTractive)

## Credits

### Tractive Service
This Tractive service implementation is built upon and inspired by the following projects:

- [**dominique-boerner/unofficial-tractive-rest-api**](https://github.com/dominique-boerner/unofficial-tractive-rest-api) - Unofficial Tractive REST API
- [**FAXES/tractive**](https://github.com/FAXES/tractive) - Tractive API wrapper
- [**drrobotk/PyTractive**](https://github.com/drrobotk/PyTractive) - Python Tractive API client

We extend our gratitude to these projects for their contributions to understanding and working with the Tractive API.

## License

This project is licensed under the GNU General Public License v2.0. See [LICENSE](LICENSE) for details.
