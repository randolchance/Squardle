export function generate_numbers_by_digits(digits) {
    const upper_limit = 10**digits;
    const lower_limit = 10**(digits-1);
    const numbers = [];
    for (let i = lower_limit; i < upper_limit; i++) numbers.push(i);
    return numbers;
}

export const CAPITAL_LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
export const LOWERCASE_LETTERS = [...'abcdefghijklmnopqrstuvwxyz'];
export const NUMBERS = [...'0123456789'];
export const ALL_SINGLE_CHARACTERS = [...CAPITAL_LETTERS, ...LOWERCASE_LETTERS, ...NUMBERS];

export function get_largest_content(font, size=64, characters=ALL_SINGLE_CHARACTERS) {
    const letterCanvas = new OffscreenCanvas(64,64);
    const context = letterCanvas.getContext('2d', {alpha:false});
    context.font = `${size}px ${font}`;

    return characters.reduce( (largest_content, content) => {
        const metrics = context.measureText(content);
        const height = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent;
        const width = metrics.width;
        if (width > largest_content.size.w || height > largest_content.size.h) {
            largest_content.size.w = width;
            largest_content.size.h = height;
            largest_content.content = content;
        }
        return largest_content;
    }, {size: {w: 0, h: 0}, content: null} )
}
