document.addEventListener("DOMContentLoaded", () => {
    class PublicArtFrontend {
        constructor() {
            this.modal = document.getElementById("articleModal");
            this.modalTitle = document.getElementById("modalTitle");
            this.modalMainContent = document.getElementById("modalMainContent");
            this.modalMetaInfo = document.getElementById("modalMetaInfo");
            this.modalFeaturedImage = document.getElementById("modalFeaturedImage");
            this.closeBtn = this.modal ? this.modal.querySelector(".close") : null;
            this.articlesGrid = document.getElementById("articlesGrid");

            // Ambil base URL API untuk detail artikel dari variabel global
            this.articleDetailEndpoint = typeof ARTICLE_DETAIL_ENDPOINT !== 'undefined'
                ? ARTICLE_DETAIL_ENDPOINT
                : '/api/internal/article-detail'; // Fallback

            this.init();
        }

        init() {
            if (this.modal && this.closeBtn && this.articlesGrid) {
                this.setupEventListeners();
            } else {
                console.warn("Beberapa elemen penting untuk JS tidak ditemukan. Fungsi modal mungkin terganggu.");
            }
            this.setupScrollAnimations();
            console.log("PublicArt Lumen Frontend JS Initialized.");
        }

        setupEventListeners() {
            // Event listener untuk tombol "Baca Selengkapnya" pada kartu artikel
            this.articlesGrid.addEventListener("click", (event) => {
                const readMoreLink = event.target.closest("a.read-more");
                if (readMoreLink) {
                    event.preventDefault();
                    const articleId = readMoreLink.dataset.articleId;
                    if (articleId) {
                        this.openArticleModal(articleId);
                    } else {
                        console.error("Article ID tidak ditemukan pada tombol.");
                    }
                }
            });

            // Event listener untuk tombol close pada modal
            this.closeBtn.addEventListener("click", () => this.closeModal());

            // Event listener untuk menutup modal jika klik di luar konten modal
            this.modal.addEventListener("click", (event) => {
                if (event.target === this.modal) {
                    this.closeModal();
                }
            });

            // Event listener untuk menutup modal dengan tombol Escape
            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape" && this.modal.style.display === "block") {
                    this.closeModal();
                }
            });
        }

        async fetchArticleDetail(articleId) {
            this.modalTitle.textContent = "Memuat Detail Artikel...";
            this.modalMainContent.innerHTML = "<p>Sedang mengambil data...</p>";
            this.modalMetaInfo.innerHTML = "";
            this.modalFeaturedImage.innerHTML = "";

            try {
                const response = await fetch(`${this.articleDetailEndpoint}/${articleId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `Gagal mengambil data (HTTP ${response.status})` }));
                    throw new Error(errorData.message || `HTTP error ${response.status}`);
                }
                const result = await response.json();
                if (result.success && result.data) {
                    return result.data;
                } else {
                    throw new Error(result.message || "Data artikel tidak valid dari API.");
                }
            } catch (error) {
                console.error("Error fetching article detail:", error);
                this.modalTitle.textContent = "Gagal Memuat";
                this.modalMainContent.innerHTML = `<p style="color:red;">Tidak dapat memuat detail artikel saat ini. ${error.message}</p>`;
                return null;
            }
        }

        async openArticleModal(articleId) {
            this.modal.style.display = "block";
            document.body.style.overflow = "hidden"; // Mencegah scroll halaman utama

            const articleData = await this.fetchArticleDetail(articleId);

            if (articleData) {
                this.modalTitle.textContent = articleData.title || "Judul Tidak Tersedia";

                let metaHTML = "";
                if (articleData.category_name) {
                    metaHTML += `<span class="modal-article-category"><strong>Kategori:</strong> ${articleData.category_name}</span>`;
                }
                if (articleData.formatted_published_at || articleData.published_at) {
                     const displayDate = articleData.formatted_published_at || this.formatLocalDate(articleData.published_at);
                    metaHTML += `<span class="modal-article-date"><strong>Publikasi:</strong> ${displayDate}</span>`;
                }
                if (articleData.author) {
                    metaHTML += `<span class="modal-article-author"><strong>Penulis:</strong> ${articleData.author}</span>`;
                }
                this.modalMetaInfo.innerHTML = metaHTML;

                if (articleData.featured_image) {
                    this.modalFeaturedImage.innerHTML = `<img src="${articleData.featured_image}" alt="${articleData.title || 'Gambar Artikel'}" style="max-width:100%; height:auto; border-radius:8px;">`;
                } else {
                    this.modalFeaturedImage.innerHTML = ""; // Kosongkan jika tidak ada gambar
                }

                // Untuk konten, pastikan itu adalah HTML yang aman atau sanitasi jika perlu
                this.modalMainContent.innerHTML = articleData.content || "<p>Konten tidak tersedia.</p>";
            }
            // Jika articleData null, pesan error sudah ditampilkan oleh fetchArticleDetail
        }

        closeModal() {
            this.modal.style.display = "none";
            document.body.style.overflow = "auto"; // Kembalikan scroll halaman utama
        }
        
        formatLocalDate(dateStringISO) {
            if (!dateStringISO) return 'N/A';
            try {
                const date = new Date(dateStringISO);
                const options = { year: 'numeric', month: 'long', day: 'numeric', /*timeZone: 'Asia/Jakarta'*/ };
                return date.toLocaleDateString('id-ID', options);
            } catch (e) {
                return dateStringISO; // fallback
            }
        }

        setupScrollAnimations() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            };
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        // obs.unobserve(entry.target); // Uncomment jika animasi hanya ingin sekali jalan
                    }
                });
            }, observerOptions);
            document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
        }
    }

    new PublicArtFrontend();
});