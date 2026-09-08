const API_BASE_URL =
            "http://localhost:5000/api";
        // const API_BASE_URL = window.location.hostname === "localhost" 
        // ? "http://localhost:5000/api" 
        // : "/api";


        const loginForm =
            document.querySelector(
                "#adminLoginForm"
            );


        const loginButton =
            document.querySelector(
                "#loginButton"
            );


        const loginMessage =
            document.querySelector(
                "#loginMessage"
            );


        function showMessage(
            message,
            type
        ) {

            loginMessage.textContent =
                message;

            loginMessage.className =
                `login-message show ${type}`;

        }


        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    document.querySelector(
                        "#email"
                    ).value.trim();


                const password =
                    document.querySelector(
                        "#password"
                    ).value;


                try {

                    loginButton.disabled =
                        true;

                    loginButton.textContent =
                        "SIGNING IN...";


                    const response =
                        await fetch(
                            `${API_BASE_URL}/auth/login`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                            }
                        );


                    const result =
                        await response.json();


                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.message ||
                            "Invalid email or password."
                        );

                    }


                    /*
                     * JWT TOKEN SAVE
                     */

                    localStorage.setItem(
                        "adminToken",
                        result.token
                    );


                    /*
                     * ADMIN DATA SAVE
                     */

                    if (result.admin) {

                        localStorage.setItem(
                            "adminData",
                            JSON.stringify(
                                result.admin
                            )
                        );

                    }


                    showMessage(
                        "Login successful. Redirecting...",
                        "success"
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "dashboard.html";

                        },
                        500
                    );


                } catch (error) {

                    console.error(
                        "Admin login error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Unable to login. Please try again.",
                        "error"
                    );


                } finally {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "SIGN IN";

                }

            }
        );
