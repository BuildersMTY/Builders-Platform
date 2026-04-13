package models

type RunRequest struct {
	RunID    string            `json:"run_id"`
	Language string            `json:"language"`
	BuildCmd string            `json:"build_cmd"`
	RunCmd   string            `json:"run_cmd"`
	UnitCmd  string            `json:"unit_cmd"`
	Files    map[string]string `json:"files"`
	Tests    []TestSpec        `json:"tests"`
}

type TestSpec struct {
	Type                   string        `json:"type"`
	Match                  string        `json:"match,omitempty"`
	Stdin                  string        `json:"stdin,omitempty"`
	ExpectedStdout         string        `json:"expected_stdout,omitempty"`
	ExpectedStdoutContains string        `json:"expected_stdout_contains,omitempty"`
	TimeoutMs              int           `json:"timeout_ms"`
	Request                *HTTPRequest  `json:"request,omitempty"`
	Expected               *HTTPExpected `json:"expected,omitempty"`
	Port                   int           `json:"port,omitempty"`
	Send                   string        `json:"send,omitempty"`
	SendHex                string        `json:"send_hex,omitempty"`
	ExpectedResponse       string        `json:"expected_response,omitempty"`
	ExpectedHex            string        `json:"expected_hex,omitempty"`
	FileContent            string        `json:"file_content,omitempty"`
	ManagesLifecycle       bool          `json:"manages_lifecycle"`
}

type HTTPRequest struct {
	Method  string            `json:"method"`
	Path    string            `json:"path"`
	Headers map[string]string `json:"headers,omitempty"`
	Body    string            `json:"body,omitempty"`
}

type HTTPExpected struct {
	Status       int               `json:"status,omitempty"`
	BodyContains string            `json:"body_contains,omitempty"`
	BodyEquals   string            `json:"body_equals,omitempty"`
	Headers      map[string]string `json:"headers,omitempty"`
}
