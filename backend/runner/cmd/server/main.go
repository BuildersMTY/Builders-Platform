package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"buildmancer/runner/internal/handler"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
	}
	http.HandleFunc("/run", handler.HandleRun)
	addr := fmt.Sprintf(":%s", port)
	log.Printf("Buildmancer runner listening on %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
