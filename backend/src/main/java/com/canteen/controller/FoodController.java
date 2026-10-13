package com.canteen.controller;

import com.canteen.model.FoodItem;
import com.canteen.repository.FoodItemRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/foods")
public class FoodController {
    private final FoodItemRepository repository;
    public FoodController(FoodItemRepository repository) { this.repository = repository; }

    @GetMapping
    public List<FoodItem> all(@RequestParam(defaultValue = "false") boolean availableOnly) {
        return availableOnly ? repository.findByAvailableTrueOrderByNameAsc() : repository.findAll();
    }
    @GetMapping("/{id}")
    public FoodItem one(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food item not found"));
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FoodItem create(@Valid @RequestBody FoodItem food) {
        food.setId(null);
        return repository.save(food);
    }
    @PutMapping("/{id}")
    public FoodItem update(@PathVariable Long id, @Valid @RequestBody FoodItem input) {
        FoodItem food = one(id);
        food.setName(input.getName());
        food.setDescription(input.getDescription());
        food.setPrice(input.getPrice());
        food.setImageUrl(input.getImageUrl());
        food.setAvailable(input.isAvailable());
        return repository.save(food);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { repository.delete(one(id)); }
}
