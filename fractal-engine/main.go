package main

import "fractal-engine/routes"

func main() {
    r := routes.SetupRouter()
    
    r.Run(":6543") 
}