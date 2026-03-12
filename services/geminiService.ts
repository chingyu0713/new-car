import { AIRecommendation } from "../types";
import { apiClient } from "./apiClient";

// AI service now uses backend API instead of direct Gemini calls
// This keeps the API key secure on the server side
export const GeminiService = {
  /**
   * Translates natural language queries into app filters using backend AI service.
   */
  interpretQuery: async (query: string): Promise<AIRecommendation> => {
    if (!query || query.trim() === '') {
      return {
        reasoning: "請輸入搜尋條件",
        suggestedFilters: {}
      };
    }

    try {
      // Call backend AI search endpoint
      const response: any = await apiClient.ai.search(query);

      // Transform backend response to frontend format
      return {
        reasoning: response.reasoning || "根據您的需求，這是最符合的結果。",
        suggestedFilters: {
          brand: response.filters?.brand,
          type: response.filters?.type,
          maxPrice: response.filters?.maxPrice,
          minPrice: response.filters?.minFuelEfficiency ? undefined : response.filters?.minPrice,
        },
        // Store recommended cars if available
        recommendations: response.recommendations || []
      };

    } catch (error) {
      console.error("AI search failed:", error);
      return {
        reasoning: "抱歉，AI 搜尋暫時無法使用。請稍後再試或使用一般篩選功能。",
        suggestedFilters: {}
      };
    }
  }
};