# VondraLink: A Smart Multimodal Discovery Platform

**VondraLink** (formerly Project EchoBuy) is a "FinCommerce" engine designed to bridge the gap between aesthetic inspiration and financial reality. By moving away from traditional keyword searches, VondraLink utilizes **Vector Search** to help users discover products based on "vibes," specific technical features, and strict budget constraints.

---

## Project Overview

In today’s market, users often face "Feature Confusion" or find high-end items they love but cannot afford. VondraLink solves this by connecting users to affordable alternatives that maintain the "must-have" qualities of premium products.

While the system is built for various product categories (like furniture or clothing), the current implementation focuses on **Tech Gadgets**.

### Core Features

* 
**Visual "Vibe-on-a-Budget" Search:** Upload an image of a luxury item, and the system finds visually similar products within your price range.


* 
**The "Trade-Off" Engine:** Identify "close substitutes" that save money while preserving key specs, such as battery life or screen quality.


* 
**Contextual Gift Finder:** Describe a person’s lifestyle in plain English (e.g., "they work from home and love coffee"), and the system identifies relevant products through natural language understanding.



---

## 🛠️ Tech Stack & Architecture

### Vector Database: Qdrant

VondraLink uses **Qdrant** as its core high-performance search engine. Products are represented in a mathematical space using three distinct vector types:

* 
**Image Vectors:** For visual similarity searches.


* 
**Feature Vectors:** To compare technical specifications for trade-offs.


* 
**Intent Vectors:** To match lifestyle descriptions and user reviews to products.



### Payload Filtering

To ensure every recommendation is "affordable" by default, we utilize Qdrant’s **Payload Filtering**. This ignores any result that falls outside the user’s specified price range before delivering the final recommendations.

---

## 📊 Data Pipeline

The dataset is curated through a dedicated scraping and collection pipeline using the **Best Buy API**.

### 1. Data Collection

We pull real-time product catalogs including titles, prices, images, specs, and reviews.

* **Source:** Best Buy API.
* **Storage:** Local image caching for faster processing.

### 2. Data Format

The processed data is structured as follows:

```json
[
    {
        "id": 1,
        "title": "Apple - Geek Squad Certified Refurbished iPhone 8 64GB - Space Gray (Sprint)",
        "price": 649.99,
        "link": "https://api.bestbuy.com/click/-/6255530/pdp",
        "image": "https://pisces.bbystatic.com/prescaled/500/500/image2/BestBuy_US/images/products/6255/6255530_sd.jpg",
        "characteristics": "....",
        "image_local": "/content/downloaded_images/product_1.jpg"
    }
]

```

### 3. Processing Pipeline

1. **Scrape:** Fetch data via API.
2. **Download:** Save product images locally for vector embedding generation.
3. **Embed:** Convert images and text descriptions into high-dimensional vectors.
4. **Upsert:** Upload vectors and metadata (price, link) to Qdrant.

---

## 📈 Evaluation Metrics

We measure the success of VondraLink based on:

1. 
**Accuracy:** The visual similarity of results in "Vibe Search".


2. 
**Budget Success:** The percentage of recommendations that strictly adhere to user financial constraints.


3. 
**Speed:** Near real-time delivery of results (searching millions of items in <1 second).


![Data Pipeline architecture](/VondraLink/Images/Untitled diagram-2026-01-26-192024.png)

---