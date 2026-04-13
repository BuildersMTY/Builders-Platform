package dispatch

import (
	"testing"
)

func TestGetKnownTypes(t *testing.T) {
	known := []string{"unit", "stdout", "http", "tcp", "script"}
	for _, tt := range known {
		d, err := Get(tt)
		if err != nil {
			t.Errorf("Get(%q) unexpected error: %v", tt, err)
		}
		if d == nil {
			t.Errorf("Get(%q) returned nil dispatcher", tt)
		}
	}
}

func TestGetUnknownType(t *testing.T) {
	_, err := Get("bogus")
	if err == nil {
		t.Error("expected error for unknown type, got nil")
	}
}
