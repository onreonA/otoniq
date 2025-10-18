/**
 * WorkflowNode Entity
 * Represents a single node in a workflow
 */

export interface WorkflowNodePosition {
  x: number;
  y: number;
}

export interface WorkflowNodeConnection {
  nodeId: string;
  outputIndex: number;
  inputIndex: number;
}

export interface WorkflowNodeParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  required?: boolean;
  description?: string;
}

export class WorkflowNode {
  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly name: string,
    public readonly position: WorkflowNodePosition,
    public readonly parameters: WorkflowNodeParameter[],
    public readonly connections: WorkflowNodeConnection[],
    public readonly metadata?: {
      category?: string;
      icon?: string;
      color?: string;
      description?: string;
      version?: string;
      author?: string;
    }
  ) {}

  /**
   * Get node display name
   */
  getDisplayName(): string {
    return this.name || this.type;
  }

  /**
   * Get node icon
   */
  getIcon(): string {
    return this.metadata?.icon || 'ri-node-tree';
  }

  /**
   * Get node color
   */
  getColor(): string {
    return this.metadata?.color || 'blue';
  }

  /**
   * Get node category
   */
  getCategory(): string {
    return this.metadata?.category || 'general';
  }

  /**
   * Check if node has connections
   */
  hasConnections(): boolean {
    return this.connections.length > 0;
  }

  /**
   * Get input connections
   */
  getInputConnections(): WorkflowNodeConnection[] {
    return this.connections.filter(conn => conn.inputIndex !== undefined);
  }

  /**
   * Get output connections
   */
  getOutputConnections(): WorkflowNodeConnection[] {
    return this.connections.filter(conn => conn.outputIndex !== undefined);
  }

  /**
   * Add connection to another node
   */
  addConnection(connection: WorkflowNodeConnection): WorkflowNode {
    return new WorkflowNode(
      this.id,
      this.type,
      this.name,
      this.position,
      this.parameters,
      [...this.connections, connection],
      this.metadata
    );
  }

  /**
   * Remove connection
   */
  removeConnection(nodeId: string, outputIndex?: number): WorkflowNode {
    const filteredConnections = this.connections.filter(
      conn =>
        !(
          conn.nodeId === nodeId &&
          (outputIndex === undefined || conn.outputIndex === outputIndex)
        )
    );

    return new WorkflowNode(
      this.id,
      this.type,
      this.name,
      this.position,
      this.parameters,
      filteredConnections,
      this.metadata
    );
  }

  /**
   * Update node position
   */
  updatePosition(position: WorkflowNodePosition): WorkflowNode {
    return new WorkflowNode(
      this.id,
      this.type,
      this.name,
      position,
      this.parameters,
      this.connections,
      this.metadata
    );
  }

  /**
   * Update node parameters
   */
  updateParameters(parameters: WorkflowNodeParameter[]): WorkflowNode {
    return new WorkflowNode(
      this.id,
      this.type,
      this.name,
      this.position,
      parameters,
      this.connections,
      this.metadata
    );
  }

  /**
   * Validate node configuration
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required parameters
    this.parameters.forEach(param => {
      if (
        param.required &&
        (param.value === undefined ||
          param.value === null ||
          param.value === '')
      ) {
        errors.push(`Parameter '${param.name}' is required`);
      }
    });

    // Check node type specific validations
    if (this.type === 'trigger' && this.connections.length === 0) {
      errors.push('Trigger nodes must have at least one output connection');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get node execution order (for workflow execution)
   */
  getExecutionOrder(visited: Set<string> = new Set()): string[] {
    if (visited.has(this.id)) {
      return [];
    }

    visited.add(this.id);
    const order = [this.id];

    // Add connected nodes
    this.connections.forEach(conn => {
      // This would need access to all nodes to traverse properly
      // For now, just return current node
    });

    return order;
  }

  /**
   * Clone node with new ID
   */
  clone(newId: string): WorkflowNode {
    return new WorkflowNode(
      newId,
      this.type,
      this.name,
      this.position,
      this.parameters,
      this.connections,
      this.metadata
    );
  }

  /**
   * Export node to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      position: this.position,
      parameters: this.parameters,
      connections: this.connections,
      metadata: this.metadata,
    };
  }

  /**
   * Create node from JSON
   */
  static fromJSON(data: any): WorkflowNode {
    return new WorkflowNode(
      data.id,
      data.type,
      data.name,
      data.position,
      data.parameters || [],
      data.connections || [],
      data.metadata
    );
  }
}
