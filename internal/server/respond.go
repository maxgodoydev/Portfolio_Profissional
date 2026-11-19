package server

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

// Todas as respostas seguem o mesmo envelope:
//   sucesso: {"ok":true,"data":{...}}
//   erro:    {"ok":false,"error":{"code":"...","message":"...","details":{...}},"requestId":"..."}

type apiError struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Details map[string]string `json:"details,omitempty"`
}

type envelope struct {
	OK        bool      `json:"ok"`
	Data      any       `json:"data,omitempty"`
	Error     *apiError `json:"error,omitempty"`
	RequestID string    `json:"requestId,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func (s *Server) ok(w http.ResponseWriter, status int, data any) {
	writeJSON(w, status, envelope{OK: true, Data: data})
}

func (s *Server) fail(w http.ResponseWriter, status int, code, message string, details map[string]string) {
	writeJSON(w, status, envelope{
		OK:        false,
		Error:     &apiError{Code: code, Message: message, Details: details},
		RequestID: w.Header().Get("X-Request-ID"),
	})
}

// decodeJSON lê um corpo JSON limitado em tamanho. Retorna um erro já "amigável".
func decodeJSON(w http.ResponseWriter, r *http.Request, dst any, maxBytes int64) error {
	if !strings.Contains(strings.ToLower(r.Header.Get("Content-Type")), "application/json") {
		return errors.New("o corpo deve ser application/json")
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		return errors.New("JSON inválido ou grande demais")
	}
	return nil
}
