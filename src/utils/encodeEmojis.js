import * as emoji from "github-emoji";

export function encodeEmojis(text) {
  return text
    ? text.replace(/:(\w+):/g, (emojiString, emojiName) => {
        try {
          return emoji.stringOf(emojiName);
        } catch (e) {
          return emojiString;
        }
      })
    : null;
}
