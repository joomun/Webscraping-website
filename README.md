# Game Price Comparison Web Application

## Introduction
This repository contains the code for a web application that compares game prices across different online vendors. It is designed to provide a user-friendly interface for gamers to find the best deals for their favorite titles.

## Technologies
- Backend: Java with Maven, Hibernate ORM, and MySQL.
- Web Scraping: Java-based scraping of game prices.
- Frontend: HTML, CSS, and JavaScript.
- Server: Node.js with Express framework, MySQL2 for database interactions.

## Features
- Real-time price comparison from Steam, GOG, Gamivo, K4g, and Amazon.
- Search functionality for finding games.
- Product pages with detailed descriptions and links to vendors.
- Periodic backend job execution to update game prices.

## Installation
- Clone the repository.
- Set up the MySQL database using the provided SQL dump.
- Ensure Node.js and Java JDK are installed.
- Install dependencies: `npm install` and `mvn install`.

## Usage
- Start the Node.js server: `node server.js`.
- Access the web application via `http://localhost:3000/`.

## API Endpoints
- `/api/deals`: Fetches deals from the database.
- `/api/products`: Paginated list of games.
- `/api/product/:id`: Details for a specific game.
- `/search`: Search for games based on a query term.

## Development Notes
- Compilation and execution of Java components via Maven.
- Ethical web scraping guidelines followed.
- Connection pooling for efficient database access.
