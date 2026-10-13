package com.canteen.repository;

import com.canteen.model.CanteenOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

public interface CanteenOrderRepository extends JpaRepository<CanteenOrder, Long> {
    @Override
    @EntityGraph(attributePaths = "foodItem")
    List<CanteenOrder> findAll();
    @Override
    @EntityGraph(attributePaths = "foodItem")
    Optional<CanteenOrder> findById(Long id);
}
