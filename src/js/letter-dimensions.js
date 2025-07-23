export function generate_numbers_by_digits(digits) {
    const upper_limit = 10**digits;
    const numbers = [];
    for (let i = 0; i < upper_limit; i++) numbers.push(i);
    return numbers;
}

export const CAPITAL_LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
export const LOWERCASE_LETTERS = [...'abcdefghijklmnopqrstuvwxyz'];
export const NUMBERS = [...'0123456789'];
export const ALL_SINGLE_CHARACTERS = [...CAPITAL_LETTERS, ...LOWERCASE_LETTERS, ...NUMBERS];

const canvas = new OffscreenCanvas(128,128);
const context = canvas.getContext('2d', {alpha:false});
context.textBaseline = 'top';   // Makes the coordinate system for the font the top-left

export function get_letter_metrics(content, font, size) {
    context.font = `${size}px ${font}`;
    return context.measureText(content);
}

export function get_largest_content(font, size=64, characters=ALL_SINGLE_CHARACTERS) {
    return characters.reduce( (largest_content, content) => {
        const metrics = get_letter_metrics(content, font, size);
        const height = metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent;
        const width = metrics.width;
        if (width > largest_content.w) {
            largest_content.w = width;
        }
        if (height > largest_content.h) {
            largest_content.h = height;
        }
        return largest_content;
    }, {w: 0, h: 0} )
}
