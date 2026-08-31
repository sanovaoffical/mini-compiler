import Lexer from './Lexer.js';

/**
 * Lexer Test Suite
 * Tests the tokenization of various C-like mini language programs
 */

class LexerTest {
  /**
   * Run all lexer tests
   */
  static runAllTests() {
    console.log('\n========== LEXER TEST SUITE ==========\n');

    this.testValidProgram1();
    this.testValidProgram2();
    this.testValidProgram3();
    this.testLexicalErrorInvalidCharacter();
    this.testStringLiteral();
    this.testCharLiteral();
    this.testComments();
    this.testFloatNumbers();
    this.testAllOperators();
    this.testIfElseStatement();
    this.testWhileLoop();

    console.log('\n========== END OF TESTS ==========\n');
  }

  /**
   * Test 1: Simple variable declaration
   */
  static testValidProgram1() {
    console.log('Test 1: Simple Variable Declaration');
    const code = `int a = 10;`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:', code);
    console.log('Tokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('Errors:', result.errors.length === 0 ? 'None' : result.errors);
    console.log('Success:', result.success);
    console.log('---\n');
  }

  /**
   * Test 2: Multiple declarations and arithmetic
   */
  static testValidProgram2() {
    console.log('Test 2: Multiple Declarations and Arithmetic');
    const code = `int a = 10;
int b = 20;
int c = a + b;`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:');
    console.log(code);
    console.log('\nTokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('\nErrors:', result.errors.length === 0 ? 'None' : result.errors);
    console.log('Success:', result.success);
    console.log('---\n');
  }

  /**
   * Test 3: Variable assignment
   */
  static testValidProgram3() {
    console.log('Test 3: Variable Assignment');
    const code = `int x = 5;
x = x + 3;`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:');
    console.log(code);
    console.log('\nTokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('\nErrors:', result.errors.length === 0 ? 'None' : result.errors);
    console.log('Success:', result.success);
    console.log('---\n');
  }

  /**
   * Test 4: Lexical Error - Invalid Character
   */
  static testLexicalErrorInvalidCharacter() {
    console.log('Test 4: Lexical Error - Invalid Character');
    const code = `int @a = 10;`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:', code);
    console.log('\nTokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('\nErrors:', result.errors.length > 0 ? result.errors : 'None');
    console.log('Success:', result.success);
    console.log('---\n');
  }

  /**
   * Test 5: String Literal
   */
  static testStringLiteral() {
    console.log('Test 5: String Literal');
    const code = `string name = "John Doe";`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:', code);
    console.log('\nTokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('\nErrors:', result.errors.length === 0 ? 'None' : result.errors);
    console.log('Success:', result.success);
    console.log('---\n');
  }

  /**
   * Test 6: Character Literal
   */
  static testCharLiteral() {
    console.log('Test 6: Character Literal');
    const code = `char grade = 'A';`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:', code);
    console.log('\nTokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('\nErrors:', result.errors.length === 0 ? 'None' : result.errors);
    console.log('Success:', result.success);
    console.log('---\n');
  }

  /**
   * Test 7: Comments
   */
  static testComments() {
    console.log('Test 7: Comments');
    const code = `// This is a line comment
int a = 10; /* This is a block comment */
int b = 20;`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:');
    console.log(code);
    console.log('\nTokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('\nErrors:', result.errors.length === 0 ? 'None' : result.errors);
    console.log('Success:', result.success);
    console.log('---\n');
  }

  /**
   * Test 8: Float Numbers
   */
  static testFloatNumbers() {
    console.log('Test 8: Float Numbers');
    const code = `float price = 99.99;`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:', code);
    console.log('\nTokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('\nErrors:', result.errors.length === 0 ? 'None' : result.errors);
    console.log('Success:', result.success);
    console.log('---\n');
  }

  /**
   * Test 9: All Operators
   */
  static testAllOperators() {
    console.log('Test 9: All Operators');
    const code = `int a = 5 + 3 - 2 * 4 / 2 % 3;
boolean b = a > 5 && a < 10;`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:');
    console.log(code);
    console.log('\nTokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('\nErrors:', result.errors.length === 0 ? 'None' : result.errors);
    console.log('Success:', result.success);
    console.log('---\n');
  }

  /**
   * Test 10: If-Else Statement
   */
  static testIfElseStatement() {
    console.log('Test 10: If-Else Statement');
    const code = `if (a > b) {
  a = b;
} else {
  b = a;
}`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:');
    console.log(code);
    console.log('\nTokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('\nErrors:', result.errors.length === 0 ? 'None' : result.errors);
    console.log('Success:', result.success);
    console.log('---\n');
  }

  /**
   * Test 11: While Loop
   */
  static testWhileLoop() {
    console.log('Test 11: While Loop');
    const code = `while (a < 10) {
  a = a + 1;
}`;
    const lexer = new Lexer(code);
    const result = lexer.tokenize();

    console.log('Input:');
    console.log(code);
    console.log('\nTokens:');
    result.tokens.forEach(token => {
      console.log(`  ${token.toString()}`);
    });
    console.log('\nErrors:', result.errors.length === 0 ? 'None' : result.errors);
    console.log('Success:', result.success);
    console.log('---\n');
  }
}

// Run tests when this module is loaded
LexerTest.runAllTests();

export default LexerTest;
