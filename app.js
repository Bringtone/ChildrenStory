// Fantasy Story Generator - Interactive Choose Your Own Adventure

// State
let currentStory = null;
let currentPageId = null;
let choiceHistory = [];
let isInteractive = true; // New interactive mode

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
    choicesContainer: document.getElementById('choices-container'),
    choiceIndicator: document.getElementById('choice-indicator'),
    storyNavigation: document.getElementById('story-navigation'),
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
    const apiKey = elements.apiKey.value.trim();

    if (!name) {
        alert('Please enter your name!');
        return;
    }

    if (!apiKey) {
        alert('Please enter your Pollinations API key!');
        elements.apiKey.focus();
        return;
    }

    // Show loading
    showSection('loading');
    updateProgress(20);

    try {
        // Generate interactive branching story
        const story = await generateInteractiveStory(name, creature, setting, apiKey);
        updateProgress(60);

        // Generate images for each page
        await generateImages(story, setting, creature);
        updateProgress(90);

        // Set up story display
        currentStory = story;
        currentPageId = 'start'; // Start from the beginning
        choiceHistory = [];

        // Update UI
        elements.storyTitle.textContent = `${name}'s ${formatTitle(creature)} Adventure`;

        // Display first page
        displayPage(currentPageId);
        updateProgress(100);

        setTimeout(() => {
            showSection('story');
        }, 500);

    } catch (error) {
        console.error('Error generating story:', error);
        showSection('error');
    }
}

// Generate Interactive Branching Story
async function generateInteractiveStory(name, creature, setting, apiKey) {
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

    const prompt = `Create a 3-5 page children's interactive fantasy story about ${name} and ${creatureNames[creature]} in ${setting}.

This is a CHOOSE YOUR OWN ADVENTURE story. Each page (except endings) should present 2-3 choices for the reader.

Format as JSON with this structure:
{
  "start": {
    "text": "Page 1 story text here...",
    "choices": [
      {"text": "Choice 1 text", "nextPage": "page2a", "imagePrompt": "image description for this branch"},
      {"text": "Choice 2 text", "nextPage": "page2b", "imagePrompt": "image description for this branch"}
    ]
  },
  "page2a": {
    "text": "Page 2A story text...",
    "choices": [
      {"text": "Choice to ending 1", "nextPage": "ending1", "imagePrompt": "..."},
      {"text": "Choice to page 3", "nextPage": "page3a", "imagePrompt": "..."}
    ]
  },
  "page2b": {...},
  "ending1": {"text": "Happy ending text!", "isEnding": true},
  "ending2": {...},
  ...
}

Rules:
- Each page text: 2-3 sentences (short for children ages 4-8)
- Include child's name "${name}" in each page
- Make stories magical and age-appropriate
- Create 3-5 different endings
- Each choice leads to a different path
- Use simple choice texts that children can understand (go left/right, talk to friend, etc.)

Output ONLY valid JSON, no other text.`;

    try {
        // Debug: Log API key presence
        console.log('API Key:', apiKey ? 'present' : 'missing');

        // Verify key is in request body
        const requestBody = {
            model: 'openai',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            seed: Math.floor(Math.random() * 10000),
            key: apiKey  // Add key directly to body
        };

        console.log('Request body includes key:', !!requestBody.key);

        if (!requestBody.key) {
            alert('API key is missing! Please enter your Pollinations API key.');
            return generateTemplateStory(name, creature, setting);
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
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const storyTree = JSON.parse(jsonMatch[0]);
                return {
                    tree: storyTree,
                    creature,
                    setting,
                    name
                };
            }
        } catch (e) {
            console.log('JSON parse failed, using fallback');
        }

        // Fallback to template-based story
        return generateTemplateStory(name, creature, setting);

    } catch (error) {
        console.error('Story generation error:', error);
        return generateTemplateStory(name, creature, setting);
    }
}

// Template-based branching story (fallback)
function generateTemplateStory(name, creature, setting) {
    const stories = getTemplateStory(name, creature, setting);
    return {
        tree: stories,
        creature,
        setting,
        name
    };
}

function getTemplateStory(name, creature, setting) {
    // Pre-defined branching templates
    return {
        "start": {
            "text": `One magical morning, ${name} discovered a hidden path in the ${setting}. As they walked further, they met ${getCreatureIntro(creature)} who was looking for help! "Will you help me?" asked the creature.`,
            "choices": [
                {"text": "Yes, I'll help you!", "nextPage": "help", "imagePrompt": "brave child helping magical creature in fantasy setting"},
                {"text": "First, tell me about yourself", "nextPage": "listen", "imagePrompt": "child listening to magical creature talking"}
            ]
        },
        "help": {
            "text": `${name} eagerly agreed to help! The creature smiled warmly. "Thank you, kind friend! I lost my magic gem somewhere in the ${setting}. Will you look for it with me?"`,
            "choices": [
                {"text": "Let's look near the big tree!", "nextPage": "tree", "imagePrompt": "child and creature searching near magical tree"},
                {"text": "Let's check the sparkling cave!", "nextPage": "cave", "imagePrompt": "child and creature exploring sparkling cave"}
            ]
        },
        "listen": {
            "text": `"I'm the guardian of the ${setting}," said the creature. "I was playing with my magic gem, but it rolled away! Can you help me find it?" ${name} nodded with a smile.`,
            "choices": [
                {"text": "I'll help you find it!", "nextPage": "help", "imagePrompt": "child promising to help magical creature"},
                {"text": "What does the gem look like?", "nextPage": "gem", "imagePrompt": "magical glowing gem illustration"}
            ]
        },
        "gem": {
            "text": `"It glows with rainbow colors and sparkles in the dark!" explained the creature. "It helps the ${setting} stay magical. Without it, the flowers might stop blooming!"`,
            "choices": [
                {"text": "Let's search the whole forest!", "nextPage": "search", "imagePrompt": "child and creature searching magical forest"},
                {"text": "I think I know where it might be", "nextPage": "help", "imagePrompt": "child pointing confidently"}
            ]
        },
        "search": {
            "text": `${name} and the creature searched high and low through the ${setting}. They looked under mushrooms, behind rocks, and in the burrows of friendly animals!`,
            "choices": [
                {"text": "Keep searching near the pond", "nextPage": "pond", "imagePrompt": "child searching near magical pond"},
                {"text": "Check the ancient ruins", "nextPage": "ruins", "imagePrompt": "child exploring ancient magical ruins"}
            ]
        },
        "tree": {
            "text": `${name} and the creature found a giant magical tree with glowing leaves! As they looked around, something sparkled at the base of the tree.`,
            "choices": [
                {"text": "Pick up the sparkling object!", "nextPage": "found_gem", "imagePrompt": "child discovering glowing gem"},
                {"text": "Ask the tree if it saw anything", "nextPage": "tree_spirit", "imagePrompt": "child talking to wise magical tree"}
            ]
        },
        "cave": {
            "text": `The cave was filled with crystals of every color! As they walked inside, they heard a tiny voice. "Hello! I found something shiny!" said a little fairy.`,
            "choices": [
                {"text": "Ask the fairy about the gem", "nextPage": "fairy_help", "imagePrompt": "child talking to tiny fairy"},
                {"text": "Look around the cave", "nextPage": "cave_inside", "imagePrompt": "child exploring crystal cave"}
            ]
        },
        "found_gem": {
            "text": `The rainbow gem! ${name} picked it up carefully. It pulsed with warm, magical light. "You found it!" cheered the creature. "You're a true hero!"`,
            "choices": [
                {"text": "Give the gem back to the creature", "nextPage": "ending_hero", "imagePrompt": "child returning gem to happy creature"}
            ]
        },
        "tree_spirit": {
            "text": `The tree rustled its leaves and spoke in a gentle voice. "The gem rolled toward the meadow where the butterflies play. Look there, kind one!"`,
            "choices": [
                {"text": "Go to the meadow!", "nextPage": "meadow", "imagePrompt": "child walking toward magical meadow"}
            ]
        },
        "meadow": {
            "text": `The meadow was filled with dancing butterflies of every color! In the center, sitting on a flower, was the rainbow gem, sparkling brightly!`,
            "choices": [
                {"text": "Carefully pick up the gem", "nextPage": "ending_hero", "imagePrompt": "child holding glowing rainbow gem"}
            ]
        },
        "pond": {
            "text": `The pond was magical - the water shimmered like liquid silver! Looking into it, ${name} saw a rainbow glow coming from beneath the water lilies.`,
            "choices": [
                {"text": "Reach into the water carefully", "nextPage": "ending_hero", "imagePrompt": "child reaching for gem in magical pond"},
                {"text": "Ask the fish for help", "nextPage": "fish_help", "imagePrompt": "child talking to colorful fish"}
            ]
        },
        "fish_help": {
            "text": `A friendly orange fish swam up. "The gem is safe! I'll bring it to you!" The fish dove down and returned with the rainbow gem in its mouth!`,
            "choices": [
                {"text": "Thank the fish and take the gem", "nextPage": "ending_friend", "imagePrompt": "child receiving gem from fish"}
            ]
        },
        "ruins": {
            "text": `The ancient ruins were covered in magical symbols. ${name} noticed a pedestal with a rainbow glow. "The gem is here!" they shouted happily.`,
            "choices": [
                {"text": "Take the gem from the pedestal", "nextPage": "ending_hero", "imagePrompt": "child finding gem in ancient ruins"}
            ]
        },
        "fairy_help": {
            "text": `"I saw something shiny roll by! It went toward the rainbow bridge!" said the friendly fairy. "I'll show you the way!"`,
            "choices": [
                {"text": "Follow the fairy!", "nextPage": "rainbow_bridge", "imagePrompt": "child following fairy on rainbow path"}
            ]
        },
        "rainbow_bridge": {
            "text": `The fairy led ${name} and the creature to a beautiful bridge made entirely of rainbows! In the middle lay the glowing magic gem.`,
            "choices": [
                {"text": "Cross the bridge together", "nextPage": "ending_hero", "imagePrompt": "child and creatures crossing rainbow bridge"}
            ]
        },
        "cave_inside": {
            "text": `Deeper in the cave, ${name} found a tunnel filled with glowing crystals. At the end, something rainbow-colored sparkled!`,
            "choices": [
                {"text": "Go toward the sparkles!", "nextPage": "ending_hero", "imagePrompt": "child finding treasure in crystal cave"}
            ]
        },
        "ending_hero": {
            "text": `The creature was overjoyed! "You found my magic gem! The ${setting} will stay beautiful forever because of you!" ${name} felt proud and warm inside. "Thank you for the adventure!" said ${name}. And they lived happily ever after! 🌟`,
            "isEnding": true,
            "endingType": "hero"
        },
        "ending_friend": {
            "text": `With the gem found, the ${setting} glowed with extra magic! ${name} had made wonderful new friends - the creature, the fish, and all the magical beings. "Come back anytime!" they all said. ${name} smiled, already looking forward to the next adventure! 🌈`,
            "isEnding": true,
            "endingType": "friendship"
        }
    };
}

function getCreatureIntro(creature) {
    const intros = {
        dragon: 'a friendly dragon with sparkling scales',
        unicorn: 'a beautiful unicorn with a rainbow mane',
        wizard: 'a kind young wizard with a glowing staff',
        fairy: 'a sweet fairy with glittering wings',
        mermaid: 'a lovely mermaid with colorful scales',
        phoenix: 'a warm phoenix with golden feathers',
        elf: 'a cheerful elf with a pointed hat',
        gryphon: 'a gentle gryphon with soft feathers'
    };
    return intros[creature] || 'a magical creature';
}

// Generate images for each page
async function generateImages(story, setting, creature) {
    const imagePrompts = {
        dragon: 'cute friendly cartoon dragon with big eyes, smiling, colorful scales, children storybook illustration, soft pastel colors',
        unicorn: 'cute cartoon unicorn with rainbow mane, sparkly horn, big friendly eyes, fluffy clouds background, children storybook illustration',
        wizard: 'cute child wizard with starry robe and hat, holding magic wand, magical sparkles around, children book illustration',
        fairy: 'cute cartoon fairy with butterfly wings, flower crown, smiling, sparkly dress, magical forest background',
        mermaid: 'cute cartoon mermaid with colorful scales, flowing hair, smiling, underwater with bubbles',
        phoenix: 'beautiful cartoon phoenix bird with orange and gold feathers, glowing, friendly expression',
        elf: 'cute cartoon forest elf with pointy ears, green outfit, smiling, in magical forest',
        gryphon: 'cute cartoon gryphon with lion body and eagle wings, friendly expression, big eyes'
    };

    const basePrompt = imagePrompts[creature] || imagePrompts.dragon;

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

    // Generate images for all pages in the story tree
    for (const [pageId, pageData] of Object.entries(story.tree)) {
        // Use provided imagePrompt from choices, or generate one from page text
        let prompt = pageData.imagePrompt || `${basePrompt}, ${background}, storybook illustration for children`;

        // If it's an ending, use a celebratory prompt
        if (pageData.isEnding) {
            prompt = `${basePrompt}, happy celebration, sparkles, children storybook illustration, joyful scene`;
        }

        const encodedPrompt = encodeURIComponent(prompt);
        let imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=640&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

        if (apiKey) {
            imageUrl += `&key=${apiKey}`;
        }

        story.tree[pageId].imageUrl = imageUrl;

        // Preload image
        await preloadImage(story.tree[pageId].imageUrl);
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
function displayPage(pageId) {
    if (!currentStory || !currentStory.tree[pageId]) return;

    const page = currentStory.tree[pageId];
    currentPageId = pageId;

    // Update page counter
    const totalVisited = choiceHistory.length + 1;
    elements.currentPageEl.textContent = totalVisited;
    elements.totalPagesEl.textContent = '? (adventure)';

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

    // Update choice indicator (show path)
    updateChoiceIndicator();

    // Show choices or ending
    if (page.isEnding) {
        showEnding(page);
    } else if (page.choices && page.choices.length > 0) {
        showChoices(page.choices);
        elements.storyNavigation.style.display = 'none';
    }

    // Add sparkle effect
    addSparkleEffect();
}

// Show choice buttons
function showChoices(choices) {
    elements.choicesContainer.innerHTML = '';

    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.innerHTML = `<span class="choice-number">${index + 1}</span> ${choice.text}`;
        button.addEventListener('click', () => makeChoice(choice));
        elements.choicesContainer.appendChild(button);
    });
}

// Make a choice and navigate to next page
function makeChoice(choice) {
    choiceHistory.push({
        fromPage: currentPageId,
        choiceText: choice.text,
        toPage: choice.nextPage
    });

    displayPage(choice.nextPage);
}

// Show ending
function showEnding(page) {
    elements.choicesContainer.innerHTML = '';

    // Add celebration message
    const endingMessage = document.createElement('div');
    endingMessage.className = 'ending-message';

    const endings = {
        'hero': '🏆 You were a brave hero!',
        'friendship': '💖 You made wonderful friends!',
        'magic': '✨ You discovered real magic!',
        'default': '🎉 What an amazing adventure!'
    };

    endingMessage.innerHTML = `<h3>${endings[page.endingType] || endings.default}</h3>`;
    elements.choicesContainer.appendChild(endingMessage);

    // Add confetti effect
    addConfetti();
}

// Update choice indicator showing path
function updateChoiceIndicator() {
    if (choiceHistory.length === 0) {
        elements.choiceIndicator.innerHTML = '<span class="path-dot"></span>';
        return;
    }

    let html = '';
    choiceHistory.forEach((choice, index) => {
        html += `<span class="path-dot"></span><span class="path-line"></span>`;
    });
    html += '<span class="path-dot current"></span>';
    elements.choiceIndicator.innerHTML = html;
}

// Navigate pages (for fallback mode)
function navigatePage(direction) {
    // In interactive mode, this is less relevant
    // Could implement history-based navigation
}

// Add sparkle effect to story
function addSparkleEffect() {
    const container = document.querySelector('.illustration-container');
    if (!container) return;

    document.querySelectorAll('.sparkle').forEach(s => s.remove());

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

// Add confetti effect for endings
function addConfetti() {
    const colors = ['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#FF6347', '#9370DB'];

    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }, i * 100);
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
    currentPageId = null;
    choiceHistory = [];
    elements.storyForm.reset();
    elements.storyImage.classList.remove('loaded');
    elements.imagePlaceholder.classList.remove('hidden');
    elements.imagePlaceholder.innerHTML = '<span>🎨</span>';
    elements.choicesContainer.innerHTML = '';
    elements.storyNavigation.style.display = 'flex';
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
        localStorage.setItem('pollinations_api_key', inputKey);
        return inputKey;
    }
    return localStorage.getItem('pollinations_api_key') || '';
}

// Initialize
function init() {
    const savedKey = localStorage.getItem('pollinations_api_key');
    if (savedKey) {
        elements.apiKey.value = savedKey;
    }
    showSection('input');
}

init();
