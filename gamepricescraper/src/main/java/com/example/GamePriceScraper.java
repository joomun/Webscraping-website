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

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import org.hibernate.Session;
import org.hibernate.Transaction;
import com.example.entity.Game; // Make sure to import your Game entity class
import com.example.entity.GameRequirements;
import com.mysql.cj.Query;



public class GamePriceScraper {
	
    public static void main(String[] args) {
    	
        ExecutorService executorService = Executors.newFixedThreadPool(5); // Correct number of threads if needed


        // Submit each scrape task to the executor service
        executorService.submit(() -> scrapeGOGAction());
        executorService.submit(() -> scrapeK4g());
        //executorService.submit(() -> scrapeAmazon());
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

	                // Extract the title, price, and game URL
	                String title = result.select("span.title").text();
	                String priceText = result.select("div.discount_final_price").text();
	                Elements imageElements = result.select("div.col.search_capsule img");
	                String imageUrl = imageElements.attr("src"); // This gets the 'src' attribute of the 'img' tag
	                
	                System.out.println("Image link for game: " + imageUrl);
	                
	                
	                String gameUrl1 = result.attr("href"); // Extract the game URL
	                int exclamationIndex = gameUrl1.indexOf('?');
	                
	                //Do string manipulation on URL
	                if (exclamationIndex != -1) {
	                	gameUrl1 = gameUrl1.substring(0, exclamationIndex);
	                }
	                
	                Document gamePage1 = Jsoup.connect(gameUrl1)
	                	    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")
	                	    .referrer("http://www.google.com")
	                	    .get();

	                // Extract the description from the div with class 'game_description'
	                Elements descriptionElements = gamePage1.select("div.game_description");
	                String description = descriptionElements.text(); // This will get all the text inside the div without HTML tags
	                System.out.println("Game Url: " + gameUrl1);
	                
	                System.out.println("Description for game: " + description);
	                
	                Session session = HibernateUtil.getSessionFactory().openSession();
	                Transaction transaction = null;
	                

	                try {
	                	transaction = session.beginTransaction();
	                    // Check if the game already exists
	                    String queryStr = "FROM Game WHERE title = :title AND platform = :platform";
	                    org.hibernate.query.Query<Game> query = session.createQuery(queryStr, Game.class);
	                    query.setParameter("title", title);
	                    query.setParameter("platform", platform);
	                    Game game = query.uniqueResult();

	                    if (game == null) {
	                        // Create a new Game object if it doesn't exist
	                        game = new Game();
	                        game.setTitle(title);
	                        game.setPlatform(platform);
	                        
	                        game.setLastUpdated(LocalDateTime.now());
	                        String oldImageUrl = imageUrl;
	                        String newImageUrl = oldImageUrl.replace("capsule_sm_120", "capsule_616x353");
	                        game.setImageUrl(newImageUrl);
	                    }

	                    // Update the last updated time to now
	                    game.setLastUpdated(LocalDateTime.now());
	                    // Update or set the price and URL
	                    game.setPrice(priceText.isEmpty() ? null : priceText);
	                    game.setUrl(gameUrl1); // Assuming there's a setUrl method in Game class
                        String oldImageUrl = imageUrl;
                        String newImageUrl = oldImageUrl.replace("capsule_sm_120", "capsule_616x353");
                        game.setImageUrl(newImageUrl);
	                    
	                    // Save or update the game record
	                    session.saveOrUpdate(game);
	                    transaction.commit();
	                } catch (Exception e) {
	                    if (transaction != null) transaction.rollback();
	                    e.printStackTrace();
	                } 
	                
	                
	                try {
	                    transaction = session.beginTransaction();
	                    
	                    // Check if the game already exists
	                    String queryStr = "FROM Game WHERE title = :title AND platform = :platform";
	                    org.hibernate.query.Query<Game> query = session.createQuery(queryStr, Game.class);
	                    query.setParameter("title", title);
	                    query.setParameter("platform", platform);
	                    Game existingGame = query.uniqueResult(); // Retrieve the single result
	                    GameRequirements gameRequirements = null;
	                    
	                    if (existingGame != null) {
	                        // Check if GameRequirements for this game already exists
	                        String reqQueryStr = "FROM GameRequirements WHERE game = :game";
	                        org.hibernate.query.Query<GameRequirements> reqQuery = session.createQuery(reqQueryStr, GameRequirements.class);
	                        reqQuery.setParameter("game", existingGame);
	                        gameRequirements = reqQuery.uniqueResult(); // Retrieve the single result

	                        if (gameRequirements == null) {
	                            // If not found, create a new GameRequirements entity
	                            gameRequirements = new GameRequirements();
	                            gameRequirements.setGame(existingGame); // Associate the GameRequirements with the existing Game
	                            // Set the lastUpdated field to the current date and time
	                            gameRequirements.setLastUpdated(LocalDateTime.now());
	                        }

	                        // Whether it's a new or existing instance, update the fields
	                        Elements sysReqElements = gamePage1.select("div.game_area_sys_req_leftCol");
	                        Elements requirementsList = sysReqElements.select("ul.bb_ul > li");

	                        for (Element req : requirementsList) {
	                            String requirementType = req.select("strong").first().text().replace(":", "").trim();
	                            String requirementDetail = req.ownText().trim(); 
	                            // Set the lastUpdated field to the current date and time
	                            gameRequirements.setLastUpdated(LocalDateTime.now());
	                            // Map each requirement to the corresponding field in GameRequirements
	                            switch(requirementType.toLowerCase()) {
                                case "os":
                                    gameRequirements.setOs(requirementDetail);
                                    break;
                                case "processor":
                                    gameRequirements.setProcessor(requirementDetail);
                                    break;
                                case "memory":
                                    gameRequirements.setMemory(requirementDetail);
                                    break;
                                case "graphics":
                                    gameRequirements.setGraphics(requirementDetail);
                                    break;
                                case "network":
                                    gameRequirements.setNetwork(requirementDetail);
                                    break;
                                case "storage":
                                    gameRequirements.setStorage(requirementDetail);
                                    break;
                                // Add more cases if there are other fields
                            }
	                            // Optional: Print each requirement type and detail
	                            System.out.println(requirementType + ": " + requirementDetail);
	                        }
	                        
	                        // Save the new GameRequirements record
	                        session.saveOrUpdate(gameRequirements);
	                        transaction.commit();
	                    }
	                } catch (Exception e) {
	                	if (transaction != null) transaction.rollback();
	                    e.printStackTrace();

	                }finally {
	                	if (session != null) session.close();
	                    session.close();
	                }

	                titlesScraped++;
	            }
	
	            start += 50; // Assuming each page shows 50 titles
	            // Sleep between requests
	            Thread.sleep(1000); // Sleep for 1 second
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	    
	    
	}


	private static void scrapeGOGAction() {
		// Set up ChromeOptions
		ChromeOptions options = new ChromeOptions();
		options.setBinary("C:\\Users\\joomu\\AppData\\Local\\Chromium\\Application\\chrome.exe");
		options.addArguments("--headless");
		// Set the desired ChromeDriver version
		WebDriverManager.chromedriver().setup();

		// Initialize the ChromeDriver with the specified options
		WebDriver driver = new ChromeDriver(options);
		int gamesToScrape = 500;
		int gamesScraped = 0;
		int page = 1; // Start with page 1
		String platform = "GOG"; // Set the platform to GOG

		while (gamesScraped < gamesToScrape) {
		    // Build the URL for the current page
		    String url = "https://www.gog.com/en/games?genres=action&languages=en&hideDLCs=true&page=" + page;
		    
		    // Navigate to the GOG page
		    driver.get(url);
		    
		    // Sleep to ensure the page loads completely
		    try {
		        Thread.sleep(20000); // Sleep for 10 seconds
		    } catch (InterruptedException e) {
		        e.printStackTrace();
		    }

		    // Find all product tiles
		    List<WebElement> productTiles = driver.findElements(By.cssSelector("product-tile"));

		    // Iterate through the product tiles and extract information
		    for (WebElement productTile : productTiles) {
		        // Extract title
		        WebElement titleElement = productTile.findElement(By.cssSelector("span[_ngcontent-gogcom-store-c43]"));
		        String title = titleElement.getText();

		        // Extract final price
		        WebElement finalPriceElement = productTile.findElement(By.cssSelector("span[_ngcontent-gogcom-store-c40]"));
		        String price = finalPriceElement.getText();
		        
		        WebElement redirectionLinkElement = productTile.findElement(By.cssSelector("a.product-tile.product-tile--grid"));
		        String redirectionLink = redirectionLinkElement.getAttribute("href");
		        
		        WebElement imageElement = productTile.findElement(By.cssSelector("img.ng-star-inserted"));

		        // Get the 'src' attribute value (image URL)
		        String imageUrl = imageElement.getAttribute("src");
		        // Print or store the extracted information
		        System.out.println("Title: " + title);
		        System.out.println("Final Price: " + price);
		        System.out.println("Link: " + redirectionLink);
		        System.out.println("Image: " + imageUrl);
		        System.out.println("==============================================");
		        System.out.println("Game number: " + gamesScraped);
		        gamesScraped++;
		        Session session = HibernateUtil.getSessionFactory().openSession();
                Transaction transaction = null;

                try {
                	transaction = session.beginTransaction();
                    // Check if the game already exists
                    String queryStr = "FROM Game WHERE title = :title AND platform = :platform";
                    org.hibernate.query.Query<Game> query = session.createQuery(queryStr, Game.class);
                    query.setParameter("title", title);
                    query.setParameter("platform", platform);
                    Game game = query.uniqueResult();

                    if (game == null) {
                        // Create a new Game object if it doesn't exist
                        game = new Game();
                        game.setTitle(title);
                        game.setPlatform(platform);
                        
                        game.setLastUpdated(LocalDateTime.now());
                        game.setUrl(redirectionLink); 
                        game.setImageUrl(imageUrl);
                    }

                    // Update the last updated time to now
                    game.setLastUpdated(LocalDateTime.now());
                    // Update or set the price and URL
                    game.setPrice(price.isEmpty() ? null : price);
                    game.setImageUrl(imageUrl);
                    game.setUrl(redirectionLink); 
                    // Save or update the game record
                    session.saveOrUpdate(game);
                    transaction.commit();
                } catch (Exception e) {
                	if (transaction != null) transaction.rollback();
                    e.printStackTrace();

                }finally {
                	if (session != null) session.close();
                    session.close();
                }
		    }

		    // Check if the loop should exit
		    if (gamesScraped >= gamesToScrape) {
		        break;
		    }

		    // Increment the page number for the next iteration
		    page++;
		}
		// Close the browser
		driver.quit();

	}
    private static void scrapeK4g() {
        // Set up ChromeOptions
        ChromeOptions options = new ChromeOptions();
        options.setBinary("C:\\Users\\joomu\\AppData\\Local\\Chromium\\Application\\chrome.exe");
        options.addArguments("--headless");
        // Set the desired ChromeDriver version
        WebDriverManager.chromedriver().setup();

        // Initialize the ChromeDriver with the specified options
        WebDriver driver = new ChromeDriver(options);

        int gamesToScrape = 500;
        int gamesScraped = 0;
        int page = 1; // Start with page 1
        String platform="K4G";
        while (gamesScraped < gamesToScrape) {
            // Build the URL for the current page
            String url = "https://k4g.com/store/games?genre[]=1&language[]=2&page=" + page + "&product_type[]=1&show=100";
            // Navigate to the K4g page
            driver.get(url);
            try {
                Thread.sleep(40000); // Sleep for 10 seconds to ensure the page loads completely
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            // Find all containers with class "GridResults_card__4J3Ad"
            List<WebElement> containers = driver.findElements(By.className("GridResults_card__4J3Ad"));

            // Iterate through the containers and extract information
            for (WebElement container : containers) {
                // Extract title
                WebElement titleElement = container.findElement(By.className("GridResults_title__V99DP"));
                String title = titleElement.getText();
                // Remove "| CD Key" from the title if it exists
                title = title.replace(" CD Key", "");

                // Extract price
                WebElement priceElement = container.findElement(By.className("Price_price__3S67l"));
                String price = priceElement.getText();

                // Extract image link
                WebElement imageElement = container.findElement(By.tagName("img"));
                String imageLink = imageElement.getAttribute("src");

                WebElement coverLinkElement = container.findElement(By.className("CardCover_coverLink__QogOK"));

	             // Extract the "href" attribute (redirection link)
	             String redirectionLink = coverLinkElement.getAttribute("href");
	
	             // Now, you can print or store the "redirectionLink" variable as needed
	             System.out.println("Redirection Link: " + redirectionLink);
                // Print the extracted information
                System.out.println("Title: " + title);
                System.out.println("Price: " + price);
                System.out.println("Image Link: " + imageLink);
                System.out.println("==============================================");
                System.out.println("gamenumber : " + gamesScraped);
                gamesScraped++;
                Session session = HibernateUtil.getSessionFactory().openSession();
                Transaction transaction = null;

                try {
                	transaction = session.beginTransaction();
                    // Check if the game already exists
                    String queryStr = "FROM Game WHERE title = :title AND platform = :platform";
                    org.hibernate.query.Query<Game> query = session.createQuery(queryStr, Game.class);
                    query.setParameter("title", title);
                    query.setParameter("platform", platform);
                    Game game = query.uniqueResult();

                    if (game == null) {
                        // Create a new Game object if it doesn't exist
                        game = new Game();
                        game.setTitle(title);
                        game.setPlatform(platform);
                        
                        game.setLastUpdated(LocalDateTime.now());
                        game.setUrl(redirectionLink); 
                        game.setImageUrl(imageLink);
                    }

                    // Update the last updated time to now
                    game.setLastUpdated(LocalDateTime.now());
                    // Update or set the price and URL
                    game.setPrice(price.isEmpty() ? null : price);
                    game.setImageUrl(imageLink);
                    game.setUrl(redirectionLink); 
                    // Save or update the game record
                    session.saveOrUpdate(game);
                    transaction.commit();
                } catch (Exception e) {
                	if (transaction != null) transaction.rollback();
                    e.printStackTrace();

                }finally {
                	if (session != null) session.close();
                    session.close();
                }
                
                
                if (gamesScraped >= gamesToScrape) {
                    break; // Exit the loop when the desired number of games is scraped
                }
            }

            // Check if the loop should exit
            if (gamesScraped >= gamesToScrape) {
                break;
            }

            // Increment the page number for the next iteration
            page++;
        }

        // Close the browser
        driver.quit();
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