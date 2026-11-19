package store

import (
	"context"
	"testing"
	"time"
)

func TestAggregate(t *testing.T) {
	to := time.Date(2026, 11, 18, 0, 0, 0, 0, time.UTC)
	from := to.AddDate(0, 0, -6)
	at := func(d int) int64 { return from.AddDate(0, 0, d).Add(10 * time.Hour).Unix() }
	events := []Event{
		{TS: at(0), Type: EventPageView, Path: "/pt", Lang: "pt", Device: "desktop", Source: "direct", Session: "a"},
		{TS: at(0), Type: EventPageView, Path: "/pt/projects", Lang: "pt", Device: "desktop", Source: "direct", Session: "a"},
		{TS: at(1), Type: EventPageView, Path: "/en", Lang: "en", Device: "mobile", Source: "search", Session: "b"},
		{TS: at(1), Type: EventProjectView, Target: "banking-analytics", Path: "/pt/projects/banking-analytics", Lang: "pt", Session: "b"},
		{TS: at(2), Type: EventResumeDownload, Target: "pt", Path: "/pt/resume", Lang: "pt", Session: "c"},
	}
	s := Aggregate(events, from, to)
	if s.Days != 7 || len(s.Daily) != 7 {
		t.Fatalf("período incorreto: %d dias, %d pontos", s.Days, len(s.Daily))
	}
	if s.TotalPageViews != 3 || s.TotalSessions != 2 || s.ProjectViews != 1 || s.ResumeDownloads != 1 {
		t.Fatalf("totais incorretos: %+v", s)
	}
	if s.Daily[0].PageViews != 2 || s.Daily[0].Sessions != 1 {
		t.Fatalf("série diária incorreta: %+v", s.Daily[0])
	}
}

func TestMemoryDedupeAndHit(t *testing.T) {
	m := NewMemory()
	ctx := context.Background()
	if ok, _ := m.InsertEvent(ctx, Event{Dedupe: "x", TS: 1}); !ok {
		t.Fatal("primeiro evento deveria ser gravado")
	}
	if ok, _ := m.InsertEvent(ctx, Event{Dedupe: "x", TS: 1}); ok {
		t.Fatal("evento duplicado deveria ser ignorado")
	}
	now := time.Now()
	for i := 1; i <= 3; i++ {
		if n, _ := m.Hit(ctx, "k", time.Hour, now); n != i {
			t.Fatalf("contador esperado %d, veio %d", i, n)
		}
	}
}
