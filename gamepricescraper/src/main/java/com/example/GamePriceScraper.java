package com.example;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;



public class GamePriceScraper {
    public static void main(String[] args) {
        scrapeSteam();
        scrapeGOG();
        scrapeGamivo();
        scrapeK4g();
        scrapeAmazon();
    }

    private static void scrapeSteam() {
        // Replace with the actual URL and CSS selectors for Steam
        scrapeWebsite("https://store.steampowered.com/", "CSS_SELECTOR_FOR_STEAM");
    }

    private static void scrapeGOG() {
        // Replace with the actual URL and CSS selectors for GOG
        scrapeWebsite("https://www.gog.com/", "CSS_SELECTOR_FOR_GOG");
    }

    private static void scrapeGamivo() {
        // Replace with the actual URL and CSS selectors for Gamivo
        scrapeWebsite("https://www.gamivo.com/", "CSS_SELECTOR_FOR_GAMIVO");
    }

    private static void scrapeK4g() {
        // Replace with the actual URL and CSS selectors for K4g
        scrapeWebsite("https://k4g.com/", "CSS_SELECTOR_FOR_K4G");
    }

    private static void scrapeAmazon() {
        // Replace with the actual URL and CSS selectors for Amazon
        scrapeWebsite("https://amazon.com/", "CSS_SELECTOR_FOR_AMAZON");
    }

    private static void scrapeWebsite(String url, String cssSelector) {
        try {
            Document document = Jsoup.connect(url).get();
            Elements elements = document.select(cssSelector);

            for (Element element : elements) {
                // Extract and process data from each element
                String gameTitle = element.text(); // This is an example, adjust according to actual HTML structure
                System.out.println(gameTitle);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
