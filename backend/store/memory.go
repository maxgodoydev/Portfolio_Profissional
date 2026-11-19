package store

import (
	"context"
	"sync"
	"time"
)

// Memory guarda tudo em memória. Serve para desenvolvimento local e testes.
// Em produção (serverless) os dados NÃO persistem: use Turso.
type Memory struct {
	mu     sync.Mutex
	events []Event
	seen   map[string]struct{}
	hits   map[string]memHit
}

type memHit struct {
	window int64
	count  int
}

// NewMemory cria um armazenamento volátil.
func NewMemory() *Memory {
	return &Memory{seen: map[string]struct{}{}, hits: map[string]memHit{}}
}

func (m *Memory) Kind() string                   { return "memory" }
func (m *Memory) Persistent() bool               { return false }
func (m *Memory) Ping(ctx context.Context) error { return nil }

func (m *Memory) InsertEvent(ctx context.Context, e Event) (bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, dup := m.seen[e.Dedupe]; dup {
		return false, nil
	}
	m.seen[e.Dedupe] = struct{}{}
	m.events = append(m.events, e)
	return true, nil
}

func (m *Memory) EventsSince(ctx context.Context, since time.Time) ([]Event, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var out []Event
	for _, e := range m.events {
		if e.TS >= since.Unix() {
			out = append(out, e)
		}
	}
	return out, nil
}

func (m *Memory) Hit(ctx context.Context, key string, window time.Duration, now time.Time) (int, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	w := now.Unix() / int64(window.Seconds())
	h := m.hits[key]
	if h.window != w {
		h = memHit{window: w}
	}
	h.count++
	m.hits[key] = h
	return h.count, nil
}

func (m *Memory) Prune(ctx context.Context, before time.Time) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	kept := m.events[:0]
	for _, e := range m.events {
		if e.TS >= before.Unix() {
			kept = append(kept, e)
		}
	}
	m.events = kept
	return nil
}
