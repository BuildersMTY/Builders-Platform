# El paquete fmt

El paquete `fmt` implementa I/O formateado. Las funciones más comunes:

- `fmt.Println(args...)` — imprime seguido de newline
- `fmt.Sprintf(format, args...)` — regresa un string formateado

## Ejemplo

```go
msg := fmt.Sprintf("Hola, %s!", nombre)
fmt.Println(msg)
```
