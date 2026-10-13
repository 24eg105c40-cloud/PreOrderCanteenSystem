package com.canteen.controller;

import com.canteen.model.CanteenOrder;
import com.canteen.model.FoodItem;
import com.canteen.repository.CanteenOrderRepository;
import com.canteen.repository.FoodItemRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final CanteenOrderRepository orders;
    private final FoodItemRepository foods;
    private static final Set<String> STATUSES = Set.of("PLACED", "PREPARING", "READY", "COLLECTED", "CANCELLED");

    public OrderController(CanteenOrderRepository orders, FoodItemRepository foods) {
        this.orders = orders; this.foods = foods;
    }

    @GetMapping
    public java.util.List<CanteenOrder> all() { return orders.findAll(); }

    @GetMapping("/{id}")
    public CanteenOrder one(@PathVariable Long id) {
        return orders.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    public record CreateOrderRequest(@jakarta.validation.constraints.NotBlank String customerName,
                                     @jakarta.validation.constraints.NotBlank String customerPhone,
                                     @jakarta.validation.constraints.NotNull Long foodItemId,
                                     @jakarta.validation.constraints.Min(1) @jakarta.validation.constraints.Max(50) int quantity,
                                     @jakarta.validation.constraints.NotNull java.time.LocalDateTime pickupTime) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CanteenOrder create(@Valid @RequestBody CreateOrderRequest request) {
        FoodItem food = foods.findById(request.foodItemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid food item"));
        if (!food.isAvailable()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This food item is unavailable");
        if (request.pickupTime().isBefore(java.time.LocalDateTime.now()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup time must be in the future");
        CanteenOrder order = new CanteenOrder();
        order.setCustomerName(request.customerName());
        order.setCustomerPhone(request.customerPhone());
        order.setFoodItem(food);
        order.setQuantity(request.quantity());
        order.setPickupTime(request.pickupTime());
        order.setStatus("PLACED");
        order.setTotalPrice(food.getPrice().multiply(java.math.BigDecimal.valueOf(request.quantity())));
        return orders.save(order);
    }

    @PutMapping("/{id}/status")
    public CanteenOrder updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "").toUpperCase();
        if (!STATUSES.contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status");
        CanteenOrder order = one(id);
        order.setStatus(status);
        return orders.save(order);
    }
}
