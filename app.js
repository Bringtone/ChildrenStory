// Fantasy Story Generator - App Logic

// State
let currentStory = null;
let currentPage = 0;

// DOM Elements
const elements = {
    inputSection: document.getElementById('input-section'),
    loadingSection: document.getElementById('loading-section'),
    storySection: document.getElementById('story-section'),
    errorSection: document.getElementById('error-section'),
    storyForm: document.getElementById('story-form'),
    childName: document.getElementById('child-name'),
    creature: document.getElementById('creature'),
    setting: document.getElementById('setting'),
    pagesCount: document.getElementById('pages'),
    apiKey: document.getElementById('apiKey'),
    storyTitle: document.getElementById('story-title'),
    storyImage: document.getElementById('story-image'),
    imagePlaceholder: document.getElementById('image-placeholder'),
    storyText: document.getElementById('story-text'),
    currentPageEl: document.getElementById('current-page'),
    totalPagesEl: document.getElementById('total-pages'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    newStoryBtn: document.getElementById('new-story-btn'),
    retryBtn: document.getElementById('retry-btn'),
    progressFill: document.getElementById('progress-fill')
};

// Event Listeners
elements.storyForm.addEventListener('submit', handleStoryGeneration);
elements.prevBtn.addEventListener('click', () => navigatePage(-1));
elements.nextBtn.addEventListener('click', () => navigatePage(1));
elements.newStoryBtn.addEventListener('click', resetApp);
elements.retryBtn.addEventListener('click', resetApp);

// Handle Story Generation
async function handleStoryGeneration(e) {
    e.preventDefault();

    const name = elements.childName.value.trim();
    const creature = elements.creature.value;
    const setting = elements.setting.value;
    const pageCount = parseInt(elements.pagesCount.value);

    if (!name) {
        alert('Please enter your name!');
        return;
    }

    // Show loading
    showSection('loading');
    updateProgress(30);

    try {
        // Generate story content
        const story = await generateStory(name, creature, setting, pageCount);
        updateProgress(60);

        // Generate images for each page
        await generateImages(story, setting, creature);
        updateProgress(90);

        // Set up story display
        currentStory = story;
        currentPage = 0;

        // Update UI
        elements.storyTitle.textContent = `${name}'s ${formatTitle(creature)} Adventure`;
        elements.totalPagesEl.textContent = story.pages.length;

        // Display first page
        displayPage(0);
        updateProgress(100);

        setTimeout(() => {
            showSection('story');
        }, 500);

    } catch (error) {
        console.error('Error generating story:', error);
        showSection('error');
    }
}

// Generate Story Text using Pollinations API
async function generateStory(name, creature, setting, pageCount) {
    const creatureNames = {
        dragon: 'a friendly dragon',
        unicorn: 'a magical unicorn',
        wizard: 'a young wizard',
        fairy: 'a forest fairy',
        mermaid: 'an ocean mermaid',
        phoenix: 'a beautiful phoenix',
        elf: 'a clever forest elf',
        gryphon: 'a majestic gryphon'
    };

    const prompt = `Write a ${pageCount}-page children's fantasy story about ${name} and ${creatureNames[creature]} in ${setting}.

Each page should be:
- 2-3 sentences only (short for children)
- Magical and adventurous
- Age-appropriate (ages 4-8)
- Include the child's name "${name}" in each page
- Positive and heartwarming

Format the output as a JSON array with exactly ${pageCount} items, each having a "text" field. Example format:
[{"text": "Page 1 text here..."}, {"text": "Page 2 text here..."}, {"text": "Page 3 text here..."}]`;

    try {
        const apiKey = getApiKey();
        const requestBody = {
            model: 'openai',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            seed: Math.floor(Math.random() * 10000)
        };

        // Add API key if provided
        if (apiKey) {
            requestBody.key = apiKey;
        }

        const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Failed to generate story');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse JSON from response
        let pages;
        try {
            // Try to extract JSON array from the response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                pages = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: create simple pages from text
                pages = createSimplePages(content, pageCount);
            }
        } catch (e) {
            console.log('JSON parse failed, using fallback');
            pages = createSimplePages(content, pageCount);
        }

        // Ensure we have the right number of pages
        while (pages.length < pageCount) {
            pages.push({ text: `${name} had more magical adventures in the ${setting}!` });
        }
        pages = pages.slice(0, pageCount);

        return { pages, creature, setting, name };

    } catch (error) {
        console.error('Story generation error:', error);
        // Fallback to local story generation
        return generateLocalStory(name, creature, setting, pageCount);
    }
}

// Fallback local story generation
function generateLocalStory(name, creature, setting, pageCount) {
    const stories = {
        dragon: [
            `${name} met a friendly dragon who loved to bake cookies! Together they went on a magical journey through the ${setting}, finding treasure everywhere they looked.`,
            `The dragon showed ${name} its secret cave filled with glowing crystals. ${name} discovered they could sing and make the crystals dance!`,
            `As the sun set, ${name} and the dragon had a picnic. "You are the best friend ever!" said the dragon. ${name} smiled and agreed.`,
            `${name} waved goodbye to the dragon. "Come back tomorrow!" called the dragon. ${name} couldn't wait for their next adventure!`,
            `That night, ${name} dreamed of flying on the dragon's back above the clouds. It was the best dream ever!`
        ],
        unicorn: [
            `${name} discovered a sparkling rainbow and followed it to a meadow where a beautiful unicorn lived! The unicorn welcomed ${name} with a friendly neigh.`,
            `The unicorn took ${name} for a ride across the magical meadow. They jumped over flower hills and splashed through rainbow rivers together!`,
            `The unicorn showed ${name} its special garden where flowers could talk. "Hello, ${name}!" sang the flowers. ${name} was amazed!`,
            `As evening came, the unicorn gave ${name} a gift - a tiny rainbow feather that would grant wishes. ${name} was so happy!`,
            `${name} rode the unicorn one last time as the stars appeared. "Thank you for the best day ever!" said ${name}.`
        ],
        wizard: [
            `${name} found a magic wand in the attic! When they waved it, sparks flew everywhere and a friendly wizard appeared.`,
            `The wizard taught ${name} a simple spell - to make flowers bloom with a wave! ${name} practiced in the ${setting} and soon flowers popped up everywhere!`,
            `Suddenly, a lost baby owl needed help finding its family. ${name} used their new magic to light the way through the ${setting}!`,
            `The owl family was so grateful. The mother owl gave ${name} a shiny feather as a thank-you gift. ${name} felt proud!`,
            `"You are a wonderful wizard!" said the wizard. ${name} smiled - maybe one day they'll be a real wizard too!`
        ],
        fairy: [
            `${name} followed a glowing firefly into a tiny door in an old oak tree. Inside lived a friendly fairy who smiled at ${name}!`,
            `The fairy gave ${name} a pair of tiny wings and they flew together through the ${setting}, visiting flower friends and butterfly buddies!`,
            `Suddenly, it started to rain! The fairy used her magic to make a mushroom umbrella. ${name} stayed dry and happy!`,
            `When the rain stopped, a beautiful rainbow appeared. ${name} and the fairy made wishes on every color they could see!`,
            `"Come back whenever you want!" said the fairy. ${name} promised to visit soon. What a magical day!`
        ],
        mermaid: [
            `${name} found a magic seashell on the beach. When they held it to their ear, they heard singing - it was a friendly mermaid calling!`,
            `The mermaid took ${name} on a tour of her underwater kingdom. They met colorful fish, danced with dolphins, and said hello to a wise old sea turtle!`,
            `${name} discovered a shipwreck with treasure! The mermaid helped ${name} pick a shiny pearl to take home as a souvenir.`,
            `A friendly octopus showed ${name} how to juggle bubbles. ${name} laughed and laughed at the bubble games!`,
            `As the sun set, the mermaid gave ${name} a beautiful seashell necklace. "Now you'll always remember our adventure!" said the mermaid.`
        ],
        phoenix: [
            `${name} found a glowing egg in the forest. Suddenly it cracked open and a beautiful baby phoenix emerged! The phoenix chose ${name} as its friend!`,
            `The phoenix showed ${name} how to fly - well, they floated on magic feathers together through the ${setting}! It was amazing!`,
            `The phoenix lit up the sky with its warm glow. ${name} felt so happy and safe with their new magical friend.`,
            `Other animals came to say hello - a rabbit, a deer, and even a wise old owl. ${name} made so many new friends!`,
            `The phoenix gave ${name} a warm, glowing feather. "This will always remind you of our adventure," chirped the phoenix happily.`
        ],
        elf: [
            `${name} was playing in the forest when they met a tiny elf with a big smile! "Welcome to my home!" said the elf happily.`,
            `The elf took ${name} to see the magical tree house village in the ${setting}. Everything was made of candy and cookies!`,
            `${name} helped the elves plant magic seeds that grew into instant flowers. The elves cheered for ${name}'s helpful hands!`,
            `The elves invited ${name} to a party with music and dancing. Everyone had the most wonderful time together!`,
            `"You are our special friend now!" said the elf leader. ${name} hugged the elves goodbye. What an amazing day!`
        ],
        gryphon: [
            `${name} found a golden feather on the ground. Suddenly, a magnificent gryphon appeared - half lion, half eagle - and it wanted to be friends!`,
            `The gryphon offered to take ${name} for a flight through the ${setting}. They soared over mountains and dived through clouds together!`,
            `The gryphon showed ${name} its nest full of shiny treasures. ${name} picked a special crystal to remember their adventure.`,
            `Other magical creatures came to meet ${name} - a wise owl, a playful squirrel, and a rainbow butterfly. What a party!`,
            `"You are brave and kind," said the gryphon. ${name} smiled big. They'd never forget their gryphon friend!`
        ]
    };

    const creatureStories = stories[creature] || stories.dragon;
    const pages = [];

    for (let i = 0; i < pageCount; i++) {
        pages.push({
            text: creatureStories[i] || `${name} had another wonderful adventure in the ${setting}!`
        });
    }

    return { pages, creature, setting, name };
}

// Create simple pages from text fallback
function createSimplePages(content, pageCount) {
    // Split content into sentences and group into pages
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const pages = [];

    for (let i = 0; i < pageCount; i++) {
        const startIdx = Math.floor((sentences.length / pageCount) * i);
        const endIdx = Math.floor((sentences.length / pageCount) * (i + 1));
        const pageText = sentences.slice(startIdx, endIdx).join('. ').trim();

        pages.push({
            text: pageText + (pageText && !pageText.endsWith('.') ? '.' : '')
        });
    }

    // If not enough content, add placeholders
    while (pages.length < pageCount) {
        pages.push({ text: 'And then more magical things happened!' });
    }

    return pages;
}

// Generate images for each page
async function generateImages(story, setting, creature) {
    const imagePrompts = {
        dragon: 'cute friendly cartoon dragon with big eyes, smiling, colorful scales, children storybook illustration, soft pastel colors, magical background',
        unicorn: 'cute cartoon unicorn with rainbow mane, sparkly horn, big friendly eyes, fluffy clouds background, children storybook illustration, soft pastel colors',
        wizard: 'cute child wizard with starry robe and hat, holding magic wand, big friendly eyes, magical sparkles around, children book illustration, soft colors',
        fairy: 'cute cartoon fairy with butterfly wings, flower crown, smiling, sparkly dress, magical forest background, children storybook illustration',
        mermaid: 'cute cartoon mermaid with colorful scales, flowing hair, smiling, underwater scene with bubbles, children storybook illustration, soft blue colors',
        phoenix: 'beautiful cartoon phoenix bird with orange and gold feathers, glowing, friendly expression, magical flames, children illustration, soft warm colors',
        elf: 'cute cartoon forest elf with pointy ears, green outfit, smiling, in magical forest, children storybook illustration, soft green colors',
        gryphon: 'cute cartoon gryphon with lion body and eagle wings, friendly expression, big eyes, magical background, children illustration'
    };

    const basePrompt = imagePrompts[creature] || imagePrompts.dragon;

    // Add setting-specific background
    const settingBackgrounds = {
        'enchanted forest': 'enchanted magical forest with glowing trees and flowers',
        'magical castle': 'fairytale castle with towers and flags',
        'cloud kingdom': 'fluffy clouds and rainbow sky',
        'underwater palace': 'underwater palace with coral and fish',
        'dragon\'s mountain cave': 'mountain cave with crystals',
        'fairy village': 'tiny houses in magical village',
        'starry space realm': 'stars and planets in space',
        'ancient temple': 'ancient temple with pillars'
    };

    const background = settingBackgrounds[setting] || 'magical place';
    const apiKey = getApiKey();

    for (let i = 0; i < story.pages.length; i++) {
        const pageNum = i + 1;
        const prompt = `${basePrompt}, ${background}, page ${pageNum} of ${story.pages.length}, storybook illustration for children, Disney style, detailed, high quality`;

        // Generate image URL using Pollinations
        const encodedPrompt = encodeURIComponent(prompt);
        let imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=640&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

        // Add API key if provided
        if (apiKey) {
            imageUrl += `&key=${apiKey}`;
        }

        story.pages[i].imageUrl = imageUrl;

        // Preload image
        await preloadImage(story.pages[i].imageUrl);
    }
}

// Preload image helper
function preloadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Display a specific page
function displayPage(pageIndex) {
    if (!currentStory || !currentStory.pages[pageIndex]) return;

    const page = currentStory.pages[pageIndex];

    // Update page number
    elements.currentPageEl.textContent = pageIndex + 1;

    // Update text
    elements.storyText.innerHTML = `<p>${page.text}</p>`;

    // Update image
    if (page.imageUrl) {
        elements.storyImage.src = page.imageUrl;
        elements.storyImage.classList.remove('loaded');

        elements.storyImage.onload = () => {
            elements.storyImage.classList.add('loaded');
            elements.imagePlaceholder.classList.add('hidden');
        };

        elements.storyImage.onerror = () => {
            elements.imagePlaceholder.classList.remove('hidden');
            elements.imagePlaceholder.innerHTML = '<span>🖼️</span>';
        };
    }

    // Update navigation buttons
    elements.prevBtn.disabled = pageIndex === 0;
    elements.nextBtn.disabled = pageIndex === currentStory.pages.length - 1;

    // Add sparkle effect
    addSparkleEffect();
}

// Navigate pages
function navigatePage(direction) {
    const newPage = currentPage + direction;

    if (newPage >= 0 && newPage < currentStory.pages.length) {
        currentPage = newPage;
        displayPage(currentPage);
    }
}

// Add sparkle effect to story
function addSparkleEffect() {
    const container = document.querySelector('.illustration-container');
    if (!container) return;

    // Remove old sparkles
    document.querySelectorAll('.sparkle').forEach(s => s.remove());

    // Add new sparkles
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.background = ['#FFD700', '#FF69B4', '#00CED1', '#98FB98'][Math.floor(Math.random() * 4)];
            container.appendChild(sparkle);

            setTimeout(() => sparkle.remove(), 1000);
        }, i * 150);
    }
}

// Show specific section
function showSection(section) {
    elements.inputSection.classList.add('hidden');
    elements.loadingSection.classList.add('hidden');
    elements.storySection.classList.add('hidden');
    elements.errorSection.classList.add('hidden');

    switch (section) {
        case 'input':
            elements.inputSection.classList.remove('hidden');
            break;
        case 'loading':
            elements.loadingSection.classList.remove('hidden');
            break;
        case 'story':
            elements.storySection.classList.remove('hidden');
            break;
        case 'error':
            elements.errorSection.classList.remove('hidden');
            break;
    }
}

// Update progress bar
function updateProgress(percent) {
    elements.progressFill.style.width = percent + '%';
}

// Reset app to start
function resetApp() {
    currentStory = null;
    currentPage = 0;
    elements.storyForm.reset();
    elements.storyImage.classList.remove('loaded');
    elements.imagePlaceholder.classList.remove('hidden');
    elements.imagePlaceholder.innerHTML = '<span>🎨</span>';
    showSection('input');
}

// Format title
function formatTitle(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get API key from input or localStorage
function getApiKey() {
    const inputKey = elements.apiKey.value.trim();
    if (inputKey) {
        // Save to localStorage when user enters a key
        localStorage.setItem('pollinations_api_key', inputKey);
        return inputKey;
    }
    // Try to get from localStorage
    return localStorage.getItem('pollinations_api_key') || '';
}

// Initialize
function init() {
    // Load API key from localStorage if available
    const savedKey = localStorage.getItem('pollinations_api_key');
    if (savedKey) {
        elements.apiKey.value = savedKey;
    }
    showSection('input');
}

init();
