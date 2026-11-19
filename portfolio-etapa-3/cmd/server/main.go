// Comando server executa a mesma API localmente (go run ./cmd/server).
package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/maxgodoydev/portfolio/backend/config"
	"github.com/maxgodoydev/portfolio/backend/server"
)

func main() {
	cfg := config.Load()
	log := server.NewLogger()
	api := server.New(cfg, server.StoreFromConfig(cfg, log), log)

	httpServer := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           api,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      20 * time.Second,
	}

	go func() {
		log.Info("API iniciada", "addr", httpServer.Addr, "env", cfg.Env)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("falha no servidor", "error", err.Error())
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = httpServer.Shutdown(ctx)
}
