package com.example.entity;

import javax.persistence.*;

@Entity
@Table(name = "game_requirements")
public class GameRequirements {

    @Id
    private int gameId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "game_id")
    private Game game;

    @Column(name = "os")
    private String os;

    @Column(name = "processor")
    private String processor;

    @Column(name = "memory")
    private String memory;

    @Column(name = "graphics")
    private String graphics;

    @Column(name = "directx")
    private String directx;

    @Column(name = "network")
    private String network;

    @Column(name = "storage")
    private String storage;
    // Getters and setters
    public int getGameId() {
        return gameId;
    }

    public void setGameId(int gameId) {
        this.gameId = gameId;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public String getOs() {
        return os;
    }

    public void setOs(String os) {
        this.os = os;
    }

    public String getProcessor() {
        return processor;
    }

    public void setProcessor(String processor) {
        this.processor = processor;
    }

    public String getMemory() {
        return memory;
    }

    public void setMemory(String memory) {
        this.memory = memory;
    }

    public String getGraphics() {
        return graphics;
    }

    public void setGraphics(String graphics) {
        this.graphics = graphics;
    }

    public String getDirectx() {
        return directx;
    }

    public void setDirectx(String directx) {
        this.directx = directx;
    }

    public String getNetwork() {
        return network;
    }

    public void setNetwork(String network) {
        this.network = network;
    }

    public String getStorage() {
        return storage;
    }

    public void setStorage(String storage) {
        this.storage = storage;
    }
}
