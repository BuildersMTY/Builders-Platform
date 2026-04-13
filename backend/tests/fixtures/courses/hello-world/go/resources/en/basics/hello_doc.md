# The fmt package

The `fmt` package implements formatted I/O. Most common functions:

- `fmt.Println(args...)` — prints followed by a newline
- `fmt.Sprintf(format, args...)` — returns a formatted string

## Example

```go
msg := fmt.Sprintf("Hello, %s!", name)
fmt.Println(msg)
```
