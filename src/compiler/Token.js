/**
 * Token class representing a lexical token
 */
class Token {
  constructor(type, lexeme, value, line, column) {
    this.type = type;        // Token type (KEYWORD, IDENTIFIER, NUMBER, etc.)
    this.lexeme = lexeme;    // The actual text from source code
    this.value = value;      // Processed value (for numbers, strings, etc.)
    this.line = line;        // Line number in source code
    this.column = column;    // Column number in source code
  }

  toString() {
    return `Token(${this.type}, "${this.lexeme}", ${this.value}, Line: ${this.line}, Col: ${this.column})`;
  }
}

export default Token;
