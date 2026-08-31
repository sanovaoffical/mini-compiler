import Token from './Token.js';

/**
 * Lexical Analyzer (Lexer)
 * Converts source code into a stream of tokens
 */
class Lexer {
  constructor(source) {
    this.source = source;
    this.tokens = [];
    this.errors = [];
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.start = 0;  // Start position of current token
    this.startColumn = 1;  // Start column of current token
  }

  // Keywords in the mini language
  static KEYWORDS = {
    'int': 'KEYWORD',
    'float': 'KEYWORD',
    'string': 'KEYWORD',
    'char': 'KEYWORD',
    'boolean': 'KEYWORD',
    'if': 'KEYWORD',
    'else': 'KEYWORD',
    'while': 'KEYWORD',
    'true': 'BOOLEAN_LITERAL',
    'false': 'BOOLEAN_LITERAL'
  };

  /**
   * Main tokenization method
   * Scans entire source and generates tokens
   */
  tokenize() {
    while (this.position < this.source.length) {
      this.start = this.position;
      this.startColumn = this.column;
      this.scanToken();
    }

    this.tokens.push(new Token('EOF', '', null, this.line, this.column));
    return {
      tokens: this.tokens,
      errors: this.errors,
      success: this.errors.length === 0
    };
  }

  /**
   * Scan a single token
   */
  scanToken() {
    const char = this.current();

    // Whitespace
    if (char === ' ' || char === '\t' || char === '\r') {
      this.advance();
      return;
    }

    // Newline
    if (char === '\n') {
      this.advance();
      this.line++;
      this.column = 1;
      return;
    }

    // Comments
    if (char === '/' && this.peek() === '/') {
      this.skipLineComment();
      return;
    }

    if (char === '/' && this.peek() === '*') {
      this.skipBlockComment();
      return;
    }

    // String literals
    if (char === '"') {
      this.scanString();
      return;
    }

    // Character literals
    if (char === "'") {
      this.scanChar();
      return;
    }

    // Numbers
    if (this.isDigit(char)) {
      this.scanNumber();
      return;
    }

    // Identifiers and keywords
    if (this.isAlpha(char)) {
      this.scanIdentifier();
      return;
    }

    // Operators and separators
    switch (char) {
      case '=': {
        if (this.peek() === '=') {
          this.addToken('OPERATOR', '==', '==');
          this.advance();
          this.advance();
        } else {
          this.addToken('ASSIGNMENT', '=', '=');
          this.advance();
        }
        break;
      }
      case '!': {
        if (this.peek() === '=') {
          this.addToken('OPERATOR', '!=', '!=');
          this.advance();
          this.advance();
        } else {
          this.addLexicalError(`Unexpected character '${char}'`);
          this.advance();
        }
        break;
      }
      case '<': {
        if (this.peek() === '=') {
          this.addToken('OPERATOR', '<=', '<=');
          this.advance();
          this.advance();
        } else {
          this.addToken('OPERATOR', '<', '<');
          this.advance();
        }
        break;
      }
      case '>': {
        if (this.peek() === '=') {
          this.addToken('OPERATOR', '>=', '>=');
          this.advance();
          this.advance();
        } else {
          this.addToken('OPERATOR', '>', '>');
          this.advance();
        }
        break;
      }
      case '+': {
        this.addToken('OPERATOR', '+', '+');
        this.advance();
        break;
      }
      case '-': {
        this.addToken('OPERATOR', '-', '-');
        this.advance();
        break;
      }
      case '*': {
        this.addToken('OPERATOR', '*', '*');
        this.advance();
        break;
      }
      case '/': {
        this.addToken('OPERATOR', '/', '/');
        this.advance();
        break;
      }
      case '%': {
        this.addToken('OPERATOR', '%', '%');
        this.advance();
        break;
      }
      case '(': {
        this.addToken('PARENTHESIS', '(', '(');
        this.advance();
        break;
      }
      case ')': {
        this.addToken('PARENTHESIS', ')', ')');
        this.advance();
        break;
      }
      case '{': {
        this.addToken('BRACE', '{', '{');
        this.advance();
        break;
      }
      case '}': {
        this.addToken('BRACE', '}', '}');
        this.advance();
        break;
      }
      case ';': {
        this.addToken('SEPARATOR', ';', ';');
        this.advance();
        break;
      }
      default: {
        this.addLexicalError(`Unexpected character '${char}'`);
        this.advance();
      }
    }
  }

  /**
   * Scan a string literal
   */
  scanString() {
    const startLine = this.line;
    const startCol = this.column;
    this.advance(); // Opening quote
    let value = '';

    while (this.position < this.source.length && this.current() !== '"') {
      if (this.current() === '\n') {
        this.line++;
        this.column = 1;
      }
      if (this.current() === '\\' && this.peek() === '"') {
        value += '"';
        this.advance();
        this.advance();
      } else {
        value += this.current();
        this.advance();
      }
    }

    if (this.position >= this.source.length) {
      this.addLexicalError(`Unterminated string starting at Line ${startLine}, Column ${startCol}`);
      return;
    }

    this.advance(); // Closing quote
    this.addToken('STRING_LITERAL', `"${value}"`, value);
  }

  /**
   * Scan a character literal
   */
  scanChar() {
    const startLine = this.line;
    const startCol = this.column;
    this.advance(); // Opening quote

    if (this.position >= this.source.length) {
      this.addLexicalError(`Unterminated character literal at Line ${startLine}, Column ${startCol}`);
      return;
    }

    let value = this.current();
    this.advance();

    if (this.current() !== "'") {
      this.addLexicalError(`Unterminated character literal at Line ${startLine}, Column ${startCol}`);
      return;
    }

    this.advance(); // Closing quote
    this.addToken('CHAR_LITERAL', `'${value}'`, value);
  }

  /**
   * Scan a number (integer or float)
   */
  scanNumber() {
    let value = '';

    while (this.position < this.source.length && this.isDigit(this.current())) {
      value += this.current();
      this.advance();
    }

    // Check for decimal point
    if (this.current() === '.' && this.isDigit(this.peek())) {
      value += this.current();
      this.advance();

      while (this.position < this.source.length && this.isDigit(this.current())) {
        value += this.current();
        this.advance();
      }

      this.addToken('NUMBER', value, parseFloat(value));
    } else {
      this.addToken('NUMBER', value, parseInt(value, 10));
    }
  }

  /**
   * Scan an identifier or keyword
   */
  scanIdentifier() {
    let value = '';

    while (this.position < this.source.length &&
           (this.isAlphaNumeric(this.current()) || this.current() === '_')) {
      value += this.current();
      this.advance();
    }

    // Check if it's a keyword
    const type = Lexer.KEYWORDS[value] || 'IDENTIFIER';
    const tokenValue = (type === 'BOOLEAN_LITERAL') ? (value === 'true') : value;
    this.addToken(type, value, tokenValue);
  }

  /**
   * Skip a line comment
   */
  skipLineComment() {
    while (this.position < this.source.length && this.current() !== '\n') {
      this.advance();
    }
  }

  /**
   * Skip a block comment
   */
  skipBlockComment() {
    this.advance(); // /
    this.advance(); // *

    while (this.position < this.source.length) {
      if (this.current() === '*' && this.peek() === '/') {
        this.advance();
        this.advance();
        return;
      }
      if (this.current() === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.advance();
      }
    }
  }

  /**
   * Get current character without advancing
   */
  current() {
    if (this.position >= this.source.length) return '\0';
    return this.source[this.position];
  }

  /**
   * Peek at next character without advancing
   */
  peek() {
    if (this.position + 1 >= this.source.length) return '\0';
    return this.source[this.position + 1];
  }

  /**
   * Advance to next character
   */
  advance() {
    if (this.position < this.source.length) {
      this.position++;
      this.column++;
    }
  }

  /**
   * Check if character is a digit
   */
  isDigit(char) {
    return char >= '0' && char <= '9';
  }

  /**
   * Check if character is alphabetic
   */
  isAlpha(char) {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
           char === '_';
  }

  /**
   * Check if character is alphanumeric
   */
  isAlphaNumeric(char) {
    return this.isAlpha(char) || this.isDigit(char);
  }

  /**
   * Add a token to the tokens list
   */
  addToken(type, lexeme, value) {
    this.tokens.push(new Token(type, lexeme, value, this.line, this.startColumn));
  }

  /**
   * Add a lexical error
   */
  addLexicalError(message) {
    this.errors.push({
      type: 'LEXICAL_ERROR',
      message: message,
      line: this.line,
      column: this.column
    });
  }
}

export default Lexer;
