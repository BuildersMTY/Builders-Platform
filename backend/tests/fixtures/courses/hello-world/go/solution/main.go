package main

import (
	"bufio"
	"fmt"
	"os"
)

func Hello() string {
	return "Hello, World!"
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	line, _ := reader.ReadString('\n')
	fmt.Print(line)
}
