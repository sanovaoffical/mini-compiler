/**
 * Symbol Table
 * Manages variable declarations, types, and scopes
 */
class SymbolTable {
  constructor() {
    this.scopes = [{}]; // Global scope at index 0
    this.symbols = []; // List of all symbols for display
  }

  /**
   * Enter a new scope (for blocks, loops, etc.)
   */
  enterScope() {
    this.scopes.push({});
  }

  /**
   * Exit current scope
   */
  exitScope() {
    if (this.scopes.length > 1) {
      this.scopes.pop();
    }
  }

  /**
   * Get current scope level (0 = global)
   */
  getCurrentScopeLevel() {
    return this.scopes.length - 1;
  }

  /**
   * Declare a new variable
   */
  declare(name, type, line, column, value = null) {
    const currentScope = this.scopes[this.scopes.length - 1];

    // Check if already declared in current scope
    if (currentScope.hasOwnProperty(name)) {
      return {
        success: false,
        error: `Variable '${name}' is already declared at line ${currentScope[name].line}`
      };
    }

    const scopeName = this.getScopeName();
    const symbol = {
      name: name,
      type: type,
      value: value,
      scope: scopeName,
      line: line,
      column: column,
      scopeLevel: this.getCurrentScopeLevel()
    };

    currentScope[name] = symbol;
    this.symbols.push(symbol);

    return { success: true };
  }

  /**
   * Look up a variable in current and parent scopes
   */
  lookup(name) {
    // Search from current scope to global scope
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].hasOwnProperty(name)) {
        return this.scopes[i][name];
      }
    }
    return null;
  }

  /**
   * Update variable value
   */
  update(name, value) {
    const symbol = this.lookup(name);
    if (symbol) {
      symbol.value = value;
      return { success: true };
    }
    return {
      success: false,
      error: `Variable '${name}' is not declared`
    };
  }

  /**
   * Check if variable is declared
   */
  isDeclared(name) {
    return this.lookup(name) !== null;
  }

  /**
   * Get variable type
   */
  getType(name) {
    const symbol = this.lookup(name);
    return symbol ? symbol.type : null;
  }

  /**
   * Get scope name based on level
   */
  getScopeName() {
    const level = this.getCurrentScopeLevel();
    if (level === 0) return 'Global';
    // For nested scopes, we'd track their type (if/else/while)
    return `Block ${level}`;
  }

  /**
   * Get all symbols for display
   */
  getSymbols() {
    return this.symbols;
  }

  /**
   * Clear symbol table
   */
  clear() {
    this.scopes = [{}];
    this.symbols = [];
  }
}

export default SymbolTable;
