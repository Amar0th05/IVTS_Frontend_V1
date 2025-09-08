function showDeleteMessage(docName) {
    Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${docName} deleted successfully`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
}

async function showDeleteMessage(message) {
    const result = await Swal.fire({
        title: message,
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    return result.isConfirmed; // true if confirmed
}



// function  {
//     Swal.fire({
//         icon: 'success',
//         title: 'Submitted!',
//         text: `${formName} submitted successfully`,
//         showConfirmButton: false,
//         timer: 2000,
//         timerProgressBar: true
//     });
// }
