'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Loader2 } from 'lucide-react';
import { categoryAPI } from '@/lib/api/categories';

interface Category {
  id: number;
  name: string;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  categories: number[];
  priceRange: [number, number];
  sortBy: 'newest' | 'price-low' | 'price-high' | 'rating';
  inStock: boolean;
}

export function ProductFilter({ onFiltersChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    priceRange: [0, 1000],
    sortBy: 'newest',
    inStock: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    categories: true,
    price: true,
    sort: true,
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoryAPI.getCategories();
        setCategories(response.data.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
        // Fallback to mock categories
        setCategories([
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Audio & Headphones' },
          { id: 3, name: 'Computing' },
          { id: 4, name: 'Peripherals' },
          { id: 5, name: 'Displays' },
          { id: 6, name: 'Accessories' },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFilter = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const toggleCategory = (categoryId: number) => {
    const updated = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];
    updateFilter({ categories: updated });
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: '',
      categories: [],
      priceRange: [0, 1000],
      sortBy: 'newest',
      inStock: false,
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <Card className="p-6 h-fit sticky top-20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          <button
            onClick={handleReset}
            className="text-sm text-primary hover:text-primary/80 font-semibold"
          >
            Reset
          </button>
        </div>

        {/* Search */}
        <div>
          <button
            onClick={() => toggleSection('search')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">Search</h3>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expandedSections.search ? '' : '-rotate-90'
                }`}
            />
          </button>
          {expandedSections.search && (
            <Input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => updateFilter({ search: e.target.value })}
              className="w-full"
            />
          )}
        </div>

        {/* Categories */}
        <div>
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">Categories</h3>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expandedSections.categories ? '' : '-rotate-90'
                }`}
            />
          </button>
          {expandedSections.categories && (
            <div className="space-y-3">
              {loadingCategories ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">Loading categories...</span>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">Price Range</h3>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expandedSections.price ? '' : '-rotate-90'
                }`}
            />
          </button>
          {expandedSections.price && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Min: ${filters.priceRange[0]}</label>
                <Input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    updateFilter({
                      priceRange: [Number(e.target.value), filters.priceRange[1]],
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Max: ${filters.priceRange[1]}</label>
                <Input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    updateFilter({
                      priceRange: [filters.priceRange[0], Number(e.target.value)],
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <div>
          <button
            onClick={() => toggleSection('sort')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">Sort By</h3>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expandedSections.sort ? '' : '-rotate-90'
                }`}
            />
          </button>
          {expandedSections.sort && (
            <div className="space-y-2">
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'rating', label: 'Rating: High to Low' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={filters.sortBy === option.value}
                    onChange={(e) =>
                      updateFilter({
                        sortBy: e.target.value as FilterState['sortBy'],
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.inStock}
              onCheckedChange={(checked) =>
                updateFilter({ inStock: checked as boolean })
              }
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
        </div>
      </div>
    </Card>
  );
}
