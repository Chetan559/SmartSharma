# 🧠 SmartSharma

<div align="center">
  <img src="https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge&logo=claude" alt="AI Powered">
  <img src="https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Flask-2.0+-000000?style=for-the-badge&logo=flask" alt="Flask">
  <img src="https://img.shields.io/badge/TailwindCSS-3.0+-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/WebContainer-StackBlitz-FF6B35?style=for-the-badge" alt="WebContainer">
</div>

<div align="center">
  <h3>🚀 AI-Powered Web IDE for Full-Stack Development</h3>
  <p><em>Transform your ideas into working applications with just natural language prompts</em></p>
</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 What is SmartSharma?](#-what-is-smartsharma)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔧 Installation](#-installation)
- [🌐 Deployment](#-deployment)
- [📖 Usage](#-usage)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

<div align="center">
  <table>
    <tr>
      <td align="center">
        <h4>🧠 Natural Language to Code</h4>
        <p>Describe your app in plain English and watch it come to life</p>
      </td>
      <td align="center">
        <h4>⚡ Real-Time Preview</h4>
        <p>See your application running instantly in the browser</p>
      </td>
    </tr>
    <tr>
      <td align="center">
        <h4>🗂️ Smart File Explorer</h4>
        <p>Auto-generated project structure with intuitive navigation</p>
      </td>
      <td align="center">
        <h4>💻 Full-Featured Editor</h4>
        <p>Monaco Editor with syntax highlighting and IntelliSense</p>
      </td>
    </tr>
    <tr>
      <td align="center">
        <h4>🔄 Step-by-Step Generation</h4>
        <p>Watch your project build progressively with detailed steps</p>
      </td>
      <td align="center">
        <h4>🌐 In-Browser Execution</h4>
        <p>Full Node.js environment running entirely in your browser</p>
      </td>
    </tr>
  </table>
</div>

---

## 🎯 What is SmartSharma?

**SmartSharma** is a revolutionary AI-powered web-based IDE that bridges the gap between imagination and implementation. Whether you're a developer, startup founder, or student, SmartSharma transforms your natural language descriptions into fully functional web applications in seconds.

### 🌟 Perfect For:

- **Developers**: Rapid prototyping and proof-of-concept development
- **Startups**: Quick MVP creation and idea validation
- **Students**: Learning full-stack development through AI assistance
- **Designers**: Bringing UI/UX concepts to life without deep coding knowledge

---

## 🛠️ Technology Stack

### 🎨 Frontend Architecture

```
React 18+ → Component-based UI development
TailwindCSS → Modern utility-first styling
Monaco Editor → VS Code-like editing experience
React Router → Seamless navigation
Lucide Icons → Beautiful, consistent iconography
```

### 🧠 AI & Backend

```
LLM API → Natural language processing
Flask → Lightweight Python web server
Custom XML Parser → Structured AI response handling
Flask-CORS → Cross-origin resource sharing
```

### 🌐 Runtime Environment

```
WebContainer (StackBlitz) → In-browser Node.js execution
NPM Package Management → Automatic dependency installation
Live Development Server → Real-time preview capabilities
```

### ☁️ Deployment & DevOps

```
Frontend: Vercel / GitHub Pages
Backend: Render.com
Keep-Alive: Cron Jobs
```

---

## 📁 Project Structure

```
SmartSharma/
├── 📁 client/                 # React Frontend Application
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── StepsList.jsx      # Progress visualization
│   │   │   ├── FileExplorer.jsx   # Project structure navigation
│   │   │   ├── CodeEditor.jsx     # Monaco-based code editor
│   │   │   └── PreviewFrame.jsx   # Live app preview
│   │   ├── 📁 pages/
│   │   ├── 📁 hooks/
│   │   ├── 📁 utils/
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── 📁 server/                 # Flask Backend API
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── utils/
│       └── gemini_wrapper.py      # AI response
|
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0 or higher)
- **Python** (v3.8 or higher)
- **Git**
- **Google Gemini API Key** ([Get it here](https://aistudio.google.com/app/apikey))

### Quick Start

1. **Clone the repository**

   ```bash
   https://github.com/Chetan559/SmartSharma.git
   cd smartsharma
   ```

2. **Set up environment variables**

   ```bash
   # In the server directory
   cd server
   echo "GOOGLE_API_KEY=your_api_key_here" > .env
   ```

3. **Install dependencies**

   ```bash

   # Frontend
   cd ../client
   npm install
   ```

4. **Start the development servers**

   ```bash

   # Terminal 1 - Frontend
   cd client
   npm start
   ```

5. **Open your browser** and navigate to `http://localhost:5173`

---

## 🔧 Installation

### 🐍 Backend Setup

```bash
cd server

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your GOOGLE API key

# Run the Flask server
python app.py
```

### ⚛️ Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

---

## 🌐 Deployment

### 🚀 Frontend Deployment (Netlify)

```bash
# Build the project
cd client
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

## 📖 Usage

### 🎯 Creating Your First App

1. **Enter your prompt** in the main input field:

   ```
   "Create a todo app with React and TailwindCSS that allows users to add, edit, delete, and mark tasks as complete"
   ```

2. **Watch the magic happen:**

   - AI generates step-by-step instructions
   - Files are created automatically
   - Project structure is built
   - Live preview starts running

3. **Explore and edit:**
   - Browse files in the explorer
   - Edit code in the Monaco editor
   - See changes reflected in real-time

### 💡 Pro Tips

- **Be specific** in your prompts for better results
- **Use technology preferences** like "using React hooks" or "with TypeScript"
- **Mention styling preferences** like "modern design" or "dark theme"
- **Include functionality details** like "with user authentication" or "responsive design"

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 Bug Reports

- Use the GitHub Issues tab
- Include detailed reproduction steps
- Add screenshots if applicable

### 💡 Feature Requests

- Check existing issues first
- Provide detailed use cases
- Explain the expected behavior

### 🔧 Pull Requests

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes
# Commit your changes
git commit -m "Add amazing feature"

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

### 📝 Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h3>🌟 Star this repo if you found it helpful!</h3>
  <p>Made with ❤️ by the SmartSharma team</p>
  
  <a href="https://github.com/Chetan559/SmartSharma">
    <img src="https://img.shields.io/github/stars/Chetan559/SmartSharma?style=social" alt="GitHub Stars">
  </a>
  <a href="https://github.com/Chetan559/SmartSharma/fork">
    <img src="https://img.shields.io/github/forks/Chetan559/SmartSharma?style=social" alt="GitHub Forks">
  </a>
</div>

---

### 🔗 Quick Links

- **[Live Demo](https://smartsharma.netlify.app)** - Try it now!
- **[Documentation](README.md)** - Detailed guides
- **[API Reference](/server/endPoints.md)** - Backend API docs

---

_Happy coding! 🚀_
