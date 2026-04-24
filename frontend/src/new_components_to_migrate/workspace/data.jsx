/* Sample course data modeled on the http-server course */
const COURSE = {
  title: "HTTP Server from Scratch",
  language: "go",
  lang_label: "Go",
  modules: [
    {
      id: "tcp",
      title: "TCP foundations",
      submodules: [
        { id: "listen", full_id: "tcp/listen", title: "Listener & accept loop", passed: true },
        { id: "handle", full_id: "tcp/handle", title: "Connection handler", passed: true },
      ],
    },
    {
      id: "http",
      title: "HTTP parsing",
      submodules: [
        { id: "request", full_id: "http/request", title: "Parse the request line", passed: true },
        { id: "headers", full_id: "http/headers", title: "Parse headers", passed: true },
        {
          id: "response",
          full_id: "http/response",
          title: "Write the response",
          passed: false,
          active: true,
          goal: "Make the server write a proper HTTP response: status line, headers and body, in that order.",
          spec: "Implement Response.Write: it must write the status line (HTTP/1.1, code, reason), each header as \"Key: Value\\r\\n\", then a blank line, then the body bytes. Use bufio.Writer to batch the writes and Flush at the end.",
          stubs: [
            { path: "http/response.go", lines: 48 },
            { path: "http/status.go", lines: 22 },
          ],
          tests: [
            { id: "t1", desc: "GET / returns 200 with status line", status: "pass", dur: 12 },
            { id: "t2", desc: "Content-Length header is present", status: "pass", dur: 8 },
            {
              id: "t3",
              desc: "Content-Type maps .css to text/css",
              status: "fail",
              dur: 14,
              expected: "text/css",
              actual: "text/html",
              expectedBytes: "HTTP/1.1 200 OK\r\nContent-Type: text/css\r\nContent-Length: 218\r\n\r\nbody { color: #ff2b2b; }",
              actualBytes:   "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: 218\r\n\r\nbody { color: #ff2b2b; }",
              hint: "Check getMimeType — it should map the \".css\" extension to \"text/css\" before you call SetHeader.",
            },
            { id: "t4", desc: "Response body matches file contents", status: "pass", dur: 21 },
            { id: "t5", desc: "Blank line separates headers and body", status: "pending" },
          ],
          resources: [
            { id: "r1", title: "HTTP/1.1 response format", type: "doc", stage: 0 },
            { id: "r2", title: "bufio.Writer signature", type: "signature", stage: 1 },
            { id: "r3", title: "Hint — status line formatting", type: "hint", stage: 2 },
          ],
        },
      ],
    },
    {
      id: "router",
      title: "Routing & handlers",
      submodules: [
        { id: "mux", full_id: "router/mux", title: "ServeMux + path matching", passed: false },
        { id: "middleware", full_id: "router/middleware", title: "Middleware chain", passed: false },
      ],
    },
    {
      id: "perf",
      title: "Concurrency & timeouts",
      submodules: [
        { id: "pool", full_id: "perf/pool", title: "Goroutine pool", passed: false },
        { id: "timeouts", full_id: "perf/timeouts", title: "Read/write timeouts", passed: false },
        { id: "graceful", full_id: "perf/graceful", title: "Graceful shutdown", passed: false },
      ],
    },
  ],
};

/* Files in the working tree */
const FILES = [
  { path: "cmd/server/main.go", size: 412 },
  { path: "http/request.go", size: 1240 },
  { path: "http/headers.go", size: 680 },
  { path: "http/response.go", size: 1850, stub: true, modified: true },
  { path: "http/status.go", size: 460, stub: true },
  { path: "http/mime.go", size: 310 },
  { path: "router/mux.go", size: 900 },
  { path: "server/server.go", size: 1120 },
  { path: "go.mod", size: 68 },
  { path: "README.md", size: 240 },
];

/* Code content for the active editor file */
const RESPONSE_GO = `package http

import (
\t"bufio"
\t"fmt"
\t"io"
\t"strconv"
)

// Response is an HTTP/1.1 response being assembled.
type Response struct {
\tStatus  int
\tReason  string
\tHeaders Headers
\tBody    []byte
}

// Write emits the response to w using the HTTP/1.1 wire format:
//   HTTP/1.1 <status> <reason>\\r\\n
//   Key: Value\\r\\n (for each header)
//   \\r\\n
//   <body>
func (r *Response) Write(w io.Writer) error {
\tbw := bufio.NewWriter(w)

\t// 1. Status line
\tif _, err := fmt.Fprintf(bw, "HTTP/1.1 %d %s\\r\\n", r.Status, r.Reason); err != nil {
\t\treturn err
\t}

\t// 2. Headers — Content-Length is always written
\tr.Headers.Set("Content-Length", strconv.Itoa(len(r.Body)))
\tfor k, v := range r.Headers {
\t\tif _, err := fmt.Fprintf(bw, "%s: %s\\r\\n", k, v); err != nil {
\t\t\treturn err
\t\t}
\t}

\t// 3. Blank line + body
\tif _, err := bw.WriteString("\\r\\n"); err != nil {
\t\treturn err
\t}
\tif _, err := bw.Write(r.Body); err != nil {
\t\treturn err
\t}

\treturn bw.Flush()
}

// TODO: Content-Type detection — map extensions to MIME types here.
func getMimeType(ext string) string {
\tswitch ext {
\tcase ".html", ".htm":
\t\treturn "text/html"
\tcase ".json":
\t\treturn "application/json"
\t}
\treturn "text/html" // fallback — bug: .css files hit this branch
}
`;

window.COURSE = COURSE;
window.FILES = FILES;
window.RESPONSE_GO = RESPONSE_GO;
