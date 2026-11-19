package store

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Turso fala com o banco libSQL pela API HTTP (/v2/pipeline), usando só a biblioteca
// padrão. Isso evita drivers nativos e funciona bem em funções serverless.
type Turso struct {
	endpoint string
	token    string
	client   *http.Client

	mu    sync.Mutex
	ready bool
}

// NewTurso aceita URLs libsql:// ou https://.
func NewTurso(databaseURL, token string) (*Turso, error) {
	u := strings.TrimSpace(databaseURL)
	if u == "" || token == "" {
		return nil, errors.New("turso: URL e token são obrigatórios")
	}
	u = strings.Replace(u, "libsql://", "https://", 1)
	if !strings.HasPrefix(u, "https://") {
		return nil, errors.New("turso: a URL deve começar com libsql:// ou https://")
	}
	return &Turso{
		endpoint: strings.TrimRight(u, "/") + "/v2/pipeline",
		token:    token,
		client:   &http.Client{Timeout: 8 * time.Second},
	}, nil
}

func (t *Turso) Kind() string     { return "turso" }
func (t *Turso) Persistent() bool { return true }

// ---- protocolo ----

type tArg struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

type tStmt struct {
	SQL  string `json:"sql"`
	Args []tArg `json:"args,omitempty"`
}

type tRequest struct {
	Type string `json:"type"`
	Stmt *tStmt `json:"stmt,omitempty"`
}

type tValue struct {
	Type  string          `json:"type"`
	Value json.RawMessage `json:"value"`
}

type tResult struct {
	Rows     [][]tValue `json:"rows"`
	Affected int64      `json:"affected_row_count"`
}

type tItem struct {
	Type     string `json:"type"`
	Response struct {
		Type   string  `json:"type"`
		Result tResult `json:"result"`
	} `json:"response"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

type tPipelineResponse struct {
	Results []tItem `json:"results"`
}

func text(s string) tArg   { return tArg{Type: "text", Value: s} }
func integer(n int64) tArg { return tArg{Type: "integer", Value: strconv.FormatInt(n, 10)} }

func (v tValue) str() string {
	var s string
	if err := json.Unmarshal(v.Value, &s); err == nil {
		return s
	}
	return strings.Trim(string(v.Value), `"`)
}

func (v tValue) int() int64 {
	n, _ := strconv.ParseInt(v.str(), 10, 64)
	return n
}

// run executa as instruções em sequência, na mesma requisição HTTP.
func (t *Turso) run(ctx context.Context, stmts ...tStmt) ([]tResult, error) {
	reqs := make([]tRequest, 0, len(stmts)+1)
	for i := range stmts {
		reqs = append(reqs, tRequest{Type: "execute", Stmt: &stmts[i]})
	}
	reqs = append(reqs, tRequest{Type: "close"})

	body, err := json.Marshal(map[string]any{"requests": reqs})
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, t.endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+t.token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := t.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("turso: requisição falhou: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("turso: status HTTP %d", resp.StatusCode)
	}

	var parsed tPipelineResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return nil, fmt.Errorf("turso: resposta inválida: %w", err)
	}
	results := make([]tResult, 0, len(stmts))
	for i, item := range parsed.Results {
		if item.Type == "error" {
			msg := "erro desconhecido"
			if item.Error != nil {
				msg = item.Error.Message
			}
			return nil, fmt.Errorf("turso: instrução %d: %s", i, msg)
		}
		if i < len(stmts) {
			results = append(results, item.Response.Result)
		}
	}
	return results, nil
}

const schema = `
CREATE TABLE IF NOT EXISTS events (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,
  type    TEXT NOT NULL,
  path    TEXT NOT NULL,
  target  TEXT NOT NULL DEFAULT '',
  lang    TEXT NOT NULL,
  theme   TEXT NOT NULL DEFAULT '',
  device  TEXT NOT NULL DEFAULT '',
  source  TEXT NOT NULL DEFAULT '',
  session TEXT NOT NULL,
  dedupe  TEXT NOT NULL UNIQUE
)`

const schemaIdx = `CREATE INDEX IF NOT EXISTS events_ts ON events(ts)`

const schemaLimits = `
CREATE TABLE IF NOT EXISTS rate_limits (
  rkey   TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count  INTEGER NOT NULL,
  ts     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (rkey, bucket)
)`

// ensure cria as tabelas na primeira utilização de cada instância.
func (t *Turso) ensure(ctx context.Context) error {
	t.mu.Lock()
	defer t.mu.Unlock()
	if t.ready {
		return nil
	}
	if _, err := t.run(ctx, tStmt{SQL: schema}, tStmt{SQL: schemaIdx}, tStmt{SQL: schemaLimits}); err != nil {
		return err
	}
	t.ready = true
	return nil
}

func (t *Turso) Ping(ctx context.Context) error {
	if err := t.ensure(ctx); err != nil {
		return err
	}
	_, err := t.run(ctx, tStmt{SQL: "SELECT 1"})
	return err
}

func (t *Turso) InsertEvent(ctx context.Context, e Event) (bool, error) {
	if err := t.ensure(ctx); err != nil {
		return false, err
	}
	res, err := t.run(ctx, tStmt{
		SQL: `INSERT OR IGNORE INTO events (ts, type, path, target, lang, theme, device, source, session, dedupe)
		      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		Args: []tArg{
			integer(e.TS), text(e.Type), text(e.Path), text(e.Target), text(e.Lang),
			text(e.Theme), text(e.Device), text(e.Source), text(e.Session), text(e.Dedupe),
		},
	})
	if err != nil {
		return false, err
	}
	return len(res) > 0 && res[0].Affected > 0, nil
}

func (t *Turso) EventsSince(ctx context.Context, since time.Time) ([]Event, error) {
	if err := t.ensure(ctx); err != nil {
		return nil, err
	}
	res, err := t.run(ctx, tStmt{
		SQL: `SELECT ts, type, path, target, lang, theme, device, source, session
		      FROM events WHERE ts >= ? ORDER BY ts DESC LIMIT 100000`,
		Args: []tArg{integer(since.Unix())},
	})
	if err != nil || len(res) == 0 {
		return nil, err
	}
	out := make([]Event, 0, len(res[0].Rows))
	for _, r := range res[0].Rows {
		if len(r) < 9 {
			continue
		}
		out = append(out, Event{
			TS: r[0].int(), Type: r[1].str(), Path: r[2].str(), Target: r[3].str(), Lang: r[4].str(),
			Theme: r[5].str(), Device: r[6].str(), Source: r[7].str(), Session: r[8].str(),
		})
	}
	return out, nil
}

func (t *Turso) Hit(ctx context.Context, key string, window time.Duration, now time.Time) (int, error) {
	if err := t.ensure(ctx); err != nil {
		return 0, err
	}
	w := now.Unix() / int64(window.Seconds())
	res, err := t.run(ctx, tStmt{
		SQL: `INSERT INTO rate_limits (rkey, bucket, count, ts) VALUES (?, ?, 1, ?)
		      ON CONFLICT(rkey, bucket) DO UPDATE SET count = count + 1, ts = excluded.ts
		      RETURNING count`,
		Args: []tArg{text(key), integer(w), integer(now.Unix())},
	})
	if err != nil {
		return 0, err
	}
	if len(res) == 0 || len(res[0].Rows) == 0 || len(res[0].Rows[0]) == 0 {
		return 0, errors.New("turso: contador indisponível")
	}
	return int(res[0].Rows[0][0].int()), nil
}

func (t *Turso) Prune(ctx context.Context, before time.Time) error {
	if err := t.ensure(ctx); err != nil {
		return err
	}
	_, err := t.run(ctx,
		tStmt{SQL: "DELETE FROM events WHERE ts < ?", Args: []tArg{integer(before.Unix())}},
		tStmt{SQL: "DELETE FROM rate_limits WHERE ts < ?", Args: []tArg{integer(time.Now().Add(-48 * time.Hour).Unix())}},
	)
	return err
}
