/**
 * AST Node class for representing Abstract Syntax Tree nodes
 */
class ASTNode {
  constructor(type, properties = {}) {
    this.type = type;
    this.line = properties.line || 0;
    this.column = properties.column || 0;
    Object.assign(this, properties);
  }
}

export default ASTNode;
