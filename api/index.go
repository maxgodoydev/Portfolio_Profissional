// Package handler é o ponto de entrada da função serverless Go na Vercel.
// O vercel.json reescreve /api/* para /api/index?path=*, e o roteamento acontece em internal/server.
package handler

import (
	"net/http"
	"sync"

	"github.com/maxgodoydev/portfolio/internal/config"
	"github.com/maxgodoydev/portfolio/internal/server"
)

var (
	once sync.Once
	srv  *server.Server
)

// Handler atende todas as rotas da API.
func Handler(w http.ResponseWriter, r *http.Request) {
	once.Do(func() {
		cfg := config.Load()
		log := server.NewLogger()
		srv = server.New(cfg, server.StoreFromConfig(cfg, log), log)
	})
	srv.ServeHTTP(w, r)
}
