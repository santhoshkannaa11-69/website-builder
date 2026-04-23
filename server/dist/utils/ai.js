import openai from "../configs/openai.js";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const runAICompletion = async (messages, options = {}) => {
    // Check if API key is configured
    if (!process.env.AI_API_KEY) {
        console.warn("AI_API_KEY not found in environment variables. Using fallback template.");
        return generateFallbackWebsite(messages);
    }
    const model = options.model || "gpt-3.5-turbo";
    const retries = options.retries ?? 2;
    const timeoutMs = options.timeoutMs ?? 90000;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await Promise.race([
                openai.chat.completions.create({
                    model,
                    messages,
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("AI request timed out")), timeoutMs)),
            ]);
            const content = response?.choices?.[0]?.message?.content?.trim?.() || "";
            return content;
        }
        catch (error) {
            console.error(`AI attempt ${attempt + 1} failed:`, error);
            if (attempt === retries) {
                console.warn("All AI attempts failed. Using fallback template.");
                return generateFallbackWebsite(messages);
            }
            const backoffMs = 800 * (attempt + 1);
            await sleep(backoffMs);
        }
    }
    return generateFallbackWebsite(messages);
};
// Helper functions for advanced website generation
const detectWebsiteType = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('artist') || lowerMessage.includes('designer'))
        return 'Portfolio';
    if (lowerMessage.includes('ecommerce') || lowerMessage.includes('shop') || lowerMessage.includes('store'))
        return 'E-commerce';
    if (lowerMessage.includes('blog') || lowerMessage.includes('news') || lowerMessage.includes('article'))
        return 'Blog';
    if (lowerMessage.includes('restaurant') || lowerMessage.includes('food') || lowerMessage.includes('cafe'))
        return 'Restaurant';
    if (lowerMessage.includes('saas') || lowerMessage.includes('app') || lowerMessage.includes('software'))
        return 'SaaS';
    if (lowerMessage.includes('agency') || lowerMessage.includes('business') || lowerMessage.includes('company'))
        return 'Business';
    return 'General';
};
const detectWebsiteSize = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('large') || lowerMessage.includes('comprehensive') || lowerMessage.includes('complete') || lowerMessage.includes('full') || lowerMessage.includes('extensive')) {
        return 'large';
    }
    if (lowerMessage.includes('simple') || lowerMessage.includes('basic') || lowerMessage.includes('minimal') || lowerMessage.includes('small')) {
        return 'small';
    }
    return 'medium';
};
const selectTheme = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('dark') || lowerMessage.includes('black')) {
        return {
            bg: 'bg-gray-900',
            primary: 'text-blue-400',
            text: 'text-white',
            textSecondary: 'text-gray-300',
            button: 'from-blue-600 to-purple-600',
            border: 'border-blue-400',
            sectionBg: 'bg-gray-800',
            ctaBg: 'from-blue-600 to-purple-600',
            footerBg: 'bg-gray-900'
        };
    }
    if (lowerMessage.includes('green') || lowerMessage.includes('nature')) {
        return {
            bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
            primary: 'text-green-600',
            text: 'text-gray-800',
            textSecondary: 'text-gray-600',
            button: 'from-green-500 to-emerald-600',
            border: 'border-green-500',
            sectionBg: 'bg-white',
            ctaBg: 'from-green-600 to-emerald-700',
            footerBg: 'bg-gray-900'
        };
    }
    // Default blue theme
    return {
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
        primary: 'text-blue-600',
        text: 'text-gray-800',
        textSecondary: 'text-gray-600',
        button: 'from-blue-500 to-indigo-600',
        border: 'border-blue-500',
        sectionBg: 'bg-white',
        ctaBg: 'from-blue-600 to-indigo-700',
        footerBg: 'bg-gray-900'
    };
};
const generateTitle = (message) => {
    const words = message.split(' ').slice(0, 5);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Amazing Website';
};
const generateBrandName = (message) => {
    const lowerMessage = message.toLowerCase();
    // Extract brand name from user message if they mention one
    if (lowerMessage.includes('company called') || lowerMessage.includes('brand called') || lowerMessage.includes('name called')) {
        const match = message.match(/(?:called|named)\s+([A-Za-z][A-Za-z0-9\s]+)/i);
        if (match)
            return match[1].trim();
    }
    // Generate brand name based on website type
    const websiteType = detectWebsiteType(message);
    const brandNames = {
        'Portfolio': ['CreativeStudio', 'DesignHub', 'Artistry', 'PortfolioPro', 'VisualCraft'],
        'E-commerce': ['ShopMaster', 'MarketHub', 'StoreCraft', 'RetailPro', 'BuyZone'],
        'Blog': ['BlogSphere', 'WriteSpace', 'StoryHub', 'PostCraft', 'ContentFlow'],
        'Restaurant': ['FoodHub', 'TasteCraft', 'DiningPro', 'MenuMaster', 'FlavorSpot'],
        'SaaS': ['TechFlow', 'CloudSync', 'DataPro', 'SoftCraft', 'AppHub'],
        'Business': ['BusinessPro', 'CorpHub', 'Enterprise', 'TradeCraft', 'MarketSync'],
        'General': ['DigitalCraft', 'WebForge', 'PixelPerfect', 'CodeCraft', 'SmartBuild']
    };
    const names = brandNames[websiteType] || brandNames['General'];
    return names[Math.floor(Math.random() * names.length)];
};
const generateNavigation = (websiteType) => {
    const navItems = {
        'Portfolio': '<a href="#home" class="text-gray-700 hover:text-blue-600 transition">Home</a><a href="#portfolio" class="text-gray-700 hover:text-blue-600 transition">Portfolio</a><a href="#about" class="text-gray-700 hover:text-blue-600 transition">About</a><a href="#contact" class="text-gray-700 hover:text-blue-600 transition">Contact</a>',
        'E-commerce': '<a href="#home" class="text-gray-700 hover:text-blue-600 transition">Home</a><a href="#products" class="text-gray-700 hover:text-blue-600 transition">Products</a><a href="#deals" class="text-gray-700 hover:text-blue-600 transition">Deals</a><a href="#contact" class="text-gray-700 hover:text-blue-600 transition">Contact</a>',
        'Blog': '<a href="#home" class="text-gray-700 hover:text-blue-600 transition">Home</a><a href="#articles" class="text-gray-700 hover:text-blue-600 transition">Articles</a><a href="#categories" class="text-gray-700 hover:text-blue-600 transition">Categories</a><a href="#about" class="text-gray-700 hover:text-blue-600 transition">About</a>',
        'Restaurant': '<a href="#home" class="text-gray-700 hover:text-blue-600 transition">Home</a><a href="#menu" class="text-gray-700 hover:text-blue-600 transition">Menu</a><a href="#reservations" class="text-gray-700 hover:text-blue-600 transition">Reservations</a><a href="#contact" class="text-gray-700 hover:text-blue-600 transition">Contact</a>',
        'SaaS': '<a href="#home" class="text-gray-700 hover:text-blue-600 transition">Home</a><a href="#features" class="text-gray-700 hover:text-blue-600 transition">Features</a><a href="#pricing" class="text-gray-700 hover:text-blue-600 transition">Pricing</a><a href="#contact" class="text-gray-700 hover:text-blue-600 transition">Contact</a>',
        'Business': '<a href="#home" class="text-gray-700 hover:text-blue-600 transition">Home</a><a href="#services" class="text-gray-700 hover:text-blue-600 transition">Services</a><a href="#about" class="text-gray-700 hover:text-blue-600 transition">About</a><a href="#contact" class="text-gray-700 hover:text-blue-600 transition">Contact</a>',
        'General': '<a href="#home" class="text-gray-700 hover:text-blue-600 transition">Home</a><a href="#features" class="text-gray-700 hover:text-blue-600 transition">Features</a><a href="#about" class="text-gray-700 hover:text-blue-600 transition">About</a><a href="#contact" class="text-gray-700 hover:text-blue-600 transition">Contact</a>'
    };
    return navItems[websiteType] || navItems['General'];
};
const generateHeroTitle = (message, websiteType) => {
    const lowerMessage = message.toLowerCase();
    // Extract specific requirements from user message
    if (lowerMessage.includes('portfolio') && lowerMessage.includes('developer')) {
        return 'Showcase Your Development Projects';
    }
    if (lowerMessage.includes('portfolio') && lowerMessage.includes('artist')) {
        return 'Display Your Creative Portfolio';
    }
    if (lowerMessage.includes('shop') && lowerMessage.includes('clothes')) {
        return 'Discover Fashion & Style';
    }
    if (lowerMessage.includes('restaurant') && lowerMessage.includes('italian')) {
        return 'Experience Authentic Italian Cuisine';
    }
    if (lowerMessage.includes('blog') && lowerMessage.includes('tech')) {
        return 'Share Your Tech Insights';
    }
    if (lowerMessage.includes('saas') && lowerMessage.includes('crm')) {
        return 'Transform Your Customer Relationships';
    }
    // Dynamic title based on keywords
    const keywords = {
        'modern': 'Modern Digital Experience',
        'professional': 'Professional Business Solutions',
        'creative': 'Creative Digital Platform',
        'elegant': 'Elegant Online Presence',
        'powerful': 'Powerful Digital Tools',
        'innovative': 'Innovative Technology Platform'
    };
    for (const [keyword, title] of Object.entries(keywords)) {
        if (lowerMessage.includes(keyword)) {
            return title;
        }
    }
    // Fallback to website type titles
    const titles = {
        'Portfolio': 'Showcase Your Creative Work',
        'E-commerce': 'Discover Amazing Products',
        'Blog': 'Share Your Stories with the World',
        'Restaurant': 'Experience Culinary Excellence',
        'SaaS': 'Transform Your Business with Our Solutions',
        'Business': 'Building Tomorrow\'s Success Today',
        'General': 'Welcome to Your Digital Future'
    };
    return titles[websiteType] || titles['General'];
};
const generateHeroDescription = (message, websiteType) => {
    const lowerMessage = message.toLowerCase();
    // Extract specific requirements from user message
    if (lowerMessage.includes('portfolio') && lowerMessage.includes('developer')) {
        return 'Showcase your coding projects, GitHub contributions, and technical skills with a professional developer portfolio.';
    }
    if (lowerMessage.includes('portfolio') && lowerMessage.includes('artist')) {
        return 'Display your artwork, creative process, and artistic vision with a stunning portfolio designed for artists.';
    }
    if (lowerMessage.includes('shop') && lowerMessage.includes('clothes')) {
        return 'Browse our latest fashion collection, discover trending styles, and shop premium clothing with secure checkout.';
    }
    if (lowerMessage.includes('restaurant') && lowerMessage.includes('italian')) {
        return 'Experience authentic Italian cuisine, view our menu, make reservations, and discover our chef\'s specialties.';
    }
    if (lowerMessage.includes('blog') && lowerMessage.includes('tech')) {
        return 'Share your technical expertise, programming tutorials, and tech industry insights with our developer-focused blog platform.';
    }
    if (lowerMessage.includes('saas') && lowerMessage.includes('crm')) {
        return 'Manage customer relationships, track sales pipelines, and grow your business with our comprehensive CRM solution.';
    }
    // Dynamic description based on keywords
    if (lowerMessage.includes('minimal') || lowerMessage.includes('clean')) {
        return 'A clean, minimalist design that focuses on essential content and provides an elegant user experience.';
    }
    if (lowerMessage.includes('modern') || lowerMessage.includes('contemporary')) {
        return 'A cutting-edge modern website with the latest design trends and innovative user interactions.';
    }
    if (lowerMessage.includes('professional') || lowerMessage.includes('corporate')) {
        return 'A professional corporate website that builds credibility and establishes your brand authority.';
    }
    // Fallback to website type descriptions
    const descriptions = {
        'Portfolio': 'A stunning portfolio website that showcases your best work and attracts clients.',
        'E-commerce': 'A powerful e-commerce platform that drives sales and delights customers.',
        'Blog': 'A beautiful blog that engages readers and builds your community.',
        'Restaurant': 'An elegant restaurant website that makes reservations easy and appetizing.',
        'SaaS': 'A scalable SaaS platform that solves real business problems.',
        'Business': 'A professional business website that builds trust and drives growth.',
        'General': 'A modern website that represents your brand and connects with your audience.'
    };
    return descriptions[websiteType] || descriptions['General'];
};
const generateFeatures = (websiteType, theme) => {
    const features = {
        'Portfolio': `
            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2 ${theme.text}">Stunning Gallery</h3>
                <p class="${theme.textSecondary}">Beautiful image galleries with smooth transitions and professional layouts.</p>
            </div>
            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2 ${theme.text}">Lightning Fast</h3>
                <p class="${theme.textSecondary}">Optimized performance ensures your portfolio loads instantly on any device.</p>
            </div>
            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2 ${theme.text}">Mobile Responsive</h3>
                <p class="${theme.textSecondary}">Perfect display on all devices with responsive design and touch-friendly interface.</p>
            </div>`,
        'General': `
            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2 ${theme.text}">Lightning Fast</h3>
                <p class="${theme.textSecondary}">Optimized performance ensures your website loads instantly on any device.</p>
            </div>
            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2 ${theme.text}">Secure & Reliable</h3>
                <p class="${theme.textSecondary}">Built with security best practices and reliable infrastructure you can trust.</p>
            </div>
            <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2 ${theme.text}">Easy to Use</h3>
                <p class="${theme.textSecondary}">Intuitive design and user-friendly interface that anyone can navigate easily.</p>
            </div>`
    };
    return features[websiteType] || features['General'];
};
// Advanced fallback website generator that creates sophisticated websites
const generateFallbackWebsite = (messages) => {
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    const isRevision = messages.some(m => m.content.includes('current website code'));
    // Generate dynamic website based on user request
    const websiteType = detectWebsiteType(userMessage);
    const theme = selectTheme(userMessage);
    const websiteSize = detectWebsiteSize(userMessage);
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${generateTitle(userMessage)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }
        
        .flex { display: flex; }
        .grid { display: grid; }
        .hidden { display: none; }
        .block { display: block; }
        
        .flex-col { flex-direction: column; }
        .flex-row { flex-direction: row; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .space-x-4 > * + * { margin-left: 1rem; }
        .space-x-8 > * + * { margin-left: 2rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-y-8 > * + * { margin-top: 2rem; }
        
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }
        
        .p-2 { padding: 0.5rem; }
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .p-8 { padding: 2rem; }
        .p-12 { padding: 3rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .px-12 { padding-left: 3rem; padding-right: 3rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        
        .m-2 { margin: 0.5rem; }
        .m-4 { margin: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-16 { margin-bottom: 4rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-8 { margin-top: 2rem; }
        .mt-16 { margin-top: 4rem; }
        .mt-20 { margin-top: 5rem; }
        
        .w-full { width: 100%; }
        .max-w-4xl { max-width: 56rem; }
        .max-w-md { max-width: 28rem; }
        .h-6 { height: 1.5rem; }
        .h-12 { height: 3rem; }
        .min-h-screen { min-height: 100vh; }
        
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-3xl { font-size: 1.875rem; }
        .text-4xl { font-size: 2.25rem; }
        .text-5xl { font-size: 3rem; }
        .text-6xl { font-size: 3.75rem; }
        
        .font-light { font-weight: 300; }
        .font-normal { font-weight: 400; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
        
        .text-center { text-align: center; }
        .text-white { color: white; }
        .text-gray-400 { color: #9ca3af; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-700 { color: #374151; }
        .text-gray-800 { color: #1f2937; }
        .text-blue-400 { color: #60a5fa; }
        .text-blue-500 { color: #3b82f6; }
        .text-blue-600 { color: #2563eb; }
        .text-green-500 { color: #10b981; }
        .text-yellow-400 { color: #fbbf24; }
        
        .bg-white { background-color: white; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-gray-800 { background-color: #1f2937; }
        .bg-gray-900 { background-color: #111827; }
        .bg-blue-500 { background-color: #3b82f6; }
        .bg-blue-600 { background-color: #2563eb; }
        .bg-green-500 { background-color: #10b981; }
        .bg-green-600 { background-color: #059669; }
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(59 130 246 / 0)); }
        .from-blue-600 { --tw-gradient-from: #2563eb; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(37 99 235 / 0)); }
        .from-green-500 { --tw-gradient-from: #10b981; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(16 185 129 / 0)); }
        .from-green-600 { --tw-gradient-from: #059669; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(5 150 105 / 0)); }
        .to-indigo-600 { --tw-gradient-to: #4f46e5; }
        .to-purple-600 { --tw-gradient-to: #9333ea; }
        .to-emerald-600 { --tw-gradient-to: #059669; }
        .to-emerald-700 { --tw-gradient-to: #047857; }
        
        .border { border-width: 1px; }
        .border-2 { border-width: 2px; }
        .border-gray-300 { border-color: #d1d5db; }
        .border-blue-400 { border-color: #60a5fa; }
        .border-blue-500 { border-color: #3b82f6; }
        .border-green-500 { border-color: #10b981; }
        .border-t { border-top-width: 1px; }
        .border-gray-700 { border-color: #374151; }
        .border-gray-800 { border-color: #1f2937; }
        
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-3xl { border-radius: 1.5rem; }
        .rounded-full { border-radius: 9999px; }
        
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        
        .sticky { position: sticky; }
        .top-0 { top: 0; }
        .z-40 { z-index: 40; }
        .z-50 { z-index: 50; }
        .fixed { position: fixed; }
        .bottom-8 { bottom: 2rem; }
        .right-8 { right: 2rem; }
        
        .transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .duration-300 { transition-duration: 300ms; }
        
        .hover\:bg-gray-50:hover { background-color: #f9fafb; }
        .hover\:bg-white\/10:hover { background-color: rgba(255, 255, 255, 0.1); }
        .hover\:bg-gray-100:hover { background-color: #f3f4f6; }
        .hover\:text-blue-600:hover { color: #2563eb; }
        .hover\:text-white:hover { color: white; }
        .hover\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .hover\:shadow-xl:hover { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .hover\:scale-105:hover { transform: scale(1.05); }
        .hover\:scale-110:hover { transform: scale(1.1); }
        
        .focus\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
        .focus\:ring-2:focus { box-shadow: 0 0 0 2px var(--tw-ring-color); }
        .focus\:ring-blue-500:focus { --tw-ring-color: #3b82f6; }
        .focus\:ring-white:focus { --tw-ring-color: white; }
        
        .backdrop-blur { backdrop-filter: blur(8px); }
        .backdrop-blur-md { backdrop-filter: blur(12px); }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        .gradient-text { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
            background-clip: text;
        }
        
        .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
        .from-blue-50 { --tw-gradient-from: #eff6ff; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(239 246 255 / 0)); }
        .to-indigo-100 { --tw-gradient-to: #e0e7ff; }
        .from-green-50 { --tw-gradient-from: #f0fdf4; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(240 253 244 / 0)); }
        .to-emerald-100 { --tw-gradient-to: #d1fae5; }
        
        @media (min-width: 768px) {
            .md\\:flex { display: flex; }
            .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .md\\:hidden { display: none; }
            .md\\:flex-row { flex-direction: row; }
            .md\\:flex-col { flex-direction: column; }
            .md\\:text-6xl { font-size: 3.75rem; }
            .md\\:max-w-xs { max-width: 20rem; }
            .md\\:space-x-8 > * + * { margin-left: 2rem; }
        }
        
        @media (max-width: 767px) {
            .sm\\:flex-row { flex-direction: row; }
            .sm\\:flex-col { flex-direction: column; }
        }
        
        .transform { transform: translateX(0) translateY(0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1); }
        .scale-105 { transform: scale(1.05); }
        .transform:hover { transform: scale(1.05); }
    </style>
</head>
<body class="${theme.bg} min-h-screen">
    <!-- Navigation -->
    <nav class="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="text-2xl font-bold ${theme.primary}">${generateBrandName(userMessage)}</div>
                <div class="hidden md:flex space-x-8">
                    ${generateNavigation(websiteType)}
                </div>
                <div class="flex items-center space-x-4">
                    <button class="bg-gradient-to-r ${theme.button} text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        Get Started
                    </button>
                    <button onclick="toggleMobileMenu()" class="md:hidden text-gray-600 hover:text-gray-900">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <!-- Mobile Menu -->
            <div id="mobile-menu" class="hidden md:hidden mt-4 pb-4">
                <div class="flex flex-col space-y-2">
                    ${generateNavigation(websiteType).replace(/class="text-gray-700 hover:text-blue-600 transition"/g, 'class="block py-2 text-gray-700 hover:text-blue-600 transition"')}
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="container mx-auto px-6 py-20 text-center">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-5xl md:text-6xl font-bold ${theme.text} mb-6 leading-tight">
                ${generateHeroTitle(userMessage, websiteType)}
            </h1>
            <p class="text-xl ${theme.textSecondary} mb-8 leading-relaxed">
                ${generateHeroDescription(userMessage, websiteType)}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button class="bg-gradient-to-r ${theme.button} text-white px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold">
                    Start Free Trial
                </button>
                <button class="border-2 ${theme.border} ${theme.text} px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300 font-semibold">
                    View Demo
                </button>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="container mx-auto px-6 py-20">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold ${theme.text} mb-4">Why Choose Us</h2>
            <p class="text-xl ${theme.textSecondary}">Experience the difference with our cutting-edge solutions</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
            ${generateFeatures(websiteType, theme)}
        </div>
    </section>

    <!-- Stats Section -->
    <section class="${theme.sectionBg} py-20">
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-4 gap-8 text-center">
                <div class="p-6">
                    <div class="text-4xl font-bold ${theme.primary} mb-2">10K+</div>
                    <div class="${theme.text}">Happy Clients</div>
                </div>
                <div class="p-6">
                    <div class="text-4xl font-bold ${theme.primary} mb-2">500+</div>
                    <div class="${theme.text}">Projects Completed</div>
                </div>
                <div class="p-6">
                    <div class="text-4xl font-bold ${theme.primary} mb-2">24/7</div>
                    <div class="${theme.text}">Support Available</div>
                </div>
                <div class="p-6">
                    <div class="text-4xl font-bold ${theme.primary} mb-2">99.9%</div>
                    <div class="${theme.text}">Uptime Guarantee</div>
                </div>
            </div>
        </div>
    </section>

    ${websiteSize === 'large' ? `
    <!-- Testimonials Section -->
    <section class="container mx-auto px-6 py-20">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold ${theme.text} mb-4">What Our Clients Say</h2>
            <p class="text-xl ${theme.textSecondary}">Real feedback from real customers</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white rounded-2xl p-8 shadow-xl">
                <div class="flex mb-4">
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                </div>
                <p class="text-gray-600 mb-6">"Outstanding service and quality. They exceeded our expectations in every way."</p>
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-gradient-to-r ${theme.button} rounded-full flex items-center justify-center text-white font-bold mr-4">JD</div>
                    <div>
                        <div class="font-semibold text-gray-800">John Doe</div>
                        <div class="text-gray-500 text-sm">CEO, TechCorp</div>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-2xl p-8 shadow-xl">
                <div class="flex mb-4">
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                </div>
                <p class="text-gray-600 mb-6">"Professional team that delivers results. Highly recommend their services."</p>
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-gradient-to-r ${theme.button} rounded-full flex items-center justify-center text-white font-bold mr-4">SM</div>
                    <div>
                        <div class="font-semibold text-gray-800">Sarah Miller</div>
                        <div class="text-gray-500 text-sm">Marketing Director</div>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-2xl p-8 shadow-xl">
                <div class="flex mb-4">
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                    <i class="fas fa-star text-yellow-400"></i>
                </div>
                <p class="text-gray-600 mb-6">"Amazing experience from start to finish. They truly care about their clients."</p>
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-gradient-to-r ${theme.button} rounded-full flex items-center justify-center text-white font-bold mr-4">MJ</div>
                    <div>
                        <div class="font-semibold text-gray-800">Mike Johnson</div>
                        <div class="text-gray-500 text-sm">Startup Founder</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section class="${theme.sectionBg} py-20">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold ${theme.text} mb-4">Choose Your Plan</h2>
                <p class="text-xl ${theme.textSecondary}">Flexible pricing for businesses of all sizes</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">Starter</h3>
                    <div class="text-4xl font-bold ${theme.primary} mb-6">$29<span class="text-lg text-gray-500">/month</span></div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center text-gray-600"><i class="fas fa-check text-green-500 mr-3"></i>Basic Features</li>
                        <li class="flex items-center text-gray-600"><i class="fas fa-check text-green-500 mr-3"></i>5 Projects</li>
                        <li class="flex items-center text-gray-600"><i class="fas fa-check text-green-500 mr-3"></i>Email Support</li>
                    </ul>
                    <button class="w-full border-2 ${theme.border} ${theme.text} py-3 rounded-full hover:bg-gray-50 transition font-semibold">
                        Get Started
                    </button>
                </div>
                <div class="bg-gradient-to-br ${theme.button} rounded-2xl p-8 shadow-xl text-white transform scale-105">
                    <div class="bg-white/20 backdrop-blur rounded-full px-4 py-1 inline-block mb-4">Popular</div>
                    <h3 class="text-2xl font-bold mb-4">Professional</h3>
                    <div class="text-4xl font-bold mb-6">$99<span class="text-lg opacity-80">/month</span></div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center"><i class="fas fa-check text-white mr-3"></i>All Features</li>
                        <li class="flex items-center"><i class="fas fa-check text-white mr-3"></i>Unlimited Projects</li>
                        <li class="flex items-center"><i class="fas fa-check text-white mr-3"></i>Priority Support</li>
                        <li class="flex items-center"><i class="fas fa-check text-white mr-3"></i>Advanced Analytics</li>
                    </ul>
                    <button class="w-full bg-white text-gray-900 py-3 rounded-full hover:bg-gray-100 transition font-semibold">
                        Start Free Trial
                    </button>
                </div>
                <div class="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">Enterprise</h3>
                    <div class="text-4xl font-bold ${theme.primary} mb-6">$299<span class="text-lg text-gray-500">/month</span></div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center text-gray-600"><i class="fas fa-check text-green-500 mr-3"></i>Custom Solutions</li>
                        <li class="flex items-center text-gray-600"><i class="fas fa-check text-green-500 mr-3"></i>Dedicated Support</li>
                        <li class="flex items-center text-gray-600"><i class="fas fa-check text-green-500 mr-3"></i>SLA Guarantee</li>
                    </ul>
                    <button class="w-full border-2 ${theme.border} ${theme.text} py-3 rounded-full hover:bg-gray-50 transition font-semibold">
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Contact Section -->
    <section class="${theme.sectionBg} py-20">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold ${theme.text} mb-4">Get In Touch</h2>
                <p class="text-xl ${theme.textSecondary}">We'd love to hear from you. Send us a message!</p>
            </div>
            <div class="max-w-4xl mx-auto">
                <form id="contact-form" class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2" for="name">Name</label>
                            <input type="text" id="name" name="name" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your Name">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2" for="email">Email</label>
                            <input type="email" id="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@email.com">
                        </div>
                    </div>
                    <div class="mb-6">
                        <label class="block text-gray-700 font-semibold mb-2" for="subject">Subject</label>
                        <input type="text" id="subject" name="subject" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="How can we help?">
                    </div>
                    <div class="mb-6">
                        <label class="block text-gray-700 font-semibold mb-2" for="message">Message</label>
                        <textarea id="message" name="message" rows="5" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell us more about your project..."></textarea>
                    </div>
                    <button type="submit" class="w-full bg-gradient-to-r ${theme.button} text-white py-4 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    </section>

    <!-- Newsletter Section -->
    <section class="container mx-auto px-6 py-20 text-center">
        <div class="bg-gradient-to-r ${theme.ctaBg} rounded-3xl p-12 max-w-4xl mx-auto">
            <h2 class="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p class="text-white/90 mb-8 text-lg">Subscribe to our newsletter for the latest updates and offers</p>
            <form id="newsletter-form" class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input type="email" name="email" required class="flex-1 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white" placeholder="Enter your email">
                <button type="submit" class="bg-white text-gray-900 px-8 py-3 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold">
                    Subscribe
                </button>
            </form>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="container mx-auto px-6 py-20 text-center">
        <div class="bg-gradient-to-r ${theme.ctaBg} rounded-3xl p-12 max-w-4xl mx-auto">
            <h2 class="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p class="text-white/90 mb-8 text-lg">Join thousands of satisfied customers who have transformed their business</p>
            <button class="bg-white text-gray-900 px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold">
                Start Your Journey
            </button>
        </div>
    </section>

    <!-- Footer -->
    <footer class="${theme.footerBg} text-white py-12">
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-4 gap-8">
                <div>
                    <h3 class="text-xl font-bold mb-4">${generateBrandName(userMessage)}</h3>
                    <p class="text-gray-400">Making ${websiteType} simple and effective for everyone.</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Product</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="#" class="hover:text-white transition">Features</a></li>
                        <li><a href="#" class="hover:text-white transition">Pricing</a></li>
                        <li><a href="#" class="hover:text-white transition">Testimonials</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Company</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="#" class="hover:text-white transition">About</a></li>
                        <li><a href="#" class="hover:text-white transition">Blog</a></li>
                        <li><a href="#" class="hover:text-white transition">Careers</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Connect</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="#" class="hover:text-white transition">Twitter</a></li>
                        <li><a href="#" class="hover:text-white transition">LinkedIn</a></li>
                        <li><a href="#" class="hover:text-white transition">GitHub</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; <span data-year></span> ${generateBrandName(userMessage)}. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Scroll to Top Button -->
    <button id="scroll-top" onclick="scrollToTop()" class="hidden fixed bottom-8 right-8 bg-gradient-to-r ${theme.button} text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-40">
        <i class="fas fa-arrow-up"></i>
    </button>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Enhanced button interactions
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
        });

        // Add scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all sections for scroll animations
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });

        // Dynamic year in footer
        document.addEventListener('DOMContentLoaded', function() {
            const yearElements = document.querySelectorAll('[data-year]');
            const currentYear = new Date().getFullYear();
            yearElements.forEach(el => {
                el.textContent = currentYear;
            });
        });

        // Mobile menu toggle
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            if (menu) {
                menu.classList.toggle('hidden');
            }
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Form submission handler
        function handleFormSubmit(formId, successMessage) {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData);
                    
                    // Show success message
                    const alert = document.createElement('div');
                    alert.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                    alert.textContent = successMessage || 'Form submitted successfully!';
                    document.body.appendChild(alert);
                    
                    // Reset form
                    form.reset();
                    
                    // Remove alert after 3 seconds
                    setTimeout(() => {
                        alert.remove();
                    }, 3000);
                    
                    console.log('Form submitted:', data);
                });
            }
        }

        // Initialize forms
        handleFormSubmit('contact-form', 'Message sent successfully!');
        handleFormSubmit('newsletter-form', 'Subscribed to newsletter!');
        handleFormSubmit('reservation-form', 'Reservation request sent!');

        // Add hover effects to cards
        document.querySelectorAll('.hover-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Scroll to top button
        window.addEventListener('scroll', function() {
            const scrollTopBtn = document.getElementById('scroll-top');
            if (scrollTopBtn) {
                if (window.pageYOffset > 300) {
                    scrollTopBtn.classList.remove('hidden');
                } else {
                    scrollTopBtn.classList.add('hidden');
                }
            }
        });

        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    </script>
</body>
</html>`;
};
