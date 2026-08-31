import ASTNode from './AST.js';
import Token from './Token.js';

/**
 * Recursive Descent Parser
 * Converts token stream into Abstract Syntax Tree
 */
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
    this.errors = [];
    this.ast = [];
  }

  /**
   * Main parsing method
   * Parses a complete program
   */
  parse() {
    const statements = [];

    while (!this.isAtEnd() && this.peek().type !== 'EOF') {
      try {
        const stmt = this.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
      } catch (error) {
        this.synchronize();
      }
    }

    return {
      ast: statements,
      errors: this.errors,
      success: this.errors.length === 0
    };
  }

  /**
   * Parse a single statement
   */
  parseStatement() {
    // Variable declaration
    if (this.check('KEYWORD') && this.isDataType(this.peek().lexeme)) {
      return this.parseVariableDeclaration();
    }

    // If statement
    if (this.match('KEYWORD', 'if')) {
      return this.parseIfStatement();
    }

    // While statement
    if (this.match('KEYWORD', 'while')) {
      return this.parseWhileStatement();
    }

    // Assignment or expression statement
    if (this.check('IDENTIFIER')) {
      return this.parseExpressionStatement();
    }

    // Block statement
    if (this.check('BRACE', '{')) {
      return this.parseBlockStatement();
    }

    if (!this.isAtEnd() && this.peek().type !== 'EOF') {
      this.error(`Unexpected token '${this.peek().lexeme}'`, this.peek());
      this.advance();
    }

    return null;
  }

  /**
   * Parse variable declaration
   * Type IDENTIFIER [= Expression] ;
   */
  parseVariableDeclaration() {
    const dataType = this.advance();

    if (!this.check('IDENTIFIER')) {
      this.error('Expected identifier after data type', this.peek());
      return null;
    }

    const identifier = this.advance();
    let value = null;

    if (this.match('ASSIGNMENT', '=')) {
      value = this.parseExpression();
    }

    if (!this.match('SEPARATOR', ';')) {
      this.error("Expected ';' after variable declaration", this.peek());
    }

    return new ASTNode('VariableDeclaration', {
      dataType: dataType.lexeme,
      identifier: identifier.lexeme,
      value: value,
      line: dataType.line,
      column: dataType.column
    });
  }

  /**
   * Parse assignment or expression statement
   * IDENTIFIER = Expression ;
   */
  parseExpressionStatement() {
    const identifier = this.advance();

    if (this.match('ASSIGNMENT', '=')) {
      const value = this.parseExpression();

      if (!this.match('SEPARATOR', ';')) {
        this.error("Expected ';' after assignment", this.peek());
      }

      return new ASTNode('Assignment', {
        identifier: identifier.lexeme,
        value: value,
        line: identifier.line,
        column: identifier.column
      });
    }

    this.error(`Expected '=' after identifier '${identifier.lexeme}'`, this.peek());
    return null;
  }

  /**
   * Parse if statement
   * if (Expression) Block [else Block]
   */
  parseIfStatement() {
    const ifToken = this.previous();

    if (!this.match('PARENTHESIS', '(')) {
      this.error("Expected '(' after 'if'", this.peek());
      return null;
    }

    const condition = this.parseExpression();

    if (!this.match('PARENTHESIS', ')')) {
      this.error("Expected ')' after if condition", this.peek());
    }

    const thenBranch = this.parseBlockStatement();
    let elseBranch = null;

    if (this.match('KEYWORD', 'else')) {
      elseBranch = this.parseBlockStatement();
    }

    return new ASTNode('IfStatement', {
      condition: condition,
      thenBranch: thenBranch,
      elseBranch: elseBranch,
      line: ifToken.line,
      column: ifToken.column
    });
  }

  /**
   * Parse while statement
   * while (Expression) Block
   */
  parseWhileStatement() {
    const whileToken = this.previous();

    if (!this.match('PARENTHESIS', '(')) {
      this.error("Expected '(' after 'while'", this.peek());
      return null;
    }

    const condition = this.parseExpression();

    if (!this.match('PARENTHESIS', ')')) {
      this.error("Expected ')' after while condition", this.peek());
    }

    const body = this.parseBlockStatement();

    return new ASTNode('WhileStatement', {
      condition: condition,
      body: body,
      line: whileToken.line,
      column: whileToken.column
    });
  }

  /**
   * Parse block statement
   * { Statement* }
   */
  parseBlockStatement() {
    if (!this.match('BRACE', '{')) {
      this.error("Expected '{' to start block", this.peek());
      return null;
    }

    const statements = [];

    while (!this.check('BRACE', '}') && !this.isAtEnd()) {
      try {
        const stmt = this.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
      } catch (error) {
        this.synchronize();
      }
    }

    if (!this.match('BRACE', '}')) {
      this.error("Expected '}' to end block", this.peek());
    }

    return new ASTNode('BlockStatement', {
      statements: statements
    });
  }

  /**
   * Parse expression
   * Handles comparison operators
   */
  parseExpression() {
    return this.parseComparison();
  }

  /**
   * Parse comparison
   * Comparison → Addition ((==|!=|>|>=|<|<=) Addition)*
   */
  parseComparison() {
    let expr = this.parseAddition();

    while (this.check('OPERATOR') && this.isComparisonOp(this.peek().lexeme)) {
      const op = this.advance();
      const right = this.parseAddition();
      expr = new ASTNode('BinaryOp', {
        operator: op.lexeme,
        left: expr,
        right: right,
        line: op.line,
        column: op.column
      });
    }

    return expr;
  }

  /**
   * Parse addition and subtraction
   * Addition → Multiplication ((+|-) Multiplication)*
   */
  parseAddition() {
    let expr = this.parseMultiplication();

    while (this.match('OPERATOR', '+') || this.match('OPERATOR', '-')) {
      const op = this.previous();
      const right = this.parseMultiplication();
      expr = new ASTNode('BinaryOp', {
        operator: op.lexeme,
        left: expr,
        right: right,
        line: op.line,
        column: op.column
      });
    }

    return expr;
  }

  /**
   * Parse multiplication, division, and modulo
   * Multiplication → Primary ((*|/|%) Primary)*
   */
  parseMultiplication() {
    let expr = this.parsePrimary();

    while (this.match('OPERATOR', '*') ||
           this.match('OPERATOR', '/') ||
           this.match('OPERATOR', '%')) {
      const op = this.previous();
      const right = this.parsePrimary();
      expr = new ASTNode('BinaryOp', {
        operator: op.lexeme,
        left: expr,
        right: right,
        line: op.line,
        column: op.column
      });
    }

    return expr;
  }

  /**
   * Parse primary expression
   * Primary → NUMBER | STRING_LITERAL | CHAR_LITERAL | BOOLEAN_LITERAL | IDENTIFIER | (Expression)
   */
  parsePrimary() {
    if (this.match('NUMBER')) {
      const token = this.previous();
      return new ASTNode('Literal', {
        value: token.value,
        type: typeof token.value === 'number' ? 'number' : 'float',
        line: token.line,
        column: token.column
      });
    }

    if (this.match('STRING_LITERAL')) {
      const token = this.previous();
      return new ASTNode('Literal', {
        value: token.value,
        type: 'string',
        line: token.line,
        column: token.column
      });
    }

    if (this.match('CHAR_LITERAL')) {
      const token = this.previous();
      return new ASTNode('Literal', {
        value: token.value,
        type: 'char',
        line: token.line,
        column: token.column
      });
    }

    if (this.match('BOOLEAN_LITERAL')) {
      const token = this.previous();
      return new ASTNode('Literal', {
        value: token.value,
        type: 'boolean',
        line: token.line,
        column: token.column
      });
    }

    if (this.match('IDENTIFIER')) {
      const token = this.previous();
      return new ASTNode('Identifier', {
        name: token.lexeme,
        line: token.line,
        column: token.column
      });
    }

    if (this.match('PARENTHESIS', '(')) {
      const expr = this.parseExpression();
      if (!this.match('PARENTHESIS', ')')) {
        this.error("Expected ')' after expression", this.peek());
      }
      return expr;
    }

    this.error(`Unexpected token '${this.peek().lexeme}'`, this.peek());
    return null;
  }

  /**
   * Helper methods
   */

  isDataType(lexeme) {
    return ['int', 'float', 'string', 'char', 'boolean'].includes(lexeme);
  }

  isComparisonOp(lexeme) {
    return ['==', '!=', '>', '>=', '<', '<='].includes(lexeme);
  }

  check(type, lexeme = null) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (lexeme !== null && token.lexeme !== lexeme) return false;
    return true;
  }

  match(type, lexeme = null) {
    if (this.check(type, lexeme)) {
      this.advance();
      return true;
    }
    return false;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type === 'EOF';
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  error(message, token) {
    this.errors.push({
      type: 'SYNTAX_ERROR',
      message: message,
      line: token.line,
      column: token.column,
      lexeme: token.lexeme
    });
  }

  synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === 'SEPARATOR') return;

      if (this.check('KEYWORD')) {
        if (['if', 'while', 'int', 'float', 'string', 'char', 'boolean'].includes(this.peek().lexeme)) {
          return;
        }
      }

      this.advance();
    }
  }
}

export default Parser;
