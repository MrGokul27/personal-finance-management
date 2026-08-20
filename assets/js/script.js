document.addEventListener("DOMContentLoaded", function () {
  // 0. PRELOADER CONTROLLER (Runs for exactly 2 seconds)
  const preloader = document.getElementById("preloader");
  if (preloader) {
    document.body.classList.add("preloader-active");

    const progressBar = document.querySelector(".preloader-progress-bar");
    const percentText = document.getElementById("preloader-percent");
    const statusText = document.getElementById("preloader-status-text");

    const statuses = [
      { pct: 0, text: "Locking secure advisory connection..." },
      { pct: 25, text: "Analyzing real-time asset indices..." },
      { pct: 50, text: "Optimizing tax-efficient pipelines..." },
      { pct: 75, text: "Structuring wealth projection models..." },
      { pct: 95, text: "Decryption complete. Initializing dashboard..." },
    ];

    let duration = 2000; // 2 seconds
    let startTime = performance.now();

    function updatePreloader(timestamp) {
      let elapsed = timestamp - startTime;
      let progress = Math.min(elapsed / duration, 1);
      let percentage = Math.floor(progress * 100);

      if (progressBar) progressBar.style.width = percentage + "%";
      if (percentText) percentText.innerText = percentage + "%";

      let currentStatus = statuses[0].text;
      for (let i = 0; i < statuses.length; i++) {
        if (percentage >= statuses[i].pct) {
          currentStatus = statuses[i].text;
        }
      }
      if (statusText && statusText.innerText !== currentStatus) {
        statusText.innerText = currentStatus;
      }

      if (progress < 1) {
        requestAnimationFrame(updatePreloader);
      } else {
        setTimeout(() => {
          preloader.classList.add("preloader-fade-out");
          document.body.classList.remove("preloader-active");
          setTimeout(() => {
            preloader.style.display = "none";
          }, 500);
        }, 200);
      }
    }

    requestAnimationFrame(updatePreloader);
  }

  // 1. DYNAMIC COMPONENT LOADER
  const pathname = window.location.pathname;
  let depth = 0; // Default: root index.html

  if (pathname.includes("/pages/services/")) {
    depth = 2; // Inside pages/services/
  } else if (pathname.includes("/pages/")) {
    depth = 1; // Inside pages/
  }

  // Determine correct relative paths for header/footer files
  let headerPath = "pages/components/header.html";
  let footerPath = "pages/components/footer.html";

  if (depth === 1) {
    headerPath = "components/header.html";
    footerPath = "components/footer.html";
  } else if (depth === 2) {
    headerPath = "../components/header.html";
    footerPath = "../components/footer.html";
  }

  const headerPlaceholder = document.getElementById("header-placeholder");
  const footerPlaceholder = document.getElementById("footer-placeholder");

  // Load Header
  if (headerPlaceholder) {
    fetch(headerPath)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load header component");
        return response.text();
      })
      .then((html) => {
        headerPlaceholder.innerHTML = html;
        adjustPaths(headerPlaceholder, depth);
        highlightActiveNav(headerPlaceholder, depth);
        updateHeaderAuth(headerPlaceholder, depth);
        fixHeaderPositions();
      })
      .catch((err) => console.error("Error loading header:", err));
  }

  // Load Footer
  if (footerPlaceholder) {
    fetch(footerPath)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load footer component");
        return response.text();
      })
      .then((html) => {
        footerPlaceholder.innerHTML = html;
        adjustPaths(footerPlaceholder, depth);
        initScrollToTop();
      })
      .catch((err) => console.error("Error loading footer:", err));
  }

  // Initialize Calculator if on home page
  initCalculator();

  // Initialize Counters if they exist on the page
  initCounters();

  // Initialize Project Filters if on projects page
  initProjectFilters();

  // Initialize Shop Filters if on shop page
  initShopFilters();

  // Initialize Scroll Reveal Animations (for all pages except dashboard)
  initScrollReveal();

  // Intercept target form submissions and redirect to 404 page
  document.addEventListener("submit", function (event) {
    const form = event.target;
    const isFooterSubscribe = form.closest(".footer-subscribe");
    const isNewsletterInput = form.closest(".newsletter-input");
    const isContactForm = form.closest(".contact-form");

    if (isFooterSubscribe || isNewsletterInput || isContactForm) {
      event.preventDefault();

      // Determine the page depth to resolve correct path to 404.html
      const pathname = window.location.pathname;
      let depth = 0; // Default: root directory (index.html)

      if (pathname.includes("/pages/services/")) {
        depth = 2; // Inside pages/services/
      } else if (pathname.includes("/pages/")) {
        depth = 1; // Inside pages/
      }

      let redirectUrl = "pages/404.html";
      if (depth === 1) {
        redirectUrl = "404.html";
      } else if (depth === 2) {
        redirectUrl = "../404.html";
      }

      window.location.href = redirectUrl;
    }
  });
});

/**
 * 1b. FIX FIXED HEADER POSITIONS & BODY OFFSET
 */
function fixHeaderPositions() {
  const topHeader = document.querySelector(".top-header");
  const navbar = document.getElementById("mainNavbar");
  if (!navbar) return;

  const isMobile = window.innerWidth < 992;
  const topHeaderHeight = !isMobile && topHeader ? topHeader.offsetHeight : 0;
  navbar.style.top = topHeaderHeight + "px";
  document.body.style.paddingTop = topHeaderHeight + navbar.offsetHeight + "px";
}

window.addEventListener("resize", fixHeaderPositions);

/**
 * 2. PATH NORMALIZER FOR REUSABLE COMPONENTS
 * Automatically corrects href/src elements depending on file path depth
 */
function adjustPaths(container, depth) {
  if (depth === 0) return; // Root pages remain unchanged

  const links = container.querySelectorAll("a");
  const images = container.querySelectorAll("img");

  links.forEach((a) => {
    let href = a.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("tel:") ||
      href.startsWith("mailto:") ||
      href.startsWith("javascript:")
    )
      return;

    if (depth === 1) {
      if (href === "index.html") {
        a.setAttribute("href", "../index.html");
      } else if (href.startsWith("pages/services/")) {
        a.setAttribute("href", href.replace("pages/", ""));
      } else if (href.startsWith("pages/")) {
        a.setAttribute("href", href.replace("pages/", ""));
      }
    } else if (depth === 2) {
      if (href === "index.html") {
        a.setAttribute("href", "../../index.html");
      } else if (href.startsWith("pages/services/")) {
        a.setAttribute("href", href.replace("pages/services/", ""));
      } else if (href.startsWith("pages/")) {
        a.setAttribute("href", href.replace("pages/", "../"));
      }
    }
  });

  images.forEach((img) => {
    let src = img.getAttribute("src");
    if (!src) return;

    if (depth === 1) {
      if (src.startsWith("assets/")) {
        img.setAttribute("src", "../" + src);
      }
    } else if (depth === 2) {
      if (src.startsWith("assets/")) {
        img.setAttribute("src", "../../" + src);
      }
    }
  });
}

/**
 * 3. NAVBAR ACTIVE STATE HIGHLIGHTING
 */
function highlightActiveNav(container, depth) {
  const pathname = window.location.pathname;
  let filename = pathname.substring(pathname.lastIndexOf("/") + 1);

  if (filename === "" || filename === "index.html") {
    setActive(container.querySelector("#nav-home"));
  } else if (filename === "about.html") {
    setActive(container.querySelector("#nav-about"));
  } else if (filename === "services.html" || depth === 2) {
    setActive(container.querySelector("#nav-services"));
  } else if (filename === "projects.html") {
    setActive(container.querySelector("#nav-projects"));
  } else if (filename === "shop.html") {
    setActive(container.querySelector("#nav-shop"));
  } else if (filename === "contact.html") {
    setActive(container.querySelector("#nav-contact"));
  }

  function setActive(el) {
    if (el) {
      el.classList.add("active");
      el.style.color = "#10b981"; // Emerald green highlight
      el.style.borderBottom = "2px solid #10b981";
    }
  }
}

/**
 * 4. SCROLL TO TOP FUNCTIONALITY
 */
function initScrollToTop() {
  const scrollBtn = document.getElementById("scrollToTop");
  if (!scrollBtn) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      scrollBtn.style.display = "flex";
      setTimeout(() => {
        scrollBtn.style.opacity = "1";
      }, 10);
    } else {
      scrollBtn.style.opacity = "0";
      setTimeout(() => {
        if (window.scrollY <= 300) scrollBtn.style.display = "none";
      }, 300);
    }
  });

  scrollBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/**
 * 5. INTERACTIVE FINANCIAL HEALTH CALCULATOR (Home Page)
 */
function initCalculator() {
  const incomeSlider = document.getElementById("calcIncome");
  const expensesSlider = document.getElementById("calcExpenses");
  const investSlider = document.getElementById("calcInvestRate");

  if (!incomeSlider || !expensesSlider || !investSlider) return;

  const incomeVal = document.getElementById("calcIncomeVal");
  const expensesVal = document.getElementById("calcExpensesVal");
  const investVal = document.getElementById("calcInvestRateVal");

  const monthlySavingsText = document.getElementById("resMonthlySavings");
  const amountInvestedText = document.getElementById("resAmountInvested");
  const wealth5YrText = document.getElementById("resWealth5Yr");
  const wealth10YrText = document.getElementById("resWealth10Yr");
  const wealth20YrText = document.getElementById("resWealth20Yr");

  function updateCalculator() {
    let income = parseInt(incomeSlider.value);
    let expenses = parseInt(expensesSlider.value);
    let investRate = parseInt(investSlider.value);

    // Adjust limits so expenses cannot exceed income
    if (expenses > income) {
      expensesSlider.value = income;
      expenses = income;
    }

    // Update display text values
    incomeVal.innerText = income.toLocaleString("en-IN");
    expensesVal.innerText = expenses.toLocaleString("en-IN");
    investVal.innerText = investRate;

    // Calculations
    let monthlySavings = income - expenses;
    let monthlyInvested = Math.round(monthlySavings * (investRate / 100));

    monthlySavingsText.innerText = "₹" + monthlySavings.toLocaleString("en-IN");
    amountInvestedText.innerText =
      "₹" + monthlyInvested.toLocaleString("en-IN");

    // Compound Interest projection (12% per annum = 1% per month)
    const monthlyRate = 0.12 / 12;

    let projection5Yr = calculateCompound(monthlyInvested, monthlyRate, 5 * 12);
    let projection10Yr = calculateCompound(
      monthlyInvested,
      monthlyRate,
      10 * 12,
    );
    let projection20Yr = calculateCompound(
      monthlyInvested,
      monthlyRate,
      20 * 12,
    );

    wealth5YrText.innerText =
      "₹" + Math.round(projection5Yr).toLocaleString("en-IN");
    wealth10YrText.innerText =
      "₹" + Math.round(projection10Yr).toLocaleString("en-IN");
    wealth20YrText.innerText =
      "₹" + Math.round(projection20Yr).toLocaleString("en-IN");

    // Update dynamic advisory insights based on values
    updateCalculatorInsights(
      income,
      expenses,
      investRate,
      monthlySavings,
      monthlyInvested,
      projection20Yr,
    );
  }

  function calculateCompound(monthlyContribution, monthlyRate, totalMonths) {
    if (monthlyContribution <= 0) return 0;
    // Formula: S = P * (((1 + r)^n - 1) / r) * (1 + r)
    return (
      monthlyContribution *
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
      (1 + monthlyRate)
    );
  }

  // Add listeners
  incomeSlider.addEventListener("input", updateCalculator);
  expensesSlider.addEventListener("input", updateCalculator);
  investSlider.addEventListener("input", updateCalculator);

  // Run once on load
  updateCalculator();
}

/**
 * 5a. DYNAMIC ADVISORY INSIGHTS
 */
function updateCalculatorInsights(
  income,
  expenses,
  investRate,
  monthlySavings,
  monthlyInvested,
  corpus20Yr,
) {
  const insightCard = document.getElementById("calcInsightCard");
  const insightTitle = document.getElementById("insightTitle");
  const insightText = document.getElementById("insightText");
  if (!insightCard || !insightTitle || !insightText) return;

  const savingsRate = income > 0 ? (monthlySavings / income) * 100 : 0;

  insightCard.classList.remove("d-none", "warning-insight");

  if (savingsRate <= 0) {
    insightCard.classList.add("warning-insight");
    insightTitle.innerHTML =
      '<i class="fa-solid fa-triangle-exclamation me-1"></i> Budget Alert: Zero Savings';
    insightText.innerHTML =
      "Your expenses match or exceed your income. Auditing variables will help recover financial liquidity.";
  } else if (savingsRate < 25) {
    insightCard.classList.add("warning-insight");
    insightTitle.innerHTML =
      '<i class="fa-solid fa-triangle-exclamation me-1"></i> Advisory Tip: Increase Savings';
    insightText.innerHTML =
      "Savings rate is " +
      Math.round(savingsRate) +
      "%. Aiming for 25%+ savings rate by reducing variable costs accelerates compounding.";
  } else if (investRate < 50) {
    insightTitle.innerHTML =
      '<i class="fa-solid fa-lightbulb text-gold me-1"></i> Advisory Tip: Deploy Savings';
    insightText.innerHTML =
      "Good savings rate (" +
      Math.round(savingsRate) +
      "%). But you only invest " +
      investRate +
      "% of it. Moving to 60%+ will grow your 20-year corpus significantly.";
  } else {
    insightTitle.innerHTML =
      '<i class="fa-solid fa-circle-check text-emerald me-1"></i> Status: Master Accumulator';
    insightText.innerHTML =
      "Stellar behavior! Investing " +
      investRate +
      "% of a " +
      Math.round(savingsRate) +
      "% savings rate sets you up for rapid compounding success.";
  }
}

/**
 * 5b. INTERACTIVE STATISTICS COUNTERS (Home Page)
 */
function initCounters() {
  const counters = document.querySelectorAll(".counter");
  if (counters.length === 0) return;

  const speed = 1500; // Duration of animation in ms

  const countUp = (counter) => {
    const target = parseFloat(counter.getAttribute("data-target"));
    const decimals = parseInt(counter.getAttribute("data-decimals")) || 0;
    const start = 0;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const current = Math.min(start + (progress / speed) * target, target);

      if (decimals > 0) {
        counter.innerText = current.toFixed(decimals);
      } else {
        counter.innerText = Math.floor(current).toLocaleString("en-IN");
      }

      if (progress < speed) {
        requestAnimationFrame(animate);
      } else {
        if (decimals > 0) {
          counter.innerText = target.toFixed(decimals);
        } else {
          counter.innerText = target.toLocaleString("en-IN");
        }
      }
    };

    requestAnimationFrame(animate);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

/**
 * 6. PROJECTS FILTER LOGIC (Projects Page)
 */
function initProjectFilters() {
  const filterContainer = document.querySelector(".portfolio-filter-btns");
  if (!filterContainer) return;

  const filterBtns = filterContainer.querySelectorAll(".btn-filter");
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from other buttons
      filterBtns.forEach((b) =>
        b.classList.remove("btn-emerald", "text-white"),
      );
      filterBtns.forEach((b) => b.classList.add("btn-outline-slate"));

      // Add active style to current button
      this.classList.remove("btn-outline-slate");
      this.classList.add("btn-emerald", "text-white");

      const filterValue = this.getAttribute("data-filter");

      portfolioItems.forEach((item) => {
        if (filterValue === "all" || item.classList.contains(filterValue)) {
          item.style.display = "block";
          // Trigger fade in animation
          item.classList.add("animate-fade-in");
        } else {
          item.style.display = "none";
          item.classList.remove("animate-fade-in");
        }
      });
    });
  });
}

/**
 * 7. INTERCEPT EMPTY LINKS AND REDIRECT TO 404
 */
document.addEventListener("click", function (event) {
  // If user holds Ctrl/Cmd/Shift/Alt to open in new tab/window, don't intercept
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return;
  }

  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");

  // Intercept empty or "#" href links
  if (href === "" || href === "#" || (href && href.trim() === "#")) {
    // Skip Bootstrap interactive toggles and elements meant to open modals/dropdowns/carousels
    if (
      link.hasAttribute("data-bs-toggle") ||
      link.hasAttribute("data-bs-slide") ||
      link.classList.contains("dropdown-toggle") ||
      link.classList.contains("carousel-control-prev") ||
      link.classList.contains("carousel-control-next")
    ) {
      return;
    }

    event.preventDefault();

    // Determine the page depth to resolve correct path to pages/404.html
    const pathname = window.location.pathname;
    let depth = 0; // Default: root directory (index.html)

    if (pathname.includes("/pages/services/")) {
      depth = 2; // Inside pages/services/
    } else if (pathname.includes("/pages/")) {
      depth = 1; // Inside pages/
    }

    let redirectUrl = "pages/404.html";
    if (depth === 1) {
      redirectUrl = "404.html";
    } else if (depth === 2) {
      redirectUrl = "../404.html";
    }

    window.location.href = redirectUrl;
  }
});

/* Update Header CTA Button based on auth state */
function updateHeaderAuth(container, depth) {
  const isLoggedIn = localStorage.getItem("userLoggedIn");
  if (isLoggedIn === "true") {
    const ctaBtn = container.querySelector("#nav-cta-btn");
    if (ctaBtn) {
      let dashboardPath = "pages/dashboard.html";
      if (depth === 1) {
        dashboardPath = "dashboard.html";
      } else if (depth === 2) {
        dashboardPath = "../dashboard.html";
      }
      ctaBtn.setAttribute("href", dashboardPath);
      ctaBtn.innerHTML = '<i class="fa-solid fa-gauge me-2"></i>Dashboard';
    }
  }
}

/**
 * 8. SHOP FILTER & SEARCH LOGIC
 */
function initShopFilters() {
  const filterBtnGroup = document.querySelector(".filter-btn-group");
  const searchInput = document.getElementById("shop-search");
  const searchBtn = document.getElementById("shop-search-btn");
  const productItems = document.querySelectorAll(".product-item");

  if (!filterBtnGroup && !searchInput && productItems.length === 0) return;

  let activeCategory = "all";
  let searchQuery = "";

  function filterProducts() {
    let visibleCount = 0;
    productItems.forEach((item) => {
      const category = item.getAttribute("data-category");
      const title = item.querySelector("h5")
        ? item.querySelector("h5").textContent.toLowerCase()
        : "";
      const desc = item.querySelector("p")
        ? item.querySelector("p").textContent.toLowerCase()
        : "";
      const badge = item.querySelector(".text-emerald")
        ? item.querySelector(".text-emerald").textContent.toLowerCase()
        : "";

      const matchesCategory =
        activeCategory === "all" || category === activeCategory;
      const matchesSearch =
        title.includes(searchQuery) ||
        desc.includes(searchQuery) ||
        badge.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        item.style.display = "block";
        item.classList.add("animate-fade-in");
        visibleCount++;
      } else {
        item.style.display = "none";
        item.classList.remove("animate-fade-in");
      }
    });

    const noProductsMsg = document.getElementById("no-products-message");
    if (noProductsMsg) {
      if (visibleCount === 0) {
        noProductsMsg.classList.remove("d-none");
      } else {
        noProductsMsg.classList.add("d-none");
      }
    }
  }

  if (filterBtnGroup) {
    const buttons = filterBtnGroup.querySelectorAll("button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", function () {
        // Toggle active styling
        buttons.forEach((b) => {
          b.classList.remove("btn-emerald", "text-white");
          b.classList.add("btn-outline-secondary");
        });
        this.classList.remove("btn-outline-secondary");
        this.classList.add("btn-emerald", "text-white");

        activeCategory = this.getAttribute("data-filter") || "all";
        filterProducts();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchQuery = this.value.toLowerCase().trim();
      filterProducts();
    });
  }

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", function () {
      searchQuery = searchInput.value.toLowerCase().trim();
      filterProducts();
    });
  }
}

/**
 * 9. DYNAMIC SCROLL REVEAL ANIMATIONS
 * Automatically targets key sections and cards across non-dashboard pages,
 * setting up an IntersectionObserver to trigger smooth transitions.
 */
function initScrollReveal() {
  // Never run on dashboard page
  if (window.location.pathname.includes("dashboard.html")) return;

  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) return;

  const targets = [];

  // 1. Grab elements explicitly marked with .reveal
  document.querySelectorAll(".reveal").forEach((el) => targets.push(el));

  // 2. Dynamically auto-target key blocks in standard content sections
  const sections = document.querySelectorAll("section");
  sections.forEach((section, index) => {
    // Skip the top hero/slider section
    if (
      index === 0 &&
      (section.id === "heroSlider" ||
        section.classList.contains("hero") ||
        section.classList.contains("carousel") ||
        section.getBoundingClientRect().top < 100)
    ) {
      return;
    }

    // A. Section Headings (exclude those inside cards or accordions)
    const headings = section.querySelectorAll(
      ".section-title, h2, h3:not(.card-title):not(.accordion-header)",
    );
    headings.forEach((h) => targets.push(h));

    // B. Cards, pillars, list items, and key visual boxes
    const cards = section.querySelectorAll(
      ".pillar-card, .card, .service-card, .project-card, .team-member, .feature-card, .benefit-card, .product-item, .contact-info-card, .about-img-box, .pricing-card",
    );
    if (cards.length > 0) {
      cards.forEach((c) => targets.push(c));
    } else {
      // If there are no specific cards, target the grid columns inside rows
      const rows = section.querySelectorAll(".row");
      rows.forEach((row) => {
        const cols = row.querySelectorAll(":scope > [class^='col-']");
        if (cols.length > 0) {
          cols.forEach((col) => targets.push(col));
        } else {
          targets.push(row);
        }
      });
    }

    // C. Additional visual elements: stand-alone images, charts, and callouts
    const visuals = section.querySelectorAll(
      ".img-fluid:not(.avatar):not(.brand-logo), .graphic-wrapper",
    );
    visuals.forEach((v) => targets.push(v));
  });

  // Filter for unique elements to avoid observing same element multiple times
  const uniqueTargets = [...new Set(targets)];

  // Initialize and observe each target
  uniqueTargets.forEach((el) => {
    // Add default reveal style if not already explicitly marked
    if (
      !el.classList.contains("reveal") &&
      !el.classList.contains("reveal-visible")
    ) {
      el.classList.add("reveal");
    }
  });

  const observerOptions = {
    root: null, // viewport
    threshold: 0.1, // trigger when 10% is visible
    rootMargin: "0px 0px -50px 0px", // trigger slightly before entering the viewport
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;

        // Apply dynamic stagger delays for grid columns under the same parent row
        const parent = el.parentElement;
        if (parent && parent.classList.contains("row")) {
          const siblings = Array.from(
            parent.querySelectorAll(
              ":scope > [class^='col-'], :scope > .pillar-card, :scope > .card",
            ),
          );
          const index = siblings.indexOf(el);
          if (index !== -1) {
            el.style.transitionDelay = `${index * 150}ms`;
          }
        }

        // Custom delay via data attribute (e.g. data-reveal-delay="200")
        const customDelay = el.getAttribute("data-reveal-delay");
        if (customDelay) {
          el.style.transitionDelay = `${customDelay}ms`;
        }

        // Custom duration via data attribute
        const customDuration = el.getAttribute("data-reveal-duration");
        if (customDuration) {
          el.style.transitionDuration = `${customDuration}ms`;
        }

        el.classList.add("reveal-visible");
        obs.unobserve(el);
      }
    });
  }, observerOptions);

  uniqueTargets.forEach((el) => {
    observer.observe(el);
  });
}
