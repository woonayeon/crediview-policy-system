'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Tag, Calendar, User, Building } from 'lucide-react';

interface PolicySearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

interface SearchFilters {
  keyword: string;
  category: string;
  department: string;
  dateRange: {
    start: string;
    end: string;
  };
  status: string;
  priority: string;
  tags: string[];
}

const PolicySearch: React.FC<PolicySearchProps> = ({ onSearch, onClear }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    category: '',
    department: '',
    dateRange: { start: '', end: '' },
    status: '',
    priority: '',
    tags: []
  });

  const [availableTags, setAvailableTags] = useState<string[]>([
    '보안', '인사', '재무', '운영', '기술', '법무', '컴플라이언스'
  ]);

  const categories = [
    '보안정책', '인사정책', '재무정책', '운영정책', '기술정책', '법무정책'
  ];

  const departments = [
    '기획팀', '운영팀', '개발팀', '인사팀', '재무팀', '법무팀'
  ];

  const statuses = [
    '활성', '대기', '비활성', '검토중'
  ];

  const priorities = [
    '높음', '보통', '낮음'
  ];

  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      keyword: '',
      category: '',
      department: '',
      dateRange: { start: '', end: '' },
      status: '',
      priority: '',
      tags: []
    });
    onClear();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">고급 검색</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 키워드 검색 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            키워드
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
              placeholder="정책명, 내용 검색..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 카테고리</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* 부서 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Building className="w-4 h-4 inline mr-1" />
            부서
          </label>
          <select
            value={filters.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 부서</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상태
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 상태</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* 우선순위 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            우선순위
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 우선순위</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>

        {/* 날짜 범위 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            등록일
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleInputChange('dateRange', {
                ...filters.dateRange,
                start: e.target.value
              })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="self-center text-gray-500">~</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleInputChange('dateRange', {
                ...filters.dateRange,
                end: e.target.value
              })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 태그 선택 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="w-4 h-4 inline mr-1" />
          태그
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.tags.includes(tag)
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSearch}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          검색
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          초기화
        </button>
      </div>

      {/* 활성 필터 표시 */}
      {(filters.keyword || filters.category || filters.department || filters.status || filters.priority || filters.tags.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.keyword && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                키워드: {filters.keyword}
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                카테고리: {filters.category}
              </span>
            )}
            {filters.department && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
                부서: {filters.department}
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                상태: {filters.status}
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm">
                우선순위: {filters.priority}
              </span>
            )}
            {filters.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm">
                태그: {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicySearch;
