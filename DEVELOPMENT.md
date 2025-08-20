# Development Guide

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development Commands

- `npm start` - Start development server with hot reload
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (irreversible)

## 📁 File Structure

```
src/
├── components/          # UI Components
│   ├── Sidebar.js      # Navigation sidebar
│   ├── Dashboard.js    # Main dashboard
│   ├── KPICard.js      # KPI metric cards
│   ├── ChartArea.js    # Chart area
│   └── DocumentsTable.js # Documents table
├── App.js              # Main app component
├── index.js            # React entry point
└── index.css           # Global styles + tweakcn theme
```

## 🎨 Styling

### Tailwind CSS v4
- Uses the latest Tailwind CSS v4 alpha
- Custom color scheme from tweakcn
- Responsive design utilities

### CSS Variables
- All design tokens are CSS custom properties
- Easy to customize colors and themes
- Support for light/dark mode

### Component Styling
- Components use Tailwind utility classes
- Consistent spacing and typography
- Hover effects and transitions

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Node modules issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build errors**
   ```bash
   # Check for syntax errors
   npm run build
   ```

### Development Tips

- Use React Developer Tools browser extension
- Check browser console for errors
- Use Tailwind CSS IntelliSense in VS Code
- Hot reload should work automatically

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar collapses on mobile
- Grid layouts adapt to screen size

## 🔮 Next Steps

1. **Add real data integration**
2. **Implement charting library**
3. **Add user authentication**
4. **Create more dashboard views**
5. **Add dark mode toggle**
6. **Implement real-time updates**

## 🛠️ Tools & Extensions

### VS Code Extensions
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

### Browser Extensions
- React Developer Tools
- Redux DevTools (if using Redux)

---

Happy coding! 🎉
