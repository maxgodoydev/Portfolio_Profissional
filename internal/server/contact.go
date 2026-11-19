package server

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/mail"
	"strings"
	"time"
	"unicode"
)

// resendEndpoint é a API de envio do Resend.
const resendEndpoint = "https://api.resend.com/emails"

type contactIn struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
	Lang    string `json:"lang"`
	Website string `json:"website"` // honeypot: pessoas não preenchem este campo
}

// cleanLine remove caracteres de controle (evita injeção de cabeçalhos) e espaços extras.
func cleanLine(s string) string {
	s = strings.Map(func(r rune) rune {
		if unicode.IsControl(r) {
			return ' '
		}
		return r
	}, s)
	return strings.Join(strings.Fields(s), " ")
}

func validateContact(in contactIn) (contactIn, map[string]string) {
	errs := map[string]string{}
	in.Name = cleanLine(in.Name)
	in.Email = strings.TrimSpace(in.Email)
	in.Message = strings.TrimSpace(in.Message)

	if n := len([]rune(in.Name)); n < 2 || n > 100 {
		errs["name"] = "informe um nome entre 2 e 100 caracteres"
	}
	if len(in.Email) > 254 {
		errs["email"] = "e-mail muito longo"
	} else if addr, err := mail.ParseAddress(in.Email); err != nil || addr.Address != in.Email || !strings.Contains(in.Email[strings.LastIndex(in.Email, "@"):], ".") {
		errs["email"] = "e-mail inválido"
	}
	if n := len([]rune(in.Message)); n < 10 || n > 4000 {
		errs["message"] = "a mensagem deve ter entre 10 e 4000 caracteres"
	}
	if !validLangs[in.Lang] {
		in.Lang = "pt"
	}
	if len(errs) > 0 {
		return in, errs
	}
	return in, nil
}

func (s *Server) handleContact(w http.ResponseWriter, r *http.Request) {
	var in contactIn
	if err := decodeJSON(w, r, &in, 16<<10); err != nil {
		s.fail(w, http.StatusBadRequest, "invalid_body", err.Error(), nil)
		return
	}
	// Honeypot: finge sucesso para não ensinar o robô a contornar.
	if strings.TrimSpace(in.Website) != "" {
		s.ok(w, http.StatusOK, map[string]any{"sent": true})
		return
	}
	in, errs := validateContact(in)
	if errs != nil {
		s.fail(w, http.StatusUnprocessableEntity, "validation_error", "Verifique os campos do formulário.", errs)
		return
	}
	if !s.cfg.ContactEnabled() {
		s.fail(w, http.StatusServiceUnavailable, "contact_unavailable", "O envio de mensagens não está configurado no momento.", nil)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	if !s.allow(ctx, "contact", s.limitKey(r), 3, time.Hour) {
		w.Header().Set("Retry-After", "3600")
		s.fail(w, http.StatusTooManyRequests, "rate_limited", "Limite de mensagens atingido. Tente novamente mais tarde.", nil)
		return
	}

	if err := s.sendEmail(ctx, in); err != nil {
		s.log.Error("falha ao enviar e-mail de contato", "error", err.Error())
		s.fail(w, http.StatusBadGateway, "email_failed", "Não foi possível enviar a mensagem agora.", nil)
		return
	}
	s.ok(w, http.StatusOK, map[string]any{"sent": true})
}

// sendEmail envia a mensagem pela API HTTP do Resend. A mensagem não é gravada em banco.
func (s *Server) sendEmail(ctx context.Context, in contactIn) error {
	body, err := json.Marshal(map[string]any{
		"from":     s.cfg.ContactFrom,
		"to":       []string{s.cfg.ContactTo},
		"reply_to": in.Email,
		"subject":  "Portfólio — mensagem de " + in.Name,
		"text":     fmt.Sprintf("Nome: %s\nE-mail: %s\nIdioma do site: %s\n\n%s\n", in.Name, in.Email, in.Lang, in.Message),
	})
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.resendURL, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.cfg.ResendAPIKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := (&http.Client{Timeout: 8 * time.Second}).Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return fmt.Errorf("serviço de e-mail respondeu %d", resp.StatusCode)
	}
	return nil
}
