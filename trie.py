def groupWordsByLetter(words_list):
    words_dict = {}
    while len(words_list):
        word = words_list.pop()

        letter = word[0]
        word_remainder = word[1:]

        word_list = words_dict.get(letter, [])
        if word_remainder: word_list.append(word_remainder)

        words_dict[letter] = word_list

    return words_dict

class Trie(object):
    def __init__(self, words_list=[]):
        self.is_end_of_word = False
        self.words = {}
        if words_list: self.addWords(words_list)

    def __repr__(self):
        return repr(self.words)

    def __len__(self):
        return len(self.words)
    
    def __iter__(self):
        if len(self) == 0:
            yield ''
            return
        
        for letter, word_endings in self.words.items():
            if len(word_endings) == 0:
                yield letter

            else:
                for word_ending in word_endings:
                    yield letter + word_ending

    def toDict(self):
        words_dict = {}
        for letter, trie in self.words.items():
            words_dict[letter] = trie.toDict()

        return words_dict

    def addWords(self, words):
        if not words:
            self.is_end_of_word = True

        parsed_words = None
        match words:
            case list():
                parsed_words = groupWordsByLetter(words)
            case dict():
                parsed_words = words
            
        if parsed_words is None:
            raise Exception(f"words must be a list or a dict! Given {type(words)}")

        for letter, word_remainders in parsed_words.items():
            trie = self.words.get(letter, Trie())
            self.words[letter] = trie.addWords(word_remainders)

        return self

    def getWords(self, word_part):
        trie = self
        word_start = ''
        while word_part:
            letter = word_part[0]
            word_start += letter
            trie = trie.words.get(letter)

            word_part = word_part[1:]

            if not trie and word_part:
                break

        else:
            if trie is not None:
                for word_ending in trie:
                    yield word_start + word_ending