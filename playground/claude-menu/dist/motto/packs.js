// ─── Built-in motto packs ───────────────────────────────────────────────────
// Each pack is a named array of mottos. Users can reference by name in config.
export const MOTTO_PACKS = [
    {
        name: 'motivational-en',
        description: 'Motivational English mottos for the grind',
        mottos: [
            '🚀 Ship it!',
            '💡 Build something great',
            '🔥 Stay hungry, stay foolish',
            '⚡ Move fast, break nothing',
            '🎯 Focus and deliver',
            '🌟 Make it happen',
            '💪 Push through the hard parts',
        ],
    },
    {
        name: 'chill-zh',
        description: '中文佛系座右铭',
        mottos: [
            '🐱 在家躺平 补觉充电',
            '🍵 慢慢来 比较快',
            '🌸 今天也要好好吃饭',
            '🎋 心静自然凉',
            '🐼 摸鱼是一种艺术',
            '🌙 早点下班 早点回家',
            '☁️ 不急不躁 稳中求进',
        ],
    },
    {
        name: 'dev-humor',
        description: 'Developer humor and inside jokes',
        mottos: [
            '🐛 It works on my machine™',
            '☕ Powered by caffeine',
            '🔧 Have you tried turning it off and on again?',
            '📦 node_modules weighs more than the sun',
            '🤖 I for one welcome our AI overlords',
            '🎭 git commit -m "fixed it for real this time"',
            '🍝 Spaghetti code al dente',
        ],
    },
    {
        name: 'zen',
        description: 'Zen and mindfulness reminders',
        mottos: [
            '🧘 Breathe. Code. Repeat.',
            '🌊 Flow state loading...',
            '🍃 Simple is beautiful',
            '🕯️ One thing at a time',
            '🌅 Begin again',
            '🪷 Less is more',
            '🎐 Enjoy the process',
        ],
    },
    {
        name: 'startup-energy',
        description: 'Y Combinator / startup vibes',
        mottos: [
            '🦄 0 to 1',
            '📈 Growth mindset activated',
            '🏗️ Building in public',
            '💰 Revenue is a feature',
            '🎪 Demo day ready',
            '🌍 Think global, ship local',
            '⏱️ Time to market matters',
        ],
    },
];
export function getPackByName(name) {
    return MOTTO_PACKS.find(p => p.name === name);
}
export function getAllPackNames() {
    return MOTTO_PACKS.map(p => p.name);
}
//# sourceMappingURL=packs.js.map