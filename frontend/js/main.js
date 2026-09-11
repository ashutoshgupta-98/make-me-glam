// ==========================================
// MAKE ME GLAM - MAIN JAVASCRIPT
// ==========================================

// const API_BASE_URL = "http://localhost:5000/api";
// const API_BASE_URL = 'https://make-me-glam.onrender.com/api';
const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000/api" 
    : "https://make-me-glam.onrender.com/api";


// ==========================================
// DOM READY
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Make Me Glam frontend loaded");

    initializeNavigation();
    initializeScrollEffects();
    initializeRevealAnimations();

    initializeCounters();
    initializeSmoothScroll();

    loadServices();
    loadCourses();
    loadGallery();
    loadStaff();

    initializeContactForm()

});


// ==========================================
// NAVIGATION
// ==========================================

function initializeNavigation() {

    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".main-nav");

    if (!menuToggle || !navMenu) {
        return;
    }

    menuToggle.addEventListener("click", () => {

        navMenu.classList.toggle("open");
        menuToggle.classList.toggle("active");

    });


    // Close mobile menu when clicking a link

    const navLinks = navMenu.querySelectorAll("a");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("open");
            menuToggle.classList.remove("active");

        });

    });

}


// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================

function initializeScrollEffects() {

    const navbar = document.querySelector(".site-header");

    if (!navbar) {
        return;
    }

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    });

}


// ==========================================
// REVEAL ANIMATIONS
// ==========================================

function initializeRevealAnimations() {

    const elements = document.querySelectorAll(
        ".reveal, .fade-up, .animate-on-scroll"
    );

    if (!elements.length) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.15
        }
    );

    elements.forEach(element => {

        observer.observe(element);

    });

}


// ==========================================
// LOAD SERVICES
// ==========================================

async function loadServices() {

    const container = document.querySelector("#allServicesContainer") ||
        document.querySelector("#servicesContainer");

    if (!container) {
        return;
    }

    try {

        container.innerHTML = `
            <div class="loading-state">
                <span>Loading our beauty services...</span>
            </div>
        `;


        const response = await fetch(
            `${API_BASE_URL}/services`
        );


        if (!response.ok) {

            throw new Error(
                `Services API error: ${response.status}`
            );

        }


        const result = await response.json();


        if (!result.success || !result.data) {

            throw new Error("Unable to load services");

        }


        if (result.data.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <p>No services available right now.</p>
                </div>
            `;

            return;
        }


        container.innerHTML = result.data
            .map(service => createServiceCard(service))
            .join("");


        initializeRevealAnimations();


    } catch (error) {

        console.error("Services loading error:", error);

        container.innerHTML = `
            <div class="error-state">
                <p>Unable to load services.</p>
                <button onclick="loadServices()">
                    Try Again
                </button>
            </div>
        `;

    }

}


// ==========================================
// SERVICE CARD
// ==========================================

function createServiceCard(service) {

    const image = service.image
        ? service.image
        : "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80";


    const price = Number(service.price || 0).toLocaleString(
        "en-IN"
    );


    return `
        <article class="service-card reveal">

            <div class="service-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(service.name)}"
                    loading="lazy"
                >

            </div>


            <div class="service-info">

                <span class="service-duration">
                    ${service.duration || ""} minutes
                </span>


                <h3>
                    ${escapeHTML(service.name)}
                </h3>


                <p>
                    ${escapeHTML(
        service.description ||
        "Professional beauty service by Make Me Glam."
    )}
                </p>


                <div class="service-footer">

                    <span class="service-price">
                        ₹${price}
                    </span>


                    <a
                        href="booking.html?service=${service.id}"
                        class="service-btn"
                    >
                        Book Now
                    </a>

                </div>

            </div>

        </article>
    `;
}


// ==========================================
// LOAD COURSES
// ==========================================

async function loadCourses() {

    const container = document.querySelector("#allCoursesContainer") ||
        document.querySelector("#coursesContainer");

    if (!container) {
        return;
    }

    try {

        container.innerHTML = `
            <div class="loading-state">
                <span>Loading academy courses...</span>
            </div>
        `;


        const response = await fetch(
            `${API_BASE_URL}/courses`
        );


        if (!response.ok) {

            throw new Error(
                `Courses API error: ${response.status}`
            );

        }


        const result = await response.json();


        if (!result.success || !result.data) {

            throw new Error("Unable to load courses");

        }


        if (result.data.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <p>No courses available right now.</p>
                </div>
            `;

            return;
        }


        container.innerHTML = result.data
            .map(course => createCourseCard(course))
            .join("");


        initializeRevealAnimations();


    } catch (error) {

        console.error("Courses loading error:", error);

        container.innerHTML = `
            <div class="error-state">
                <p>Unable to load courses.</p>
                <button onclick="loadCourses()">
                    Try Again
                </button>
            </div>
        `;

    }

}


// ==========================================
// COURSE CARD
// ==========================================

function createCourseCard(course) {

    const image = course.image
        ? course.image
        : "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80";


    const fee = Number(course.fee || 0).toLocaleString(
        "en-IN"
    );


    return `
        <article class="course-card reveal">

            <div class="course-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(course.title)}"
                    loading="lazy"
                >

                <span class="course-badge">
                    Professional Training
                </span>

            </div>


            <div class="course-info">

                <h3>
                    ${escapeHTML(course.title)}
                </h3>


                <p>
                    ${escapeHTML(
        course.description ||
        "Professional makeup training at Make Me Glam Academy."
    )}
                </p>


                <div class="course-meta">

                    <div>
                        <small>Duration</small>
                        <strong>
                            ${escapeHTML(course.duration || "Flexible")}
                        </strong>
                    </div>


                    <div>
                        <small>Course Fee</small>
                        <strong>
                            ₹${fee}
                        </strong>
                    </div>

                </div>


                <div class="course-buttons">

                    <a
                        href="course-details.html?id=${course.id}"
                        class="course-view"
                    >
                        View Course
                    </a>


                    <a
                        href="enroll.html?course=${course.id}"
                        class="course-enroll"
                    >
                        Enroll Now
                    </a>

                </div>

            </div>

        </article>
    `;
}


// ==========================================
// LOAD GALLERY
// ==========================================

async function loadGallery() {

    const container = document.querySelector("#galleryContainer");

    if (!container) {
        return;
    }

    try {

        container.innerHTML = `
            <div class="loading-state">
                <span>Loading our beauty gallery...</span>
            </div>
        `;


        const response = await fetch(
            `${API_BASE_URL}/gallery`
        );


        if (!response.ok) {

            throw new Error(
                `Gallery API error: ${response.status}`
            );

        }


        const result = await response.json();


        if (!result.success || !result.data) {

            throw new Error(
                "Unable to load gallery"
            );

        }


        if (result.data.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <p>No gallery images available right now.</p>
                </div>
            `;

            return;
        }


        container.innerHTML = result.data
            .map(item => createGalleryCard(item))
            .join("");


        initializeRevealAnimations();


    } catch (error) {

        console.error(
            "Gallery loading error:",
            error
        );


        container.innerHTML = `
            <div class="error-state">

                <p>
                    Unable to load gallery.
                </p>

                <button onclick="loadGallery()">
                    Try Again
                </button>

            </div>
        `;

    }

}


// ==========================================
// GALLERY CARD
// ==========================================

function createGalleryCard(item) {

    const image = item.image_url
        ? item.image_url
        : "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80";


    const title = item.title
        ? item.title
        : "Make Me Glam";


    const category = item.category
        ? item.category
        : "Beauty";


    return `
        <article class="gallery-card reveal">

            <div class="gallery-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(title)}"
                    loading="lazy"
                >

                <div class="gallery-overlay">

                    <span class="gallery-category">
                        ${escapeHTML(category)}
                    </span>

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                </div>

            </div>

        </article>
    `;
}


// ==========================================
// LOAD STAFF
// ==========================================

async function loadStaff() {

    const container = document.querySelector("#staff-container");

    if (!container) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/staff`
        );


        if (!response.ok) {

            throw new Error(
                `Staff API error: ${response.status}`
            );

        }


        const result = await response.json();


        if (!result.success || !result.data) {

            throw new Error("Unable to load staff");

        }


        if (result.data.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <p>No artists available right now.</p>
                </div>
            `;

            return;
        }


        container.innerHTML = result.data
            .map(staff => createStaffCard(staff))
            .join("");


        initializeRevealAnimations();


    } catch (error) {

        console.error("Staff loading error:", error);

        container.innerHTML = `
            <div class="error-state">
                <p>Unable to load our artists.</p>
            </div>
        `;

    }

}


// ==========================================
// STAFF CARD
// ==========================================

function createStaffCard(staff) {

    const image = staff.photo
        ? staff.photo
        : "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=700&q=80";


    return `
        <article class="staff-card reveal">

            <div class="staff-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(staff.name)}"
                    loading="lazy"
                >

            </div>


            <div class="staff-info">

                <h3>
                    ${escapeHTML(staff.name)}
                </h3>


                <span>
                    ${escapeHTML(
        staff.designation ||
        "Makeup Artist"
    )}
                </span>


                ${staff.bio
            ? `<p>${escapeHTML(staff.bio)}</p>`
            : ""
        }

            </div>

        </article>
    `;
}


// ==========================================
// NUMBER COUNTER
// ==========================================

function initializeCounters() {

    const counters = document.querySelectorAll(
        "[data-counter]"
    );

    if (!counters.length) {
        return;
    }


    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }


                const counter = entry.target;

                const target = Number(
                    counter.dataset.counter
                );

                let current = 0;

                const duration = 1500;

                const increment =
                    target / (duration / 16);


                const updateCounter = () => {

                    current += increment;


                    if (current >= target) {

                        counter.textContent =
                            target.toLocaleString("en-IN");

                        return;

                    }


                    counter.textContent =
                        Math.floor(current).toLocaleString("en-IN");


                    requestAnimationFrame(updateCounter);

                };


                updateCounter();

                observer.unobserve(counter);

            });

        },
        {
            threshold: 0.5
        }
    );


    counters.forEach(counter => {

        observer.observe(counter);

    });

}


// ==========================================
// SMOOTH SCROLL
// ==========================================

function initializeSmoothScroll() {

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");


            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }


            const target =
                document.querySelector(targetId);


            if (!target) {
                return;
            }


            event.preventDefault();


            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.loadServices = loadServices;
window.loadCourses = loadCourses;
window.loadGallery = loadGallery;
window.loadStaff = loadStaff;




// =====================================================
// CONTACT FORM
// =====================================================

function initializeContactForm() {

    const contactForm =
        document.querySelector("#contactForm");

    const contactFormMessage =
        document.querySelector("#contactFormMessage");


    if (!contactForm || !contactFormMessage) {
        return;
    }


    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const submitButton =
                contactForm.querySelector(".form-submit");


            const formData =
                new FormData(contactForm);


            const data = {

                name: formData.get("name"),

                phone: formData.get("phone"),

                email: formData.get("email"),

                subject: formData.get("subject"),

                message: formData.get("message")

            };


            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    "SENDING...";


                const response =
                    await fetch(
                        `${API_BASE_URL}/contacts`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok || !result.success) {

                    throw new Error(
                        result.message ||
                        "Unable to submit enquiry."
                    );

                }


                contactFormMessage.className =
                    "form-message show";


                contactFormMessage.textContent =
                    "Thank you! Your enquiry has been received. Our team will contact you shortly.";


                contactForm.reset();


            } catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );


                contactFormMessage.className =
                    "form-message show";


                contactFormMessage.textContent =
                    "Unable to submit your enquiry. Please try again.";


            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "SEND ENQUIRY";

            }

        }
    );

}