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
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;



public class GamePriceScraper {
	
    public static void main(String[] args) {
    	
        ExecutorService executorService = Executors.newFixedThreadPool(5); // Correct number of threads if needed

        WebDriverManager.chromedriver().browserVersion("119.0.6045.160").setup();

        // Submit each scrape task to the executor service
        executorService.submit(() -> scrapeGOG());
        executorService.submit(() -> scrapeK4g());
        executorService.submit(() -> scrapeAmazon());
        executorService.submit(() -> scrapeSteamAction());


        // Initiates an orderly shutdown
        executorService.shutdown();
    }
    
    private static void scrapeSteamAction() {
        int titlesToScrape = 500;
        int titlesScraped = 0;
        int start = 0; // Pagination parameter for Steam search URL
        String platform = "Steam";

        try {
            while (titlesScraped < titlesToScrape) {
                String gameUrl = "https://store.steampowered.com/search/?term=action&start=" + start + "&count=50";
                Document gamePage = Jsoup.connect(gameUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")
                    .referrer("http://www.google.com")
                    .get();

                Elements searchResults = gamePage.select("a.search_result_row");
                for (Element result : searchResults) {
                    if (titlesScraped >= titlesToScrape) {
                        break;
                    }
                    
                    // Extract the title
                    String title = result.select("span.title").text();
                    
                    // Extract the price or 'Free' text
                    String priceText = result.select("div.discount_final_price").text();
                    
                    // Print out the game title, price, and platform
                    System.out.println("Game: " + title + " - Price: " + (priceText.isEmpty() ? "Price not available" : priceText) + " - Platform: " + platform);
                    
                    titlesScraped++;
                }
                
                start += 50; // Assuming each page shows 50 titles, adjust this number if different
                // Sleep between requests to respect Steam's server load
                Thread.sleep(1000); // Sleep for 1 second
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


	private static void scrapeGOG() {
	    // Set up WebDriverManager to download and set up the ChromeDriver binary
	    System.setProperty("webdriver.chrome.driver", "C:\\Users\\joomu\\Downloads\\chromedriver-win64\\chromedriver-win64\\chromedriver.exe");
	
	    ChromeOptions options = new ChromeOptions();
	    options.addArguments("--headless"); // Run in headless mode (no browser UI)
	
	    WebDriver driver = new ChromeDriver(options);
	
	    try {
	        driver.get("https://www.gog.com/en/game/the_witcher_3_wild_hunt_game_of_the_year_edition");
	
	        // Wait for the title and price elements to be present on the page
	        WebElement titleElement = driver.findElement(By.cssSelector("h1.productcard-basics__title"));
	        WebElement priceElement = driver.findElement(By.cssSelector("span.product-actions-price__final-amount"));
	
	        // Get the text of the elements, which should contain the title and the price
	        String title = titleElement.getText();
	        String price = priceElement.getText();
	
	        // Print the title and price
	        System.out.println("Title: " + title + " - Price: " + price);
	    } catch (Exception e) {
	        System.err.println("Error scraping GOG: " + e.getMessage());
	    } finally {
	        // Close the browser
	        driver.quit();
	    }
	}
	private static void scrapeGOGAction() {
	    WebDriverManager.chromedriver().setup();
	    ChromeOptions options = new ChromeOptions();
	    options.addArguments("--headless"); // Run in headless mode (no browser UI)

	    WebDriver driver = new ChromeDriver(options);
	    int titlesScraped = 0;
	    int pageNumber = 1;

	    try {
	        while (titlesScraped < 500) {
	            driver.get("https://www.gog.com/en/games?genres=action&page=" + pageNumber);

	            // Use WebDriverWait to wait for the game tiles to appear

	            WebDriverWait wait = new WebDriverWait(driver, 40); // 10 seconds
	            java.util.List<WebElement> gameTiles = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(By.cssSelector("product-tile")));

	            if (gameTiles.isEmpty()) {
	                // No more games found, break the loop
	                break;
	            }

	            for (WebElement gameTile : gameTiles) {
	                if (titlesScraped >= 500) {
	                    break; // If we have scraped 500 titles, exit the loop
	                }

	                // Extract the title
	                String title = gameTile.findElement(By.cssSelector(".product-tile__title")).getText();

	                // Extract the price
	                String price = gameTile.findElement(By.cssSelector(".product-price__final .final-value")).getText();

	                // Output the title and price
	                System.out.println("Title: " + title + " - Price: " + price);
	                titlesScraped++;
	            }

	            pageNumber++; // Go to the next page
	        }
	    } catch (Exception e) {
	        System.err.println("Error scraping GOG: " + e.getMessage());
	    } finally {
	        driver.quit(); // Ensure we close the driver after finishing
	    }
	}	

    private static void scrapeK4g() {
        // Replace with the actual URL and CSS selectors for K4g
        scrapeWebsite("https://k4g.com/", "CSS_SELECTOR_FOR_K4G");
    }

    private static void scrapeAmazon() {
        String gameUrl = "https://www.amazon.com/Witcher-3-Wild-Hunt-Complete-PC/dp/B01K6010DO/ref=sr_1_3?crid=DV69O9DWPCVD&keywords=The%2BWitcher%2B3%3A%2BWild%2BHunt&qid=1700505473&sprefix=the%2Bwitcher%2B3%2Bwild%2Bhunt%2Caps%2C408&sr=8-3&th=1";
        
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
