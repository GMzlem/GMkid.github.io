window.addEventListener('scroll', () => {
    console.log(document.documentElement.scrollTop, "b")
    if (
        document.documentElement.scrollTop > 20
    ) {
        document.getElementById('btn-back-to-top').style.display = 'flex';
    } else {
        document.getElementById('btn-back-to-top').style.display = 'none';
    }
    if (
        document.documentElement.scrollTop > 750
    ) {
        document.getElementById('hiddenNavbarMenu').style.display = 'flex';
        document.getElementById('navbar').style.display = 'none'
    } else {
        document.getElementById('hiddenNavbarMenu').style.display = 'none';
        document.getElementById('navbar').style.display = 'flex'
    }
});

// setInterval(() => {
//     let date = new Date();
//     let month = date.getMonth() +1;
//     if (month == 3 || month == 4 || month == 5) {
//         document.getElementById('spring').style.display = 'flex'
//         document.getElementById('summer').style.display = 'none'
//         document.getElementById('fall').style.display = 'none'
//         document.getElementById('winter').style.display = 'none'
//     }
//     else if (month == 6 || month == 7 || month == 8) {
//         document.getElementById('spring').style.display = 'none'
//         document.getElementById('summer').style.display = 'flex'
//         document.getElementById('fall').style.display = 'none'
//         document.getElementById('winter').style.display = 'none'
//     }
//     else if (month == 9 || month == 10 || month == 11) {
//         document.getElementById('spring').style.display = 'none'
//         document.getElementById('summer').style.display = 'none'
//         document.getElementById('fall').style.display = 'flex'
//         document.getElementById('winter').style.display = 'none'
//     }
//     else if (month == 12 || month == 1 || month == 2) {
//         document.getElementById('spring').style.display = 'none'
//         document.getElementById('summer').style.display = 'none'
//         document.getElementById('fall').style.display = 'none'
//         document.getElementById('winter').style.display = 'flex'
//     }
// }, 1000)

let index = 0;

const moveImage = (to) => {

    console.log(`${index}`)

    if (isNaN(+to)) return;

    index = to - 1;

    images.style.left = `calc(1300px * -${index})`;
}

const nextImage = () => {
    index = ++index % 4;
    moveImage(index + 1);
    clearInterval(interval)
}

const prevImage = () => {
    index = --index % 4;
    index = index < 0 ? 4 + index : index;
    moveImage(index + 1);
}

let interval = setInterval

interval(() => {
    nextImage()
}, 5000)