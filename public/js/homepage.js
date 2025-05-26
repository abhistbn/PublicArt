class ModernHomePage {
    constructor() {
        this.articles = [];
        this.categories = [];
        this.currentCategory = "all";
        this.searchQuery = "";
        this.apiBase = "http://localhost:8000/api"; // Lumen API base URL
        this.init();
    }

    async init() {
        this.setupScrollAnimations();
        await this.loadCategories();
        await this.loadArticles();
        this.setupEventListeners();
        this.setupSearch();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        }, observerOptions);

        document.querySelectorAll(".fade-in").forEach((el) => {
            observer.observe(el);
        });
    }

    async loadCategories() {
        try {
            const response = await fetch(`${this.apiBase}/categories`);
            if (response.ok) {
                const data = await response.json();
                this.categories = data.data || data;
                this.renderCategories();
            }
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    }

    async loadArticles() {
        try {
            this.showLoading(true);
            document.getElementById("error").style.display = "none";

            const response = await fetch(`${this.apiBase}/articles`);
            if (response.ok) {
                const data = await response.json();
                this.articles = data.data || data;
                this.renderArticles();
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error loading articles:", error);
            this.showError();
        } finally {
            this.showLoading(false);
        }
    }

    renderCategories() {
        const categoriesContainer = document.getElementById("categories");
        const allButton = categoriesContainer.querySelector(
            '[data-category="all"]'
        );

        this.categories.forEach((category) => {
            const button = document.createElement("button");
            button.className = "category-btn";
            button.textContent = category.name;
            button.dataset.category = category.id;
            categoriesContainer.appendChild(button);
        });
    }

    renderArticles() {
        const grid = document.getElementById("articlesGrid");
        const filteredArticles = this.getFilteredArticles();

        if (filteredArticles.length === 0) {
            grid.innerHTML = `
                        <div class="loading">
                            <h3>Tidak ada artikel ditemukan</h3>
                            <p>Coba ubah filter atau kata kunci pencarian Anda.</p>
                        </div>
                    `;
            return;
        }

        grid.innerHTML = filteredArticles
            .map(
                (article, index) => `
                    <article class="article-card fade-in" style="animation-delay: ${
                        index * 0.1
                    }s" onclick="this.handleArticleClick(${article.id})">
                        <div class="article-meta">
                            <span class="article-category">${this.getCategoryName(
                                article.category_id
                            )}</span>
                            <span class="article-date">${this.formatDate(
                                article.created_at
                            )}</span>
                        </div>
                        <h3 class="article-title">${article.title}</h3>
                        <p class="article-summary">${
                            article.summary ||
                            this.truncateContent(article.content)
                        }</p>
                        <a href="#" class="read-more" onclick="event.stopPropagation(); this.handleReadMore(${
                            article.id
                        })">
                            Baca Selengkapnya
                        </a>
                    </article>
                `
            )
            .join("");

        // Re-observe new elements for scroll animation
        setTimeout(() => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("visible");
                        }
                    });
                },
                { threshold: 0.1 }
            );

            document.querySelectorAll(".article-card.fade-in").forEach((el) => {
                observer.observe(el);
            });
        }, 100);
    }

    getFilteredArticles() {
        let filtered = [...this.articles];

        // Filter by category
        if (this.currentCategory !== "all") {
            filtered = filtered.filter(
                (article) => article.category_id == this.currentCategory
            );
        }

        // Filter by search query
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(
                (article) =>
                    article.title.toLowerCase().includes(query) ||
                    article.content.toLowerCase().includes(query) ||
                    (article.summary &&
                        article.summary.toLowerCase().includes(query))
            );
        }

        return filtered;
    }

    getCategoryName(categoryId) {
        const category = this.categories.find((cat) => cat.id == categoryId);
        return category ? category.name : "Umum";
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "Kemarin";
        if (diffDays < 7) return `${diffDays} hari lalu`;

        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    truncateContent(content, maxLength = 150) {
        if (!content || content.length <= maxLength) return content || "";
        return content.substring(0, maxLength).trim() + "...";
    }

    showLoading(show) {
        const loading = document.getElementById("loading");
        loading.style.display = show ? "flex" : "none";
    }

    showError() {
        document.getElementById("error").style.display = "block";
    }

    handleArticleClick(articleId) {
        // Navigate to article detail page
        window.location.href = `/article/${articleId}`;
    }

    handleReadMore(articleId) {
        // Navigate to article detail page
        window.location.href = `/article/${articleId}`;
    }

    setupEventListeners() {
        // Category buttons
        document.getElementById("categories").addEventListener("click", (e) => {
            if (e.target.classList.contains("category-btn")) {
                // Remove active class from all buttons
                document
                    .querySelectorAll(".category-btn")
                    .forEach((btn) => btn.classList.remove("active"));

                // Add active class to clicked button
                e.target.classList.add("active");

                // Update current category
                this.currentCategory = e.target.dataset.category;
                this.renderArticles();
            }
        });

        // Smooth scroll for navigation
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                e.preventDefault();
                const target = document.querySelector(
                    this.getAttribute("href")
                );
                if (target) {
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById("searchInput");
        let debounceTimer;

        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.searchQuery = e.target.value;
                this.renderArticles();
            }, 300);
        });

        // Enter key search
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                clearTimeout(debounceTimer);
                this.searchQuery = e.target.value;
                this.renderArticles();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new ModernHomePage();
});

// Add some smooth scrolling behavior
document.documentElement.style.scrollBehavior = "smooth";
