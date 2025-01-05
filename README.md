# AirQuality

# Node.js + TypeScript App with SQLite

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Usage](#usage)

---

## Overview

This is a Node.js application built with TypeScript, using SQLite as its database. The app provides a backend API that allows users to interact with the database seamlessly and a frontend to visualize the ingested data of the AirQuality in one of the cities in Italy.

Make sure you have run the app and built the DB using the /ingest endpoint before starting to innteract with the frontend.

The project is structured to ensure clean, maintainable, and scalable code.

GitHub Repository: [View Repository](https://github.com/otymix/AirQuality or for git pull => https://github.com/otymix/AirQuality.git)

---

## Features

- Built with **TypeScript** for type safety and better developer experience.
- Uses **SQLite**, a lightweight and embedded database.
- RESTful APIs with proper error handling with 3 endpoint /timeseries/ /data and /ingest.
- **Multer** for file uploads.
- CSV parsing with **fast-csv**.
- a public Postman collection to test the API: https://speeding-eclipse-260506.postman.co/workspace/GTW~c8d3a393-7df3-42ec-bd77-09a430e526fb/collection/2986369-fa39b4ab-95af-422b-8cc5-b52b8078e700?action=share&creator=2986369 .

---

## Requirements

- Node.js (v16 or later)
- npm or yarn package manager
- SQLite installed on your system or included as part of the app.( https://sqlitebrowser.org/dl/#macos )

---

## Installation

### 1. Clone the Repository

git clone https://github.com/otymix/AirQuality.git
cd <REPO_NAME>

### 2. Instal Dependencies

npm install

### 3. Set Up the Database

Run the database setup script if provided, or ensure the SQLite database is correctly initialized.

### 4. Run the Application

in development mode:
npm run dev
or for production:
npm run build
npm start

UNiT TESTS:
Jest for unit tests, there are 4 unit tests so far mainly for the endpoint /data and one helper function.

to run the tests use "npm run test"

## Usage

Endpoints
Method Endpoint Description
POST /ingest Upload and process a CSV file.
GET /data Get the data for a given timeframe.
GET /timeseries Get the data of a given field for all the period. like /timeseries/benzene
