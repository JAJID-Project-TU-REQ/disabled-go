package models

import (
	"encoding/json"
	"strings"
)

// Helper function to parse JSON array string to []string
func parseJSONArray(jsonStr string) []string {
	if jsonStr == "" {
		return []string{}
	}

	var result []string
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		// If parsing fails, try splitting by comma as fallback
		if strings.Contains(jsonStr, ",") {
			parts := strings.Split(jsonStr, ",")
			for _, part := range parts {
				result = append(result, strings.TrimSpace(part))
			}
		} else {
			result = []string{jsonStr}
		}
	}
	return result
}

// Helper function to convert []string to JSON array string
func ToJSONArray(arr []string) string {
	if len(arr) == 0 {
		return "[]"
	}
	data, err := json.Marshal(arr)
	if err != nil {
		return "[]"
	}
	return string(data)
}

