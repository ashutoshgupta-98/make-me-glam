// =====================================================
        // API
        // =====================================================

        const API_BASE_URL =
            "http://localhost:5000/api";


        // =====================================================
        // AUTHENTICATION CHECK
        // =====================================================

        const adminToken =
            localStorage.getItem(
                "adminToken"
            );


        if (!adminToken) {

            window.location.href =
                "index.html";

        }


        // =====================================================
        // ADMIN DATA
        // =====================================================

        const adminData =
            JSON.parse(
                localStorage.getItem(
                    "adminData"
                ) || "{}"
            );


        const adminName =
            document.querySelector(
                "#adminName"
            );


        const adminEmail =
            document.querySelector(
                "#adminEmail"
            );


        const welcomeTitle =
            document.querySelector(
                "#welcomeTitle"
            );


        if (adminData.name) {

            adminName.textContent =
                adminData.name;

            welcomeTitle.textContent =
                `Welcome Back, ${adminData.name}`;

        }


        if (adminData.email) {

            adminEmail.textContent =
                adminData.email;

        }


        // =====================================================
        // CURRENT DATE
        // =====================================================

        const currentDate =
            document.querySelector(
                "#currentDate"
            );


        currentDate.textContent =
            new Date().toLocaleDateString(
                "en-IN",
                {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );


        // =====================================================
        // LOGOUT
        // =====================================================

        const logoutButton =
            document.querySelector(
                "#logoutButton"
            );


        logoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "adminToken"
                );

                localStorage.removeItem(
                    "adminData"
                );

                window.location.href =
                    "index.html";

            }
        );


        // =====================================================
        // MOBILE MENU
        // =====================================================

        const mobileMenuButton =
            document.querySelector(
                "#mobileMenuButton"
            );


        const sidebar =
            document.querySelector(
                "#sidebar"
            );


        mobileMenuButton.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );


        // =====================================================
        // LOAD DASHBOARD DATA
        // =====================================================

        async function loadDashboardData() {

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/dashboard`,
                        {
                            method: "GET",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${adminToken}`

                            }

                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Dashboard API:",
                    result
                );


                // =============================================
                // TOKEN INVALID / EXPIRED
                // =============================================

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    localStorage.removeItem(
                        "adminToken"
                    );

                    localStorage.removeItem(
                        "adminData"
                    );

                    window.location.href =
                        "index.html";

                    return;

                }


                // =============================================
                // API ERROR
                // =============================================

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to load dashboard."
                    );

                }


                // =============================================
                // STATS
                // =============================================

                const stats =
                    result.data.stats;


                document.querySelector(
                    "#totalBookings"
                ).textContent =
                    stats.totalBookings;


                document.querySelector(
                    "#totalCourses"
                ).textContent =
                    stats.totalCourses;


                document.querySelector(
                    "#totalServices"
                ).textContent =
                    stats.totalServices;


                document.querySelector(
                    "#totalEnrollments"
                ).textContent =
                    stats.totalEnrollments;


                // =============================================
                // RECENT BOOKINGS
                // =============================================

                renderRecentBookings(
                    result.data.recentBookings
                );


            } catch (error) {

                console.error(
                    "Dashboard loading error:",
                    error
                );


                document.querySelector(
                    "#recentBookingsWrapper"
                ).innerHTML = `

            <div class="empty-state">

                Unable to load dashboard data.

                <br><br>

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

            }

        }

        // =====================================================
        // RENDER RECENT BOOKINGS
        // =====================================================

        function renderRecentBookings(
            bookings
        ) {

            const wrapper =
                document.querySelector(
                    "#recentBookingsWrapper"
                );


            if (
                !bookings ||
                bookings.length === 0
            ) {

                wrapper.innerHTML = `

            <div class="empty-state">

                No bookings found.

            </div>

        `;

                return;

            }


            let rows = "";


            bookings.forEach(
                function (booking) {

                    const status =
                        String(
                            booking.status || "pending"
                        ).toLowerCase();


                    rows += `

                <tr>

                    <td>
                        ${escapeHTML(
                        booking.customer_name
                    )}
                    </td>

                    <td>
                        ${escapeHTML(
                        booking.booking_number
                    )}
                    </td>

                    <td>
                        ${escapeHTML(
                        booking.booking_date
                    )}
                    </td>

                    <td>

                        <span
                            class="status ${escapeHTML(status)}"
                        >
                            ${escapeHTML(status)}
                        </span>

                    </td>

                </tr>

            `;

                }
            );


            wrapper.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>
                        Customer
                    </th>

                    <th>
                        Booking
                    </th>

                    <th>
                        Date
                    </th>

                    <th>
                        Status
                    </th>

                </tr>

            </thead>


            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

        }


        // =====================================================
        // ESCAPE HTML
        // =====================================================

        function escapeHTML(value) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }


            return String(value)

                .replace(
                    /&/g,
                    "&amp;"
                )

                .replace(
                    /</g,
                    "&lt;"
                )

                .replace(
                    />/g,
                    "&gt;"
                )

                .replace(
                    /"/g,
                    "&quot;"
                )

                .replace(
                    /'/g,
                    "&#039;"
                );

        }

        loadDashboardData();