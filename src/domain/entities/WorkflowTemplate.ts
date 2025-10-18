/**
 * WorkflowTemplate Entity
 * Represents a reusable workflow template
 */

export interface WorkflowTemplateMetadata {
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  author: string;
  version: string;
  description: string;
  preview?: string; // base64 image
  documentation?: string;
}

export interface WorkflowTemplateStats {
  downloads: number;
  likes: number;
  rating: number;
  usageCount: number;
  lastUsed?: Date;
}

export class WorkflowTemplate {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly workflowData: any, // JSON workflow definition
    public readonly metadata: WorkflowTemplateMetadata,
    public readonly stats: WorkflowTemplateStats,
    public readonly isPublic: boolean,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Get template display name
   */
  getDisplayName(): string {
    return this.name;
  }

  /**
   * Get template category
   */
  getCategory(): string {
    return this.metadata.category;
  }

  /**
   * Get template tags
   */
  getTags(): string[] {
    return this.metadata.tags;
  }

  /**
   * Get template difficulty
   */
  getDifficulty(): string {
    return this.metadata.difficulty;
  }

  /**
   * Get template difficulty color
   */
  getDifficultyColor(): string {
    switch (this.metadata.difficulty) {
      case 'beginner':
        return 'green';
      case 'intermediate':
        return 'yellow';
      case 'advanced':
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Get template estimated time
   */
  getEstimatedTime(): string {
    if (this.metadata.estimatedTime < 60) {
      return `${this.metadata.estimatedTime} dakika`;
    }
    const hours = Math.floor(this.metadata.estimatedTime / 60);
    const minutes = this.metadata.estimatedTime % 60;
    return minutes > 0 ? `${hours}s ${minutes}dk` : `${hours} saat`;
  }

  /**
   * Get template rating
   */
  getRating(): number {
    return this.stats.rating;
  }

  /**
   * Get template rating stars
   */
  getRatingStars(): string {
    const rating = Math.round(this.stats.rating);
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  /**
   * Get template download count
   */
  getDownloadCount(): number {
    return this.stats.downloads;
  }

  /**
   * Get template like count
   */
  getLikeCount(): number {
    return this.stats.likes;
  }

  /**
   * Check if template is popular
   */
  isPopular(): boolean {
    return this.stats.downloads > 100 || this.stats.rating > 4.0;
  }

  /**
   * Check if template is trending
   */
  isTrending(): boolean {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.stats.lastUsed && this.stats.lastUsed > lastWeek;
  }

  /**
   * Get template preview image
   */
  getPreviewImage(): string | null {
    return this.metadata.preview || null;
  }

  /**
   * Get template documentation
   */
  getDocumentation(): string | null {
    return this.metadata.documentation || null;
  }

  /**
   * Update template stats
   */
  updateStats(stats: Partial<WorkflowTemplateStats>): WorkflowTemplate {
    return new WorkflowTemplate(
      this.id,
      this.name,
      this.description,
      this.workflowData,
      this.metadata,
      { ...this.stats, ...stats },
      this.isPublic,
      this.createdBy,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Increment download count
   */
  incrementDownloads(): WorkflowTemplate {
    return this.updateStats({
      downloads: this.stats.downloads + 1,
      lastUsed: new Date(),
    });
  }

  /**
   * Increment like count
   */
  incrementLikes(): WorkflowTemplate {
    return this.updateStats({
      likes: this.stats.likes + 1,
    });
  }

  /**
   * Update rating
   */
  updateRating(rating: number): WorkflowTemplate {
    return this.updateStats({
      rating: rating,
    });
  }

  /**
   * Check if template matches search query
   */
  matchesSearch(query: string): boolean {
    const searchTerm = query.toLowerCase();
    return (
      this.name.toLowerCase().includes(searchTerm) ||
      this.description.toLowerCase().includes(searchTerm) ||
      this.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      this.metadata.category.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Check if template matches category filter
   */
  matchesCategory(category: string): boolean {
    return category === 'all' || this.metadata.category === category;
  }

  /**
   * Check if template matches difficulty filter
   */
  matchesDifficulty(difficulty: string): boolean {
    return difficulty === 'all' || this.metadata.difficulty === difficulty;
  }

  /**
   * Check if template matches tags filter
   */
  matchesTags(tags: string[]): boolean {
    if (tags.length === 0) return true;
    return tags.some(tag => this.metadata.tags.includes(tag));
  }

  /**
   * Get template usage instructions
   */
  getUsageInstructions(): string[] {
    const instructions: string[] = [];

    instructions.push(`1. Template'i indirin ve workflow builder'da açın`);
    instructions.push(`2. Gerekli parametreleri düzenleyin`);
    instructions.push(`3. Bağlantıları kontrol edin`);
    instructions.push(`4. Workflow'u test edin`);
    instructions.push(`5. Aktif hale getirin`);

    return instructions;
  }

  /**
   * Validate template
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Template description is required');
    }

    if (!this.workflowData) {
      errors.push('Workflow data is required');
    }

    if (!this.metadata.category) {
      errors.push('Template category is required');
    }

    if (this.stats.rating < 0 || this.stats.rating > 5) {
      errors.push('Rating must be between 0 and 5');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clone template with new ID
   */
  clone(
    newId: string,
    newName: string,
    newCreatedBy: string
  ): WorkflowTemplate {
    return new WorkflowTemplate(
      newId,
      newName,
      this.description,
      this.workflowData,
      this.metadata,
      {
        downloads: 0,
        likes: 0,
        rating: 0,
        usageCount: 0,
      },
      false, // Cloned templates are private by default
      newCreatedBy,
      new Date(),
      new Date()
    );
  }

  /**
   * Export template to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      workflowData: this.workflowData,
      metadata: this.metadata,
      stats: this.stats,
      isPublic: this.isPublic,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create template from JSON
   */
  static fromJSON(data: any): WorkflowTemplate {
    return new WorkflowTemplate(
      data.id,
      data.name,
      data.description,
      data.workflowData,
      data.metadata,
      data.stats,
      data.isPublic,
      data.createdBy,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}
