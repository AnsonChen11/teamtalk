![image](https://user-images.githubusercontent.com/110713031/224531474-cc896eb8-c14e-44a0-b073-04a532460f09.png)

# TeamTalk
TeamTalk is a real-time video conferencing website that provides convenient video calling, instant messaging rooms, and collaborative whiteboard functionality. With TeamTalk, you can easily stay connected and aligned with your team, no matter where you are.

- Website URL: <a>https://teamtalk.buzz/</a>

- Test account: test@test.com

- Test password: test123

# Demo
### Preview screen before joining a room & Real-time chat room

![entering](https://user-images.githubusercontent.com/110713031/226884752-86bdea65-1b2b-4001-8076-3f54b4243ebd.gif)
![chat](https://user-images.githubusercontent.com/110713031/226884803-0dc16527-0758-4c1a-8795-e3bf6d132582.gif)
### Collaborative whiteboard & Screen sharing

![whiteboard](https://user-images.githubusercontent.com/110713031/226884822-e3ce36c8-4580-4725-9520-4543ec3516ae.gif)
![share](https://user-images.githubusercontent.com/110713031/226884849-6617d5b4-f635-4f9e-857d-43378bdf741d.gif)

### Recording

![recording](https://user-images.githubusercontent.com/110713031/226884869-6c882e76-7a57-4f7f-8083-6e01930ac55b.gif)

# Table of Contents
- [Main Features](#main-features)
- [Backend Technique](#backend-technique)
  - [Key Points](#key-points)
  - [Deployment](#deployment)
  - [Environment / Web Framework](#environment--web-framework)
  - [AWS Cloud Service](#aws-cloud-service)
  - [Database](#database)
  - [Networking](networking)
  - [Third Party Library](#third-party-library)
  - [Version Control](#version-control)
- [Architecture](#architecture)
  - [Server Architecture](#server-architecture)
  - [WebRTC Architecture](#webrtc-architecture)
  - [Socket Architecture](#socket-architecture)
- [Database Schema](#database-schema)
- [Frontend Technique](#frontend-technique)
- [API Doc](#api-doc)
- [Contact](#contact)

## Main Features

- Membership System 
  - User can sign in locally or Google& Facebook OAuth 2.0 support for third-party login.
  - User authentication with Json Web Token. 
  - Customizable user profiles and avatars.
- Pre-meet
  - Before joining the video room, the pre-meet will confirm the audio and video status and on/off settings.
- In-room
  - Real-time video and audio communication with team members.
  - Instant messaging in the chatroom.
  - Screen sharing during the video call.
  - Recording is available, and supports downloading.
  - Collaborative whiteboard for brainstorming.

## Backend Technique

#### Key Points
- WebRTC
- Socket.IO
- MVC Pattern

#### Deployment
- Docker

#### Environment / Web Framework
- Node.js / Express

#### AWS Cloud Service
- EC2
- S3
- CloudFront

#### Database
- MongoDB Atlas

#### Networking
- HTTP & HTTPS
- Domain Name System (DNS)
- NGINX
- SSL (Let's Encrypt)

#### Third Party Library
- passport.js
- peer.js

#### Version Control
- Git/GitHub


## Architecture

### Server Architecture
![TeamTalk Architecture](https://user-images.githubusercontent.com/110713031/224553916-1a8bad95-a7e8-4455-a112-f7ee881b62d6.jpeg)

### WebRTC Architecture
![WebRTC Architecture](https://user-images.githubusercontent.com/110713031/224553924-6ff41e2d-fc08-4a94-a494-9a329cf8b99a.jpeg)

### Socket Architecture
![Socket Architecture](https://user-images.githubusercontent.com/110713031/224546227-d61d91be-a94a-4115-bf50-682534fad6b3.jpeg)




## Database Schema
![TeamTalk Schema](https://user-images.githubusercontent.com/110713031/224560448-187536d1-3f33-43a4-b058-75378d7c039f.JPG)

## Frontend Technique

- HTML
- JavaScript
- CSS
- AJAX
- Canvas

## API Doc

- [Link](https://app.swaggerhub.com/apis-docs/AnsonChen11/TeamTalk/1.0.0#/)
## Contact

- Developer: Hungwei, Chen (AnsonChen)

- Email: ab67325@gmail.com

- LinkedIn: [AnsonChen](https://www.linkedin.com/in/anson-chen-b773b316b/)
