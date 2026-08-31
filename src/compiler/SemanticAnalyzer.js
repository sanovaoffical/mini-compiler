import SymbolTable from './SymbolTable.js';

/**
 * Semantic Analyzer
 * Performs semantic analysis on AST
 * Detects type errors, undeclared variables, etc.
 */
class SemanticAnalyzer {
  constructor() {
    this.symbolTable = new SymbolTable();
    this.errors = [];
  }

  /**
   * Main analysis method
   */
  analyze(ast) {
    this.errors = [];
    this.symbolTable.clear();

    for (const node of ast) {
      this.visitStatement(node);
    }

    return {
      symbolTable: this.symbolTable.getSymbols(),
      errors: this.errors,
      success: this.errors.length === 0
    };
  }

  /**
   * Visit a statement node
   */
  visitStatement(node) {
    if (!node) return null;

    switch (node.type) {
      case 'VariableDeclaration':
        return this.visitVariableDeclaration(node);
      case 'Assignment':
        return this.visitAssignment(node);
      case 'IfStatement':
        return this.visitIfStatement(node);
      case 'WhileStatement':
        return this.visitWhileStatement(node);
      case 'BlockStatement':
        return this.visitBlockStatement(node);
      default:
        return null;
    }
  }

  /**
   * Visit variable declaration
   */
  visitVariableDeclaration(node) {
    const { dataType, identifier, value, line, column } = node;

    // Validate data type
    if (!this.isValidDataType(dataType)) {
      this.addError(`Invalid data type '${dataType}'`, line, column);
      return null;
    }

    // Check for duplicate declaration
    if (this.symbolTable.isDeclared(identifier)) {
      const existing = this.symbolTable.lookup(identifier);
      this.addError(`Variable '${identifier}' is already declared at line ${existing.line}`, line, column);
      return null;
    }

    // If there's an initialization value, validate it
    if (value) {
      const valueType = this.getExpressionType(value);
      if (valueType === null) {
        // Error already added by getExpressionType
        return null;
      }

      // Check type compatibility
      if (!this.isTypeCompatible(dataType, valueType)) {
        this.addError(
          `Type mismatch: Cannot assign ${valueType} to ${dataType} variable '${identifier}'`,
          line,
          column
        );
        return null;
      }
    }

    // Declare the variable
    const result = this.symbolTable.declare(identifier, dataType, line, column, value);
    if (!result.success) {
      this.addError(result.error, line, column);
    }

    return node;
  }

  /**
   * Visit assignment
   */
  visitAssignment(node) {
    const { identifier, value, line, column } = node;

    // Check if variable is declared
    if (!this.symbolTable.isDeclared(identifier)) {
      this.addError(`Variable '${identifier}' is not declared`, line, column);
      return null;
    }

    // Get variable type
    const varType = this.symbolTable.getType(identifier);

    // Validate assigned value
    const valueType = this.getExpressionType(value);
    if (valueType === null) {
      // Error already added by getExpressionType
      return null;
    }

    // Check type compatibility
    if (!this.isTypeCompatible(varType, valueType)) {
      this.addError(
        `Type mismatch: Cannot assign ${valueType} to ${varType} variable '${identifier}'`,
        line,
        column
      );
      return null;
    }

    // Update variable value
    this.symbolTable.update(identifier, value);

    return node;
  }

  /**
   * Visit if statement
   */
  visitIfStatement(node) {
    const { condition, thenBranch, elseBranch, line, column } = node;

    // Validate condition is boolean
    const condType = this.getExpressionType(condition);
    if (condType !== 'boolean' && condType !== null) {
      this.addError(
        `If condition must be boolean, got ${condType}`,
        line,
        column
      );
    }

    // Enter new scope for then branch
    this.symbolTable.enterScope();
    this.visitStatement(thenBranch);
    this.symbolTable.exitScope();

    // Process else branch if present
    if (elseBranch) {
      this.symbolTable.enterScope();
      this.visitStatement(elseBranch);
      this.symbolTable.exitScope();
    }

    return node;
  }

  /**
   * Visit while statement
   */
  visitWhileStatement(node) {
    const { condition, body, line, column } = node;

    // Validate condition is boolean
    const condType = this.getExpressionType(condition);
    if (condType !== 'boolean' && condType !== null) {
      this.addError(
        `While condition must be boolean, got ${condType}`,
        line,
        column
      );
    }

    // Enter new scope for loop body
    this.symbolTable.enterScope();
    this.visitStatement(body);
    this.symbolTable.exitScope();

    return node;
  }

  /**
   * Visit block statement
   */
  visitBlockStatement(node) {
    const { statements } = node;
    for (const stmt of statements) {
      this.visitStatement(stmt);
    }
    return node;
  }

  /**
   * Get expression type (for validation)
   */
  getExpressionType(expr) {
    if (!expr) return null;

    switch (expr.type) {
      case 'Literal':
        return expr.type_;

      case 'Identifier': {
        if (!this.symbolTable.isDeclared(expr.name)) {
          this.addError(`Variable '${expr.name}' is not declared`, expr.line, expr.column);
          return null;
        }
        return this.symbolTable.getType(expr.name);
      }

      case 'BinaryOp': {
        const leftType = this.getExpressionType(expr.left);
        const rightType = this.getExpressionType(expr.right);

        if (leftType === null || rightType === null) {
          return null;
        }

        // Comparison operators return boolean
        if (['==', '!=', '>', '>=', '<', '<='].includes(expr.operator)) {
          // Validate types are compatible for comparison
          if (!this.isTypeCompatible(leftType, rightType)) {
            this.addError(
              `Cannot compare ${leftType} and ${rightType}`,
              expr.line,
              expr.column
            );
            return null;
          }
          return 'boolean';
        }

        // Arithmetic operators
        if (['+', '-', '*', '/', '%'].includes(expr.operator)) {
          // Both operands must be numeric
          if (!this.isNumericType(leftType) || !this.isNumericType(rightType)) {
            this.addError(
              `Invalid arithmetic operation between ${leftType} and ${rightType}`,
              expr.line,
              expr.column
            );
            return null;
          }
          return this.getCommonNumericType(leftType, rightType);
        }

        return null;
      }

      default:
        return null;
    }
  }

  /**
   * Check if data type is valid
   */
  isValidDataType(type) {
    return ['int', 'float', 'string', 'char', 'boolean'].includes(type);
  }

  /**
   * Check if type is numeric
   */
  isNumericType(type) {
    return ['int', 'float'].includes(type);
  }

  /**
   * Get common type for numeric operations
   */
  getCommonNumericType(type1, type2) {
    if (type1 === 'float' || type2 === 'float') {
      return 'float';
    }
    return 'int';
  }

  /**
   * Check if types are compatible
   */
  isTypeCompatible(targetType, sourceType) {
    // Exact match
    if (targetType === sourceType) {
      return true;
    }

    // int can accept int
    // float can accept int or float
    if (targetType === 'float' && (sourceType === 'int' || sourceType === 'float')) {
      return true;
    }

    return false;
  }

  /**
   * Add an error
   */
  addError(message, line, column) {
    this.errors.push({
      type: 'SEMANTIC_ERROR',
      message: message,
      line: line,
      column: column
    });
  }
}

export default SemanticAnalyzer;
