<div align="center">
  <img height="150" src="https://i.postimg.cc/Nf651bzY/cinesearch.png" alt="CineSearch Logo" />
</div>

<h1 align="center">🎬 CineSearch</h1>
<p align="center"><em>A scalable, responsive movie & TV discovery platform with rich metadata and a sleek UI/UX.</em></p>

<div align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black&style=for-the-badge" alt="React" height="32" />
  <img src="https://img.shields.io/badge/Appwrite-F02E65?logo=appwrite&logoColor=white&style=for-the-badge" alt="Appwrite" height="32" style="margin:0 8px;" />
  <img src="https://img.shields.io/badge/Tailwind CSS-06B6D4?logo=tailwindcss&logoColor=black&style=for-the-badge" alt="Tailwind CSS" height="32" />
</div>

## 🔍 Overview

CineSearch delivers an enterprise-grade search solution for movies and TV series. Leveraging a proprietary trending-score algorithm, responsive interfaces, and modular architecture, it empowers users to discover content by title, rating, language, release year, and country with sub-second latency.

---

## 🚀 Key Features

- **Comprehensive Browsing** 🔄  
  Scroll through an extensive, paginated catalog of films and series.  
- **Instant Search** ⚡  
  Real-time predictive suggestions for rapid title lookup.  
- **Trending Insights** 📈  
  Algorithmic ranking surfaces the most popular content dynamically.  
- **Responsive UI/UX** 📱💻  
  Fluid design optimized for desktop, tablet, and mobile viewports.  
- **Scalable Architecture** 🧱  
  Component-driven codebase ensures maintainability and high reusability.  
- **Rich Metadata** 🏷️  
  Display ratings, original language, release year, and country of origin.  

---

## 🛠 Tech Stack

| Layer             | Technology               |
|-------------------|--------------------------|
| Frontend          | React, Tailwind CSS      |
| Backend (BaaS)    | Appwrite                 |
| Data Source       | The Movie Database (TMDB)|
| Version Control   | Git & GitHub             |

---

## 📋 Prerequisites

- **Node.js** ≥ 14.x  
- **npm** (bundled with Node.js)  
- **Git** for version control  
- **TMDB API Key** 🔑 (register at [themoviedb.org](https://www.themoviedb.org/documentation/api))  
- **Appwrite Project** ☁️ (create at [appwrite.io](https://appwrite.io/))  

---

## ⚙️ Installation & Setup

1. **Clone the repository**  
   ```bash
   git clone https://github.com/MuhammadTanveerAbbas/cinesearch.git
   cd cinesearch

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**
   Copy the sample environment file and populate your credentials:

   ```bash
   cp .env.example .env
   ```

   Then open `.env` and set:

   ```bash
   VITE_APP_API_KEY=<Your_TMDB_API_Key>
   VITE_APPWRITE_PROJECT_ID=<Your_Appwrite_Project_ID>
   VITE_APPWRITE_DATABASE_ID=<Your_Appwrite_Database_ID>
   VITE_APPWRITE_COLLECTION_ID=<Your_Appwrite_Collection_ID>
   ```

4. **Start development server**

   ```bash
   npm start
   ```

   🎉 Access the app at `http://localhost:3000`

---

## 🔧 Configuration

* **TMDB Integration**

  1. Obtain API key from [TMDB](https://www.themoviedb.org/documentation/api).
  2. Assign to `VITE_APP_API_KEY` in `.env`.

* **Appwrite Backend**

  1. In your Appwrite console, create a project, database, and collection.
  2. Copy `Project ID`, `Database ID`, and `Collection ID` into `.env`.

---

## ✨ Usage

* **🔎 Search:** Type movie or series titles; instantaneous results appear.
* **🏆 Trending:** Visit the homepage to view algorithm-ranked popular content.
* **ℹ️ Details:** Click any poster to see full metadata—rating, language, release year, and country.

---


## 📄 License

© 2025 Muhammad Tanveer Abbas. Licensed under the MIT License.
