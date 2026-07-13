// utils/countdownHelpers.js
export const getCountdownIcon = (icon) => {
  const map = {
    gift: "🎁",
    fire: "🔥",
    flash: "⚡",
    save: "💰",
    discount: "🏷️",
    bogo: "🎉",
    rocket: "🚀",
    star: "⭐",
    trophy: "🏆",
    gem: "💎",
    crown: "👑",
    cart: "🛍️",
    ribbon: "🎀",
    star2: "🌟",
    magic: "🪄",
    money: "💸",
    package: "📦",
    clover: "🍀",
    party: "🥳",
    dart: "🎯",
    clock: "⏳",
    sad: "😢",
    heart: "❤️",
  };

  return map[icon] || null;
};
