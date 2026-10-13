package com.canteen.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "canteen_orders")
public class CanteenOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Size(max = 100)
    private String customerName;
    @NotBlank @Size(max = 30)
    private String customerPhone;
    @ManyToOne(optional = false)
    private FoodItem foodItem;
    @Min(1) @Max(50)
    private int quantity;
    @NotNull
    private LocalDateTime pickupTime;
    @Column(precision = 10, scale = 2)
    private BigDecimal totalPrice;
    private String status = "PLACED";
    private LocalDateTime createdAt = LocalDateTime.now();

    public CanteenOrder() {}
    @PrePersist
    void beforeSave() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null || status.isBlank()) status = "PLACED";
        if (foodItem != null && foodItem.getPrice() != null)
            totalPrice = foodItem.getPrice().multiply(BigDecimal.valueOf(quantity));
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public FoodItem getFoodItem() { return foodItem; }
    public void setFoodItem(FoodItem foodItem) { this.foodItem = foodItem; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public LocalDateTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalDateTime pickupTime) { this.pickupTime = pickupTime; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
