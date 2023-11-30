package com.example.entity;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "games")
public class Game {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "platform", nullable = false, length = 50)
    private String platform;
    

    // No-argument constructor is required by Hibernate
    public Game() {
    }

    // Getters and setters for all fields
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getPrice() {
        return price;
    }

    // Here, you might want to add logic to handle conversion from a String to a BigDecimal
    public void setPrice(String priceText) {
        if (priceText != null && !priceText.isEmpty()) {
            try {
                this.price = new BigDecimal(priceText.replaceAll("[^\\d.]", ""));
            } catch (NumberFormatException e) {
                this.price = null; // or BigDecimal.ZERO, if that's more appropriate
            }
        } else {
            this.price = null; // or BigDecimal.ZERO
        }
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    // Consider adding an 'equals' and 'hashCode' method as well, if needed
}
