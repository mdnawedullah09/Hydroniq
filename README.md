# Hydroniq 

### AI-Powered Water Intelligence Platform

Hydroniq is an open-source platform designed to help communities report water-related problems, track complaints, and support better water management. It aims to reduce repetitive reporting and monitoring work through a structured workflow and AI-assisted analysis.

##  Why Hydroniq?

Water leakage, broken handpumps, and other water infrastructure problems can waste valuable resources and affect communities. Hydroniq provides a central place to report these issues and monitor their progress.

## ✨ Features

- **Water Problem Reporting:** Submit reports about leaking taps, broken handpumps, and other water-related issues.
- **Report Tracking:** View submitted reports and track their status.
- **Dashboard:** Monitor total reports, pending complaints, and resolved issues.
- **Impact Analytics:** Explore reports grouped by issue type.
- **Area Monitoring:** Support location-based monitoring using state and district information.
- **AI-Assisted Analysis:** Use a local Gemma model through Ollama to suggest issue categories, summarize reports, identify missing details, and recommend next steps.
- **Human Review:** AI-generated suggestions are not treated as verified facts or official decisions.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, FastAPI
- **Database:** MySQL hosted on Aiven
- **AI:** Gemma 3 (4B) through Ollama
- **Deployment:** Vercel (frontend), Render (backend)

## 🔗 Live Demo

- **Web Application:** https://hydroniq-theta.vercel.app
- **Backend API:** https://hydroniq-api.onrender.com
- **API Documentation:** https://hydroniq-api.onrender.com/docs

> Note: The hosted backend and database support report management. The Ollama/Gemma analysis currently requires a machine where the local model is running; hosted AI analysis may be unavailable.

## 🚀 Project Workflow

1. A community member submits a water problem report.
2. The backend validates and stores the report in MySQL.
3. The dashboard displays report statistics.
4. Reports can be reviewed and their statuses updated.
5. The local AI model can assist with report analysis when available.

## 🌱 Open Source and Social Impact

Hydroniq explores how open-source AI can help reduce repetitive administrative work while supporting water conservation and community reporting.

By keeping the project open source, developers can inspect the implementation, suggest improvements, and adapt the platform to other communities and locations.



## 👥 Team

We collaborated on Hydroniq, combining our ideas and development efforts to build an AI-powered water problem reporting platform.

- [**MD Nawedullah Saif**](https://github.com/mdnawedullah09) — Co-Developer
- [**Jaya Patel**](https://github.com/jaya030888) — Co-Developer

We shared responsibility for turning Hydroniq from an idea into a working application, focusing on community welfare, water conservation, and open-source AI.


## 📌 Future Improvements

- Improve deployment support for AI-assisted analysis.
- Add more location-based insights.
- Improve accessibility and mobile responsiveness.
- Explore integrations that help communities coordinate water infrastructure repairs.
