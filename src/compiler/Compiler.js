import Lexer from './Lexer.js';
import Parser from './Parser.js';
import SemanticAnalyzer from './SemanticAnalyzer.js';

/**
 * Compiler
 * Orchestrates the complete compilation pipeline
 */
class Compiler {
  /**
   * Compile source code through all phases
   */
  static compile(sourceCode) {
    const result = {
      sourceCode: sourceCode,
      phases: {
        lexical: null,
        syntax: null,
        semantic: null
      },
      success: false,
      hasErrors: false,
      allErrors: []
    };

    try {
      // PHASE 1: Lexical Analysis
      const lexer = new Lexer(sourceCode);
      const lexicalResult = lexer.tokenize();
      result.phases.lexical = lexicalResult;
      result.allErrors.push(...lexicalResult.errors);

      if (!lexicalResult.success) {
        result.hasErrors = true;
        return result;
      }

      // PHASE 2: Syntax Analysis
      const parser = new Parser(lexicalResult.tokens);
      const syntaxResult = parser.parse();
      result.phases.syntax = syntaxResult;
      result.allErrors.push(...syntaxResult.errors);

      if (!syntaxResult.success) {
        result.hasErrors = true;
        return result;
      }

      // PHASE 3: Semantic Analysis
      const semanticAnalyzer = new SemanticAnalyzer();
      const semanticResult = semanticAnalyzer.analyze(syntaxResult.ast);
      result.phases.semantic = semanticResult;
      result.allErrors.push(...semanticResult.errors);

      if (!semanticResult.success) {
        result.hasErrors = true;
        return result;
      }

      // All phases successful
      result.success = true;
      return result;
    } catch (error) {
      result.hasErrors = true;
      result.allErrors.push({
        type: 'INTERNAL_ERROR',
        message: error.message,
        line: 0,
        column: 0
      });
      return result;
    }
  }
}

export default Compiler;
