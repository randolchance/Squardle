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

export const DIRECTIONS = {
    horizontal: 0,
    vertical: 1,
}

export const HINTS = {
    unused: 0,
    inWord: 1,
    inWordHorizontal: 2,
    inWordVertical: 3,
    correct: 4,
}