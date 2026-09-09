// =====================================================
// API
// =====================================================

// const API_BASE_URL =
//     "http://localhost:5000/api";
const API_BASE_URL = 'https://make-me-glam.onrender.com/api';

// =====================================================
// AUTHENTICATION
// =====================================================

const adminToken =
    localStorage.getItem("adminToken");


if (!adminToken) {

    window.location.href =
        "index.html";

}


// =====================================================
// ADMIN DATA
// =====================================================

const adminData =
    JSON.parse(
        localStorage.getItem("adminData") || "{}"
    );


if (adminData.name) {

    document.querySelector("#adminName")
        .textContent =
        adminData.name;

}


if (adminData.email) {

    document.querySelector("#adminEmail")
        .textContent =
        adminData.email;

}


// =====================================================
// DATE
// =====================================================

document.querySelector("#currentDate")
    .textContent =
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

document.querySelector("#logoutButton")
    .addEventListener(
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

document.querySelector("#mobileMenuButton")
    .addEventListener(
        "click",
        function () {

            document.querySelector("#sidebar")
                .classList.toggle("open");

        }
    );


// =====================================================
// ELEMENTS
// =====================================================

const galleryModal =
    document.querySelector("#galleryModal");

const galleryForm =
    document.querySelector("#galleryForm");

let editingGalleryId = null;


// =====================================================
// AUTH ERROR HANDLER
// =====================================================

function handleAuthError(response) {

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

        return true;

    }

    return false;

}


// =====================================================
// LOAD GALLERY
// =====================================================

async function loadGallery() {

    const wrapper =
        document.querySelector(
            "#galleryTableWrapper"
        );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/gallery/admin/all`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${adminToken}`

                    }

                }
            );


        const result =
            await response.json();


        if (
            handleAuthError(response)
        ) {

            return;

        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load gallery."
            );

        }


        const gallery =
            result.data || [];


        updateStats(gallery);

        renderGallery(gallery);


    } catch (error) {

        console.error(
            "Load gallery error:",
            error
        );


        wrapper.innerHTML = `

            <div class="empty-state">

                Unable to load gallery.

                <br><br>

                ${escapeHTML(error.message)}

            </div>

        `;

    }

}


// =====================================================
// UPDATE STATS
// =====================================================

function updateStats(gallery) {

    const total =
        gallery.length;


    const active =
        gallery.filter(
            item =>
                item.status === true
        ).length;


    const inactive =
        total - active;


    document.querySelector(
        "#totalGallery"
    ).textContent =
        total;


    document.querySelector(
        "#activeGallery"
    ).textContent =
        active;


    document.querySelector(
        "#inactiveGallery"
    ).textContent =
        inactive;

}


// =====================================================
// RENDER GALLERY
// =====================================================

function renderGallery(gallery) {

    const wrapper =
        document.querySelector(
            "#galleryTableWrapper"
        );


    if (!gallery.length) {

        wrapper.innerHTML = `

            <div class="empty-state">

                No gallery images found.

                <br><br>

                Click "+ Add Image" to create your first gallery image.

            </div>

        `;

        return;

    }


    let rows = "";


    gallery.forEach(
        function (item) {


            const status =
                item.status
                    ? "active"
                    : "inactive";


            const statusText =
                item.status
                    ? "Active"
                    : "Inactive";


            const image =
                item.image_url
                    ? `

                        <img
                            src="${escapeHTML(item.image_url)}"
                            class="gallery-image"
                            alt="${escapeHTML(item.title)}"
                            loading="lazy"
                        >

                    `
                    : `

                        <div class="no-image">
                            No Image
                        </div>

                    `;


            rows += `

                <tr>

                    <td>
                        ${image}
                    </td>


                    <td>

                        <div class="gallery-title">

                            ${escapeHTML(
                                item.title
                            )}

                        </div>

                    </td>


                    <td>

                        <div class="gallery-description">

                            ${
                                escapeHTML(
                                    item.description ||
                                    "No description"
                                )
                            }

                        </div>

                    </td>


                    <td>

                        ${
                            item.category
                                ? `
                                    <span class="category">
                                        ${escapeHTML(
                                            item.category
                                        )}
                                    </span>
                                `
                                : "—"
                        }

                    </td>


                    <td>

                        <span
                            class="status ${status}"
                        >

                            ${statusText}

                        </span>

                    </td>


                    <td>

                        <div class="actions">


                            <button
                                class="action-button"
                                onclick="editGallery(${item.id})"
                            >
                                Edit
                            </button>


                            <button
                                class="action-button"
                                onclick="toggleGalleryStatus(
                                    ${item.id},
                                    ${item.status}
                                )"
                            >

                                ${
                                    item.status
                                        ? "Deactivate"
                                        : "Activate"
                                }

                            </button>


                            <button
                                class="action-button delete"
                                onclick="deleteGallery(${item.id})"
                            >
                                Delete
                            </button>


                        </div>

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
                        Image
                    </th>

                    <th>
                        Title
                    </th>

                    <th>
                        Description
                    </th>

                    <th>
                        Category
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Actions
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
// ADD GALLERY
// =====================================================

document.querySelector("#addGalleryButton")
    .addEventListener(
        "click",
        function () {

            editingGalleryId = null;

            galleryForm.reset();


            document.querySelector(
                "#galleryStatus"
            ).checked = true;


            document.querySelector(
                "#modalTitle"
            ).textContent =
                "Add Gallery Image";


            document.querySelector(
                "#saveGalleryButton"
            ).textContent =
                "Save Image";


            galleryModal.classList.add(
                "show"
            );

        }
    );


// =====================================================
// EDIT GALLERY
// =====================================================

async function editGallery(id) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/gallery/admin/all`,
                {
                    headers: {

                        "Authorization":
                            `Bearer ${adminToken}`

                    }

                }
            );


        const result =
            await response.json();


        if (
            handleAuthError(response)
        ) {

            return;

        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to fetch gallery."
            );

        }


        const item =
            (result.data || []).find(
                galleryItem =>
                    Number(galleryItem.id) ===
                    Number(id)
            );


        if (!item) {

            showToast(
                "Gallery item not found.",
                "error"
            );

            return;

        }


        editingGalleryId =
            item.id;


        document.querySelector(
            "#galleryTitle"
        ).value =
            item.title || "";


        document.querySelector(
            "#galleryImageUrl"
        ).value =
            item.image_url || "";


        document.querySelector(
            "#galleryDescription"
        ).value =
            item.description || "";


        document.querySelector(
            "#galleryCategory"
        ).value =
            item.category || "";


        document.querySelector(
            "#galleryStatus"
        ).checked =
            item.status === true;


        document.querySelector(
            "#modalTitle"
        ).textContent =
            "Edit Gallery Image";


        document.querySelector(
            "#saveGalleryButton"
        ).textContent =
            "Update Image";


        galleryModal.classList.add(
            "show"
        );


    } catch (error) {

        console.error(
            "Edit gallery error:",
            error
        );


        showToast(
            error.message,
            "error"
        );

    }

}


// =====================================================
// SAVE / UPDATE GALLERY
// =====================================================

galleryForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const title =
            document.querySelector(
                "#galleryTitle"
            ).value.trim();


        const image_url =
            document.querySelector(
                "#galleryImageUrl"
            ).value.trim();


        const description =
            document.querySelector(
                "#galleryDescription"
            ).value.trim();


        const category =
            document.querySelector(
                "#galleryCategory"
            ).value.trim();


        const status =
            document.querySelector(
                "#galleryStatus"
            ).checked;


        if (
            !title ||
            !image_url
        ) {

            showToast(
                "Title and image URL are required.",
                "error"
            );

            return;

        }


        const payload = {

            title,

            image_url,

            description,

            category,

            status

        };


        const isEditing =
            editingGalleryId !== null;


        const url =
            isEditing
                ? `${API_BASE_URL}/gallery/admin/${editingGalleryId}`
                : `${API_BASE_URL}/gallery/admin`;


        const method =
            isEditing
                ? "PUT"
                : "POST";


        const saveButton =
            document.querySelector(
                "#saveGalleryButton"
            );


        saveButton.disabled = true;

        saveButton.textContent =
            "Saving...";


        try {

            const response =
                await fetch(
                    url,
                    {

                        method,

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${adminToken}`

                        },

                        body:
                            JSON.stringify(payload)

                    }
                );


            const result =
                await response.json();


            if (
                handleAuthError(response)
            ) {

                return;

            }


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Failed to save gallery image."
                );

            }


            galleryModal.classList.remove(
                "show"
            );


            galleryForm.reset();


            editingGalleryId = null;


            showToast(
                isEditing
                    ? "Gallery image updated successfully."
                    : "Gallery image added successfully.",
                "success"
            );


            await loadGallery();


        } catch (error) {

            console.error(
                "Save gallery error:",
                error
            );


            showToast(
                error.message,
                "error"
            );

        } finally {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Image";

        }

    }
);


// =====================================================
// TOGGLE STATUS
// =====================================================

async function toggleGalleryStatus(
    id,
    currentStatus
) {

    const newStatus =
        !currentStatus;


    const confirmation =
        confirm(
            newStatus
                ? "Activate this gallery image?"
                : "Deactivate this gallery image?"
        );


    if (!confirmation) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/gallery/admin/${id}/status`,
                {

                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${adminToken}`

                    },

                    body:
                        JSON.stringify({
                            status: newStatus
                        })

                }
            );


        const result =
            await response.json();


        if (
            handleAuthError(response)
        ) {

            return;

        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to update status."
            );

        }


        showToast(
            result.message,
            "success"
        );


        await loadGallery();


    } catch (error) {

        console.error(
            "Toggle gallery status error:",
            error
        );


        showToast(
            error.message,
            "error"
        );

    }

}


// =====================================================
// DELETE GALLERY
// =====================================================

async function deleteGallery(id) {

    const confirmation =
        confirm(
            "Are you sure you want to permanently delete this gallery image?"
        );


    if (!confirmation) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/gallery/admin/${id}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${adminToken}`

                    }

                }
            );


        const result =
            await response.json();


        if (
            handleAuthError(response)
        ) {

            return;

        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to delete gallery image."
            );

        }


        showToast(
            result.message,
            "success"
        );


        await loadGallery();


    } catch (error) {

        console.error(
            "Delete gallery error:",
            error
        );


        showToast(
            error.message,
            "error"
        );

    }

}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeGalleryModal() {

    galleryModal.classList.remove(
        "show"
    );

    galleryForm.reset();

    editingGalleryId = null;

}


document.querySelector(
    "#closeModalButton"
).addEventListener(
    "click",
    closeGalleryModal
);


document.querySelector(
    "#cancelModalButton"
).addEventListener(
    "click",
    closeGalleryModal
);


galleryModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === galleryModal
        ) {

            closeGalleryModal();

        }

    }
);


// =====================================================
// TOAST
// =====================================================

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.querySelector(
            "#toast"
        );


    toast.textContent =
        message;


    toast.className =
        `toast ${type} show`;


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

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


// =====================================================
// INITIAL LOAD
// =====================================================

loadGallery();
