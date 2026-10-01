export type Card = { id: string; title: string; author: string; template: string; templateAuthor: string; items: string[]; kind: 'template' | 'list' };
const topics = [
 ['Italian food', '🍝 🍕 🥖 🧀 🥗 🍅'], ['Movie night', '🎬 🍿 🚀 👻 🎭 🕵️'],
 ['The best little things', '☕ 🌻 📚 🎧 🌅 🐈'], ['Weekend plans', '🚲 🏕️ 🎨 🎮 🏖️ 🛶'],
 ['Fruit bowl', '🍓 🍊 🍋 🥝 🫐 🍇'], ['Dream garage', '🚗 🏎️ 🚙 🛻 🚕 🚌'],
 ['Comfort food', '🍜 🥟 🍔 🥞 🥔 🍪'], ['Animal kingdom', '🦊 🐻 🐼 🐸 🐧 🦋'],
 ['On the bookshelf', '📕 📗 📘 📙 📓 📔'], ['A perfect breakfast', '🥐 🥚 🥑 🥯 🧇 🥓']
];
export const templates: Card[] = topics.map(([title, items], i) => ({ id: String(i + 1), title, author: ['Juniper', 'Milo', 'Mourning Dove'][i % 3], template: title, templateAuthor: ['Juniper', 'Milo', 'Mourning Dove'][i % 3], items: items.split(' '), kind: 'template' }));
export const lists: Card[] = templates.map((card, i) => ({ ...card, id: 'list-' + card.id, title: ['My definitive ranking', 'A few strong opinions', 'Hear me out'][i % 3] + ': ' + card.title.toLowerCase(), author: 'Mourning Dove', kind: 'list' }));
export const friends = ['Alex', 'Bea', 'Cameron', 'Devon', 'Ellis', 'Juniper', 'Milo', 'Robin', 'Sam'];
