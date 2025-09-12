// Form-Validation Bootstrap
// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    "use strict";

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll(".needs-validation");

    // Loop over them and prevent submission
    Array.from(forms).forEach((form) => {
        form.addEventListener(
            "submit",
            (event) => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add("was-validated");
            },
            false
        );
    });
})();

//For flash in index.ejs
document.addEventListener("DOMContentLoaded", () => {
    const successToastEl = document.getElementById("flashToastSuccess");
    if (successToastEl) {
        new bootstrap.Toast(successToastEl, { delay: 3000 }).show();
    }

    const errorToastEl = document.getElementById("flashToastError");
    if (errorToastEl) {
        new bootstrap.Toast(errorToastEl, { delay: 4000 }).show();
    }
});
