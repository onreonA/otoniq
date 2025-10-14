/**
 * useCategories Hook
 * React hook for category operations
 */

import { useState, useEffect, useCallback } from 'react';
import { SupabaseCategoryRepository } from '../../infrastructure/database/supabase/repositories/SupabaseCategoryRepository';
import { CategoryService } from '../../infrastructure/services/CategoryService';
import {
  Category,
  CategoryTreeNode,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from '../../domain/entities/Category';
import { useAuth } from './useAuth';

const repository = new SupabaseCategoryRepository();
const service = new CategoryService(repository);

export const useCategories = () => {
  const { user, tenantId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await service.getAll(tenantId);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const fetchCategoryTree = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      const tree = await service.getTree(tenantId);
      setCategoryTree(tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category tree');
      console.error('Error fetching category tree:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const createCategory = async (data: CreateCategoryDTO): Promise<Category | null> => {
    if (!tenantId || !user) return null;

    setLoading(true);
    setError(null);

    try {
      const category = await service.create(data, tenantId, user.id);
      await fetchCategories();
      await fetchCategoryTree();
      return category;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      console.error('Error creating category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (
    id: string,
    data: UpdateCategoryDTO
  ): Promise<Category | null> => {
    if (!tenantId || !user) return null;

    setLoading(true);
    setError(null);

    try {
      const category = await service.update(id, data, tenantId, user.id);
      await fetchCategories();
      await fetchCategoryTree();
      return category;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      console.error('Error updating category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!tenantId) return false;

    setLoading(true);
    setError(null);

    try {
      await service.delete(id, tenantId);
      await fetchCategories();
      await fetchCategoryTree();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      console.error('Error deleting category:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const moveCategory = async (
    id: string,
    newParentId: string | null
  ): Promise<boolean> => {
    if (!tenantId || !user) return false;

    setLoading(true);
    setError(null);

    try {
      await service.move(id, newParentId, tenantId, user.id);
      await fetchCategories();
      await fetchCategoryTree();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move category');
      console.error('Error moving category:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchCategories();
      fetchCategoryTree();
    }
  }, [tenantId, fetchCategories, fetchCategoryTree]);

  return {
    categories,
    categoryTree,
    loading,
    error,
    fetchCategories,
    fetchCategoryTree,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
  };
};

