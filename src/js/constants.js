export const CHARACTER_KEYS = [...'abcdefghijklmnopqrstuvwxyz'];

export const NON_CHARACTER_KEYS = [
    'Tab',
    'Enter',
    'ArrowLeft',
    'ArrowUp',
    'ArrowRight',
    'ArrowDown',
    'Escape',
    'Backspace',
];

export const VALID_KEYS = CHARACTER_KEYS.concat(NON_CHARACTER_KEYS);

export const DIRECTIONS = {
    horizontal: 0,
    vertical: 1,
}

export const HINTS = {
    unused: 0,
    inWord: 1,
    inWordHorizontal: 3,
    inWordVertical: 5,
    inBoth: 7,
    correct: 8,
}

export const MODES = {
    easy: 0,
    normal: 1,
}