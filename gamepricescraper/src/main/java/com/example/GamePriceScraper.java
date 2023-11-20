package com.example;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;



public class GamePriceScraper {
	
    public static void main(String[] args) {
    	
    	
    	WebDriverManager.chromedriver().browserVersion("119.0.6045.160").setup();
        scrapeSteam();
        scrapeGOG();
        scrapeK4g();
        scrapeAmazon();
    }

    private static void scrapeSteam() {
        String gameUrl = "https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/";
        
        try {
            Document gamePage = Jsoup.connect(gameUrl)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")
                .referrer("http://www.google.com")
                .timeout(10 * 1000)
                .get();

            // Select the container that includes both the title and the price
            Elements gameEditions = gamePage.select("div.game_area_purchase_game");

            for (Element edition : gameEditions) {
                // Extract the title
                String title = edition.select("h1").text();

                // Extract the price string
                String priceText = edition.select("div.game_purchase_price").text();

                // Check if the price string is not empty
                if (!priceText.isEmpty()) {
                    System.out.println("Game: " + title + " - Price: " + priceText);
                } else {
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void scrapeGOG() {
        // Set up WebDriverManager to download and set up the ChromeDriver binary
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); // Run in headless mode (no browser UI)

        WebDriver driver = new ChromeDriver(options);

        try {
            driver.get("https://www.gog.com/en/game/the_witcher_3_wild_hunt_game_of_the_year_edition");

            // Wait for the price element to be present on the page
            WebElement priceElement = driver.findElement(By.cssSelector("span.product-actions-price__final-amount"));

            // Get the text of the element, which should contain the price
            String price = priceElement.getText();

            // Print the price
            System.out.println("Price: " + price);
        } catch (Exception e) {
            System.err.println("Error scraping GOG: " + e.getMessage());
        } finally {
            // Close the browser
            driver.quit();
        }
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
        	Document document = Jsoup.connect(url)
        			  .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")
        			  .referrer("http://www.google.com")
        			  .timeout(10 * 1000) // 10 seconds
        			  .header("Accept", "text/html")
		        	  .header("Accept-Encoding", "gzip, deflate, br")
		        	  .header("Accept-Language", "en-US,en;q=0.5")
		        	  .header("Connection", "keep-alive")
		        	  .get();

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
