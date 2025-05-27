import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL과 Key가 설정되지 않았습니다.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// 사용자 관련 헬퍼 함수들
export const authHelpers = {
  // 사용자 생성
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: userData.name,
          email: userData.email,
          password_hash: userData.passwordHash,
          department: userData.department
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, user: data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 이메일로 사용자 찾기
  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return { success: true, user: data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // ID로 사용자 찾기
  async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, department, role, created_at')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return { success: true, user: data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// 정책 관련 헬퍼 함수들
export const policyHelpers = {
  // 정책 생성
  async createPolicy(policyData) {
    try {
      const { data, error } = await supabase
        .from('policies')
        .insert(policyData)
        .select()
        .single()

      if (error) throw error
      return { success: true, policy: data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 정책 목록 조회
  async getPolicies(options = {}) {
    try {
      let query = supabase
        .from('policies')
        .select(`
          id, document_id, title, category_id, ai_summary, ai_tags,
          status, priority, department_owner, author_id,
          approval_status, version, created_at, updated_at, view_count
        `)
        .eq('is_deleted', false)

      if (options.status) {
        query = query.eq('status', options.status)
      }
      if (options.department) {
        query = query.eq('department_owner', options.department)
      }
      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`)
      }

      const sortBy = options.sortBy || 'updated_at'
      const sortOrder = options.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
      }

      const { data, error } = await query
      if (error) throw error
      return { success: true, policies: data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async getPolicyById(id) {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single()

      if (error) throw error
      return { success: true, policy: data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async updatePolicy(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('policies')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, policy: data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async incrementViewCount(id) {
    try {
      const { error } = await supabase.rpc('increment_view_count', {
        policy_id: id
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('조회수 증가 실패:', error)
      return { success: false, error: error.message }
    }
  },

  async getStats() {
    try {
      const [totalResult, activeResult, draftResult, recentResult] = await Promise.all([
        supabase.from('policies').select('id', { count: 'exact' }).eq('is_deleted', false),
        supabase.from('policies').select('id', { count: 'exact' }).eq('is_deleted', false).eq('status', 'active'),
        supabase.from('policies').select('id', { count: 'exact' }).eq('is_deleted', false).eq('status', 'draft'),
        supabase.from('policies').select('id', { count: 'exact' }).eq('is_deleted', false).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ])

      return {
        success: true,
        stats: {
          totalPolicies: totalResult.count || 0,
          activePolicies: activeResult.count || 0,
          draftPolicies: draftResult.count || 0,
          recentPolicies: recentResult.count || 0
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// 카테고리 관련 헬퍼 함수
export const categoryHelpers = {
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      return { success: true, categories: data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// 검색 관련 헬퍼 함수
export const searchHelpers = {
  async saveSearchHistory(userId, query, searchType, resultsCount) {
    try {
      const { error } = await supabase
        .from('search_history')
        .insert({
          user_id: userId,
          query,
          search_type: searchType,
          results_count: resultsCount
        })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('검색 히스토리 저장 실패:', error)
      return { success: false, error: error.message }
    }
  },

  async searchPolicies(query, options = {}) {
    try {
      let supabaseQuery = supabase
        .from('policies')
        .select(`
          id, document_id, title, ai_summary, ai_tags,
          status, priority, department_owner, created_at, view_count
        `)
        .eq('is_deleted', false)

      if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,ai_summary.ilike.%${query}%`)
      }

      if (options.department) {
        supabaseQuery = supabaseQuery.eq('department_owner', options.department)
      }

      if (options.status) {
        supabaseQuery = supabaseQuery.eq('status', options.status)
      }

      supabaseQuery = supabaseQuery.order('updated_at', { ascending: false }).limit(options.limit || 20)

      const { data, error } = await supabaseQuery

      if (error) throw error
      return { success: true, results: data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
