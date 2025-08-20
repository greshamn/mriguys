# 🧠 MRI Guys - Professional MRI Services Dashboard

A modern, responsive React dashboard built with Vite, Tailwind CSS, and tweakcn styling. Features beautiful charts, KPI cards, and a professional medical services interface.

## ✨ Features

- **Modern React 18** with functional components and hooks
- **Beautiful tweakcn Theme** with purple/lavender color scheme
- **Responsive Design** that works on all devices
- **Interactive Charts** using Recharts library
- **Professional UI Components** with shadcn/ui
- **Dark Mode Support** (CSS variables ready)
- **Netlify Ready** with proper build configuration

## 🎨 Design System

### tweakcn Theme Colors
- **Primary Purple**: Beautiful lavender tones
- **Accent Pink**: Complementary pink/red highlights
- **Supporting Colors**: Green, orange, blue for variety
- **Perfect Harmony**: All colors work together beautifully

### Chart Colors
- **Chart 1**: Primary purple `var(--chart-1)`
- **Chart 2**: Pink/red `var(--chart-2)`
- **Chart 3**: Green `var(--chart-3)`
- **Chart 4**: Orange/yellow `var(--chart-4)`
- **Chart 5**: Blue `var(--chart-5)`

## 🛠️ Tech Stack

### Core Framework
- **React 18.2.0** - Latest React with hooks and functional components
- **Vite 5.4.19** - Fast build tool and development server
- **Node.js 18+** - Runtime environment

### Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **tweakcn** - Beautiful design system and theme
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful, customizable icons
- **Radix UI** - Accessible component primitives

### Charting Library
- **Recharts** - Composable charting library built on React components
  - Perfect CSS variable support
  - Native React integration
  - Beautiful animations and interactions

### Build Tools
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **ESLint** - Code linting and quality

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx          # Main dashboard layout
│   ├── KPICard.jsx            # KPI metric cards
│   ├── ChartArea.jsx          # Area chart for visitors
│   ├── AdditionalCharts.jsx   # Pie and bar charts
│   ├── Sidebar.jsx            # Navigation sidebar
│   └── DocumentsTable.jsx     # Data table component
├── lib/
│   └── utils.jsx              # Utility functions
├── App.jsx                     # Main application component
├── index.jsx                   # Application entry point
└── index.css                   # Global styles and tweakcn theme
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/greshamn/react-vite-tailwind-tweakcn--apexcharts-template.git
   cd react-vite-tailwind-tweakcn--apexcharts-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build
- **`npm run test`** - Run tests (when configured)

## 🎯 Key Components

### Dashboard Layout
- **KPI Cards**: Revenue, customers, accounts, growth metrics
- **Main Chart**: Area chart showing visitor data over time
- **Additional Charts**: Revenue distribution pie chart and monthly performance bars
- **Documents Table**: Data management interface

### Chart Features
- **Responsive Design**: Adapts to all screen sizes
- **Interactive Tooltips**: Hover for detailed information
- **Beautiful Gradients**: CSS variable-based color schemes
- **Professional Styling**: Matches tweakcn design system

## 🌐 Deployment

### Netlify (Recommended)
This project is configured for Netlify deployment with:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18
- **SPA Redirects**: Configured for React Router

### Other Platforms
- **Vercel**: Works out of the box
- **GitHub Pages**: Requires build step
- **AWS S3**: Static hosting ready

## 🔧 Configuration Files

- **`vite.config.js`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`postcss.config.js`** - PostCSS processing
- **`components.json`** - shadcn/ui configuration
- **`jsconfig.json`** - JavaScript path resolution
- **`netlify.toml`** - Netlify deployment settings

## 🎨 Customization

### Theme Colors
All colors are defined in CSS variables in `src/index.css`:
```css
:root {
  --chart-1: hsl(260 23% 57%);  /* Primary Purple */
  --chart-2: hsl(342 57% 77%);  /* Pink/Red */
  --chart-3: hsl(159 31% 59%);  /* Green */
  --chart-4: hsl(36 77% 75%);   /* Orange/Yellow */
  --chart-5: hsl(216 54% 76%);  /* Blue */
}
```

### Adding New Charts
Use Recharts components with CSS variables:
```jsx
<Bar dataKey="value" fill="var(--chart-1)" />
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **tweakcn** for the beautiful design system
- **shadcn/ui** for the excellent React components
- **Recharts** for the amazing charting library
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review the code examples

---

**Built with ❤️ using React, Vite, Tailwind CSS, and tweakcn**
