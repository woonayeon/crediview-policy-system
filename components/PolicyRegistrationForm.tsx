'use client';

import { useState, useRef } from 'react';
import { 
  Save, 
  Upload, 
  FileText, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Eye,
  Sparkles,
  Tag,
  Users,
  Calendar
} from 'lucide-react';

interface PolicyFormData {
  title: string;
  category: string;
  department: string;
  priority: 'high' | 'medium' | 'low';
  content: string;
  effectiveDate: string;
  expiryDate: string;
  attachments: File[];
  tags: string[];
  approvers: string[];
  targetAudience: string[];
}

interface AIStructuredData {
  category: string;
  policyType: string;
  keyPoints: string[];
  tags: string[];
  businessArea: string;
  compliance: {
    isRequired: boolean;
    checkpoints: string[];
  };
  summary: string;
  riskLevel: 'high' | 'medium' | 'low';
}

const PolicyRegistrationForm = () => {
  const [formData, setFormData] = useState<PolicyFormData>({
    title: '',
    category: '',
    department: '',
    priority: 'medium',
    content: '',
    effectiveDate: '',
    expiryDate: '',
    attachments: [],
    tags: [],
    approvers: [],
    targetAudience: []
  });

  const [aiStructured, setAiStructured] = useState<AIStructuredData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    '보안정책', '인사정책', '재무정책', '운영정책', 
    '기술정책', '법무정책', '컴플라이언스'
  ];

  const departments = [
    '기획팀', '운영팀', '개발팀', '인사팀', 
    '재무팀', '법무팀', '마케팅팀'
  ];

  const targetAudienceOptions = [
    '전체 직원', '관리자급', '팀장급', '신입사원', 
    '특정 부서', '외부 파트너'
  ];

  const approverOptions = [
    '김대표', '박상무', '이부장', '정팀장', '최과장'
  ];

  const handleInputChange = (field: keyof PolicyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleTagInput = (value: string) => {
    if (value.endsWith(',') || value.endsWith(' ')) {
      const newTag = value.slice(0, -1).trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const processWithAI = async () => {
    if (!formData.content.trim()) {
      setErrors({ content: '정책 내용을 입력해주세요.' });
      return;
    }

    setIsProcessing(true);
    try {
      // AI 분석 API 호출
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title,
          analysisType: 'full'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiStructured(data.result);
        
        // AI 결과를 폼에 자동 반영
        setFormData(prev => ({
          ...prev,
          category: prev.category || data.result.category,
          tags: [...new Set([...prev.tags, ...data.result.tags])]
        }));
      } else {
        console.error('AI 분석 실패');
      }
    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = '정책명을 입력해주세요.';
    if (!formData.category) newErrors.category = '카테고리를 선택해주세요.';
    if (!formData.department) newErrors.department = '부서를 선택해주세요.';
    if (!formData.content.trim()) newErrors.content = '정책 내용을 입력해주세요.';
    if (!formData.effectiveDate) newErrors.effectiveDate = '시행일을 선택해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: 'current_user_id' // 실제로는 인증된 사용자 ID
        }),
      });

      if (response.ok) {
        alert('정책이 성공적으로 등록되었습니다!');
        // 폼 초기화 또는 리다이렉트
      } else {
        alert('정책 등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('정책 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            새 정책 등록
          </h2>
          <p className="text-gray-600 mt-1">AI가 자동으로 구조화하여 저장합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정책명 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="정책 제목을 입력하세요"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">카테고리 선택</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                등록 부서 *
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">부서 선택</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.department}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                우선순위
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
            </div>
          </div>

          {/* 날짜 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                시행일 *
              </label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.effectiveDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.effectiveDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.effectiveDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                만료일 (선택)
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 정책 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정책 내용 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={8}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="정책의 세부 내용을 입력하세요..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.content}
              </p>
            )}
          </div>

          {/* AI 분석 버튼 */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI 자동 구조화
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  AI가 정책 내용을 분석하여 카테고리, 태그, 요약을 자동 생성합니다
                </p>
              </div>
              <button
                type="button"
                onClick={processWithAI}
                disabled={isProcessing || !formData.content.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI 분석
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI 분석 결과 */}
          {aiStructured && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5" />
                AI 분석 완료
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-green-800">요약:</span>
                  <p className="text-green-700 mt-1">{aiStructured.summary}</p>
                </div>
                <div>
                  <span className="font-medium text-green-800">핵심 포인트:</span>
                  <ul className="list-disc list-inside text-green-700 mt-1">
                    {aiStructured.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-green-800">추천 태그:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiStructured.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-green-800">위험도:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    aiStructured.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                    aiStructured.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {aiStructured.riskLevel === 'high' ? '높음' :
                     aiStructured.riskLevel === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 태그 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              태그
            </label>
            <input
              type="text"
              placeholder="태그를 입력하고 쉼표나 스페이스로 구분하세요"
              onKeyUp={(e) => handleTagInput(e.currentTarget.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 파일 첨부 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              첨부파일
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  파일을 드래그하거나 클릭하여 업로드하세요
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  파일 선택
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx"
                />
              </div>
            </div>

            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 미리보기 및 제출 버튼 */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? '미리보기 닫기' : '미리보기'}
            </button>
            
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              정책 등록
            </button>
          </div>

          {/* 미리보기 모달 */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">정책 미리보기</h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{formData.title || '제목 없음'}</h2>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>카테고리: {formData.category || '미지정'}</span>
                      <span>부서: {formData.department || '미지정'}</span>
                      <span>우선순위: {
                        formData.priority === 'high' ? '높음' :
                        formData.priority === 'medium' ? '보통' : '낮음'
                      }</span>
                    </div>
                  </div>

                  {formData.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">태그: </span>
                      <div className="inline-flex flex-wrap gap-1 mt-1">
                        {formData.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">정책 내용</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {formData.content || '내용이 입력되지 않았습니다.'}
                      </pre>
                    </div>
                  </div>

                  {aiStructured && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">AI 분석 결과</h4>
                      <div className="bg-blue-50 p-4 rounded-md space-y-2">
                        <p><strong>요약:</strong> {aiStructured.summary}</p>
                        <p><strong>업무 영역:</strong> {aiStructured.businessArea}</p>
                        <p><strong>핵심 포인트:</strong></p>
                        <ul className="list-disc list-inside ml-4">
                          {aiStructured.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {formData.attachments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">첨부파일</h4>
                      <div className="space-y-1">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            📎 {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PolicyRegistrationForm;
