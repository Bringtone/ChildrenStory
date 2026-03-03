# Fantasy Story Generator 🧚✨

A magical web app for children to create their own illustrated fantasy stories! Built with vanilla JavaScript and Pollinations AI.

![Fantasy Story Generator](https://img.shields.io/badge/Status-Ready-brightgreen)
![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-blue)

## Features

- ✨ **Personalized Stories** - Enter your name and it appears in the story!
- 🐉 **Multiple Creatures** - Choose from dragons, unicorns, wizards, fairies, mermaids, phoenixes, elves, or gryphons
- 🏰 **Magical Settings** - Enchanted forests, castles, cloud kingdoms, underwater palaces, and more!
- 🎨 **AI Illustrations** - Each page gets a unique AI-generated illustration
- 📖 **Easy Navigation** - Simple Previous/Next buttons to flip through pages
- 👶 **Kid-Friendly** - Colorful, fun design perfect for children ages 4-8

## Demo

Try it live: [here](https://bringtone.github.io/ChildrenStory/)

## Quick Start

### Option 1: Run Locally

```bash
# Clone or download this repository
cd fantasy-story-app

# Start a local server (Python)
python3 -m http.server 8000

# Or with Node.js
npx serve .

# Open in browser
# http://localhost:8000
```

### Option 2: Deploy to GitHub Pages

1. **Create a GitHub Repository**
   - Go to [GitHub](https://github.com)
   - Create a new repository named `fantasy-story-app`
   - Make it public

2. **Upload Files**
   - Push these files to your repository:
     - `index.html`
     - `style.css`
     - `app.js`
     - `README.md`

3. **Enable GitHub Pages**
   - Go to Repository Settings → Pages
   - Under "Build and deployment":
     - Source: **Deploy from a branch**
     - Branch: **main** (or master)
     - Folder: **/ (root)**
   - Click Save

4. **Your Site is Live!**
   - Wait 1-2 minutes for deployment
   - Visit: `https://your-username.github.io/fantasy-story-app/`

## How It Works

### Story Generation
The app uses the Pollinations AI API to generate creative, age-appropriate stories:
- Each story is personalized with the child's name
- Stories are 3-5 pages (user selectable)
- Text is kept short and simple for young readers

### Image Generation
Each page gets a unique AI-generated illustration using Pollinations:
- Images are created based on the chosen creature and setting
- Style is children's book illustration (Disney/Storybook style)
- Images load asynchronously for better performance

### Technology
- **HTML5** - Semantic structure
- **CSS3** - Responsive, animated, kid-friendly design
- **JavaScript (ES6+)** - No frameworks, pure vanilla JS
- **Pollinations AI** - Free API for story and image generation

## Customization

### Add More Creatures
Edit `app.js` - add entries to:
- `creatureNames` object in `generateStory()`
- `stories` object in `generateLocalStory()`
- `imagePrompts` object in `generateImages()`

### Add More Settings
Edit `app.js` - add entries to:
- `settingBackgrounds` object in `generateImages()`

### Change Colors
Edit `style.css` - modify CSS variables:
```css
:root {
    --primary: #FF6B9D;   /* Main pink color */
    --secondary: #9B59B6; /* Purple accent */
    --accent-1: #3498DB;  /* Blue accent */
}
```

## API Rate Limits

The free Pollinations API has rate limits. If you hit them:
- Wait a moment and try again
- For production, consider getting an API key from Pollinations
- The app includes fallback local story generation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - Feel free to use and modify!

---

*Made with 💖 for little dreamers everywhere*

## Troubleshooting

### Images not loading?
- Check your internet connection
- The Pollinations API might be busy - try again in a few seconds

### Story generation fails?
- The app has a fallback with pre-written stories
- Check browser console for errors

### GitHub Pages not working?
- Make sure repository is **public**
- Wait 2-5 minutes after enabling Pages
- Check Settings → Pages for any errors
