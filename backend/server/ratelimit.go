package server

import (
	"sync"
	"time"
)

// memLimiter é um limitador de janela fixa em memória (por instância).
// Em ambiente serverless cada instância tem o seu; para limites que precisam ser
// globais (contato e login) o servidor usa o contador persistente do banco.
type memLimiter struct {
	mu      sync.Mutex
	entries map[string]memEntry
}

type memEntry struct {
	window int64
	count  int
}

func newMemLimiter() *memLimiter { return &memLimiter{entries: map[string]memEntry{}} }

// hit registra uma requisição e devolve quantas já ocorreram na janela atual.
func (l *memLimiter) hit(key string, window time.Duration, now time.Time) int {
	l.mu.Lock()
	defer l.mu.Unlock()
	if len(l.entries) > 5000 {
		l.entries = map[string]memEntry{} // evita crescimento sem limite
	}
	w := now.Unix() / int64(window.Seconds())
	e := l.entries[key]
	if e.window != w {
		e = memEntry{window: w}
	}
	e.count++
	l.entries[key] = e
	return e.count
}
