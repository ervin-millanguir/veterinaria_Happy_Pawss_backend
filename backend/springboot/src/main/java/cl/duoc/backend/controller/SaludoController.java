package cl.duoc.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SaludoController {

    @GetMapping("/saludo")
    public Map<String, String> saludo() {
        return Map.of(
            "mensaje", "Hoooooooola desde Spring Boot en EC2",
            "backend", "Spring Boot",
            "lenguaje", "Java"
        );
    }

    @PostMapping("/eco")
    public Map<String, Object> eco(@RequestBody Map<String, Object> datos) {
        return Map.of(
            "mensaje", "Datos recibidos correctamente",
            "datos", datos
        );
    }
}